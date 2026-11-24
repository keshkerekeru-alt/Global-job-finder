type SourceRecord = {
  id: number; country: string; source_name: string; source_url: string;
  source_kind: "public_employment_service" | "government_job_portal" | "regional_network" | "employer_career_page" | "licensed_recruitment_agency";
  source_scope: string; language_codes: string[]; notes: string;
  verification_status: string; last_verified_at: string | null;
};

export type VerifiedVacancyInput = {
  title: string;
  employer_name: string;
  country: string;
  city?: string;
  employer_url?: string;
  source_id?: number;
  source_name: string;
  source_url: string;
  canonical_url: string;
  discovery_url?: string;
  vacancy_status: "open" | "closed" | "expired" | "unknown";
  employment_type?: string;
  salary_text?: string;
  requirements_text?: string;
  description_excerpt?: string;
  published_at?: string;
  closing_date?: string;
  international_applicants_status: "confirmed" | "not_confirmed" | "restricted" | "not_stated" | "unclear";
  visa_support_status: "confirmed" | "not_offered" | "not_stated" | "unclear" | "not_applicable";
  evidence_url?: string;
};

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Shared catalog is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the server environment.");
  return { url: url.replace(/\/$/, ""), key };
}

async function request(path: string, init: RequestInit = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Shared catalog: HTTP ${response.status} ${detail}`);
  }
  return response.status === 204 ? [] : response.json();
}

export async function listSharedSources(countries?: string[]) {
  const params = new URLSearchParams({
    select: "id,country,source_name,source_url,source_kind,source_scope,language_codes,notes,verification_status,last_verified_at",
    is_active: "eq.true",
    verification_status: "eq.verified",
    order: "country.asc,source_name.asc",
    limit: "500"
  });
  if (countries?.length) params.set("country", `in.(${countries.map(v => JSON.stringify(v)).join(",")})`);
  const rows = await request(`official_job_sources?${params.toString()}`) as SourceRecord[];
  return {
    sources: rows.map(row => ({
      country: row.country, name: row.source_name, url: row.source_url,
      kind: row.source_kind, scope: row.source_scope, languages: row.language_codes,
      notes: row.notes, last_verified_at: row.last_verified_at
    })),
    matched_countries: [...new Set(rows.filter(row => row.source_scope !== "regional").map(row => row.country))],
    note: "Sources are read from the shared global database. This directory is growing; it is not a live vacancy feed. Verify each original vacancy and current work-authorization conditions."
  };
}

export async function saveVerifiedVacancy(input: VerifiedVacancyInput) {
  const url = new URL(input.canonical_url);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("canonical_url must be an HTTP(S) URL.");
  const now = new Date().toISOString();
  const payload = {
    ...input,
    title: input.title.trim(),
    employer_name: input.employer_name.trim(),
    country: input.country.trim(),
    source_name: input.source_name.trim(),
    source_url: input.source_url,
    canonical_url: url.toString(),
    verification_status: "verified",
    last_checked_at: now,
    last_seen_at: now,
    updated_at: now
  };
  const rows = await request("job_vacancies?on_conflict=canonical_url", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(payload)
  }) as Array<{ id: number; canonical_url: string }>;
  return {
    saved: true,
    vacancy_id: rows[0]?.id ?? null,
    canonical_url: rows[0]?.canonical_url ?? url.toString(),
    message: "Verified vacancy saved to the shared global catalog. Other users may discover it, but it must be rechecked before being presented as currently open."
  };
}

export async function searchSharedVacancies(country?: string, keywords?: string, limit = 25) {
  const checkedSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const params = new URLSearchParams({
    select: "id,title,employer_name,employer_url,country,city,source_name,source_url,canonical_url,vacancy_status,employment_type,salary_text,requirements_text,published_at,closing_date,international_applicants_status,visa_support_status,evidence_url,last_checked_at",
    verification_status: "eq.verified",
    vacancy_status: "eq.open",
    last_checked_at: `gte.${checkedSince}`,
    order: "last_checked_at.desc",
    limit: String(Math.max(1, Math.min(limit, 50)))
  });
  if (country) params.set("country", `ilike.*${country.replace(/[,*()]/g, " ")}*`);
  if (keywords?.trim()) {
    const q = keywords.trim().replace(/[,*()]/g, " ").slice(0, 100);
    params.set("or", `(title.ilike.*${q}*,employer_name.ilike.*${q}*,requirements_text.ilike.*${q}*)`);
  }
  const rows = await request(`job_vacancies?${params.toString()}`) as Array<Record<string, unknown>>;
  return {
    vacancies: rows,
    count: rows.length,
    note: "These are previously verified records from the shared catalog, checked within the last 30 days. Reopen each original source before relying on its current availability or visa details."
  };
}
