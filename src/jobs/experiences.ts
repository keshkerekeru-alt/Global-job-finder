type ExperienceInput = {
  origin_country: string;
  destination_country: string;
  employer_name: string;
  outcome: "rejected" | "accepted" | "no_response";
  reason?: string;
  visa_support?: "yes" | "no" | "unclear";
  notes?: string;
  source_url?: string;
};

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Community experience storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  return { url: url.replace(/\/$/, ""), key };
}

async function request(path: string, init: RequestInit = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...(init.headers ?? {})
    },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Community database: HTTP ${response.status}`);
  return response.status === 204 ? [] : response.json();
}

export async function submitExperience(input: ExperienceInput) {
  const rows = await request("job_experiences", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      ...input,
      status: "pending",
      employer_name: input.employer_name.trim(),
      origin_country: input.origin_country.trim(),
      destination_country: input.destination_country.trim()
    })
  }) as Array<{ id: number; status: string }>;
  return {
    submitted: true,
    report_id: rows[0]?.id ?? null,
    status: "pending_review",
    message: "Thanks. The report is saved for review and will only help other users after moderation."
  };
}

export async function searchExperiences(origin_country?: string, destination_country?: string, employer_name?: string) {
  const params = new URLSearchParams({
    select: "origin_country,destination_country,employer_name,outcome,reason,visa_support,notes,source_url,created_at",
    status: "eq.approved",
    order: "created_at.desc",
    limit: "30"
  });
  if (origin_country) params.set("origin_country", `ilike.*${origin_country}*`);
  if (destination_country) params.set("destination_country", `ilike.*${destination_country}*`);
  if (employer_name) params.set("employer_name", `ilike.*${employer_name}*`);
  const rows = await request(`job_experiences?${params.toString()}`) as unknown[];
  return { reports: rows, count: rows.length, note: "Only community reports approved by moderation are shown. Reports are anecdotal and do not prove current employer policy." };
}
