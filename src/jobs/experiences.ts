type ExperienceInput = {
  origin_country: string; destination_country: string; employer_name: string;
  outcome: "rejected" | "accepted" | "no_response";
  reason?: string; visa_support?: "yes" | "no" | "unclear"; notes?: string; source_url?: string;
};

export type RestrictionReportInput = {
  employer_name: string;
  employer_url?: string;
  vacancy_url?: string;
  refused_applicant_country: string;
  job_country: string;
  report_date: string;
  outcome: "nationality_not_accepted" | "no_work_permit_support" | "no_visa_sponsorship" | "permit_already_required" | "role_filled" | "other";
  scope: "specific_vacancy" | "company_policy" | "unclear";
  evidence_type: "employer_email" | "official_vacancy_page" | "recruiter_message" | "phone_call" | "user_observation";
  evidence_excerpt_redacted?: string;
  details?: string;
  consent_to_share: true;
};

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Community storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  return { url: url.replace(/\/$/, ""), key };
}

async function request(path: string, init: RequestInit = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Community database: HTTP ${response.status}`);
  return response.status === 204 ? [] : response.json();
}

export async function submitExperience(input: ExperienceInput) {
  const rows = await request("job_experiences", {
    method: "POST", headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...input, status: "pending", employer_name: input.employer_name.trim(), origin_country: input.origin_country.trim(), destination_country: input.destination_country.trim() })
  }) as Array<{ id: number }>;
  return { submitted: true, report_id: rows[0]?.id ?? null, status: "pending_review", message: "Report saved for moderation. It will be visible to other users only after approval." };
}

export async function submitRestrictionReport(input: RestrictionReportInput) {
  const rows = await request("employer_restriction_reports", {
    method: "POST", headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      ...input,
      employer_name: input.employer_name.trim(),
      refused_applicant_country: input.refused_applicant_country.trim(),
      job_country: input.job_country.trim(),
      moderation_status: "pending",
      evidence_status: "unverified"
    })
  }) as Array<{ id: number }>;
  return { submitted: true, report_id: rows[0]?.id ?? null, status: "pending_review", message: "Country restriction report saved privately for moderation. Only approved, redacted information can help other users." };
}

export async function searchExperiences(origin_country?: string, destination_country?: string, employer_name?: string) {
  const params = new URLSearchParams({ select: "origin_country,destination_country,employer_name,outcome,reason,visa_support,notes,source_url,created_at", status: "eq.approved", order: "created_at.desc", limit: "30" });
  if (origin_country) params.set("origin_country", `ilike.*${origin_country}*`);
  if (destination_country) params.set("destination_country", `ilike.*${destination_country}*`);
  if (employer_name) params.set("employer_name", `ilike.*${employer_name}*`);
  const rows = await request(`job_experiences?${params.toString()}`) as unknown[];
  return { reports: rows, count: rows.length, note: "Approved community experiences only. Anecdotal reports do not prove current employer policy." };
}

export async function searchRestrictionReports(refused_applicant_country?: string, job_country?: string, employer_name?: string) {
  const params = new URLSearchParams({
    select: "id,employer_name,employer_url,vacancy_url,refused_applicant_country,job_country,report_date,outcome,scope,evidence_type,evidence_excerpt_redacted,details,evidence_status,moderation_status,created_at",
    moderation_status: "eq.approved",
    order: "report_date.desc",
    limit: "50"
  });
  if (refused_applicant_country) params.set("refused_applicant_country", `ilike.*${refused_applicant_country}*`);
  if (job_country) params.set("job_country", `ilike.*${job_country}*`);
  if (employer_name) params.set("employer_name", `ilike.*${employer_name}*`);
  const rows = await request(`employer_restriction_reports?${params.toString()}`) as Array<{ report_date: string; evidence_status: string }>;
  const now = Date.now();
  const reports = rows.map(row => ({
    ...row,
    possibly_outdated: now - new Date(row.report_date).getTime() > 180 * 24 * 60 * 60 * 1000
  }));
  return {
    reports,
    count: reports.length,
    note: "Only approved reports are shown. A report is evidence of one reported experience, not a universal employer policy or immigration rule. Reports older than 180 days are marked possibly_outdated."
  };
}
