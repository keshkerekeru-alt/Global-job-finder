import type { JobSearchInput } from "./providers.js";
import { searchProviders } from "./providers.js";

export async function searchGlobalJobs(input: JobSearchInput) {
  const result = await searchProviders(input);
  const notice = result.jobs.length
    ? `Found ${result.jobs.length} job listings from ${result.providers.join(" and ")}. Check each source link and confirm details with the employer. Visa wording is only a text signal, not a sponsorship guarantee.`
    : result.configured
      ? `No matching vacancies were returned by the configured providers. ${result.errors.join("; ") || "Try broader keywords, another country, or a different page."}`
      : "Live job sources are not configured yet. Add ADZUNA_APP_ID and ADZUNA_APP_KEY (and/or JOOBLE_API_KEY) in the hosting environment before using live global search. No sample or fabricated vacancies are returned.";
  return {
    query: input.keywords,
    results: result.jobs.map(job => ({
      id: job.id, title: job.title, employer: job.employer, country: job.country,
      location: job.location, url: job.url, source: job.source,
      description: job.description, salary: job.salary,
      employment_type: job.employment_type, visa_evidence: job.visa_evidence,
      retrieved_at: job.retrieved_at
    })),
    providers_used: result.providers,
    providers_configured: result.configured,
    notice
  };
}
