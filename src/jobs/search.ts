import type { JobSearchInput } from "./providers.js";
import { searchProviders } from "./providers.js";
import { searchRestrictionReports } from "./experiences.js";

export async function searchGlobalJobs(input: JobSearchInput) {
  const [result, community] = await Promise.all([
    searchProviders(input),
    searchRestrictionReports(input.origin_country, (input.countries ?? []).join(",") || undefined).catch(() => ({
      reports: [], count: 0,
      note: "Community restriction reports are currently unavailable; vacancy search can continue without them."
    }))
  ]);
  const notice = result.jobs.length
    ? `Found ${result.jobs.length} job listings from ${result.providers.join(" and ")}. Check original source pages. Visa wording is evidence only, not a sponsorship guarantee.`
    : result.configured
      ? `No matching vacancies were returned. ${result.errors.join("; ") || "Try broader keywords, another country, or another page."}`
      : "Live search is not configured. Add TAVILY_API_KEY for general web search and/or Adzuna and Jooble credentials for job-board APIs. No sample vacancies are fabricated.";
  return {
    query: input.keywords,
    results: result.jobs.map(job => ({
      id: job.id, title: job.title, employer: job.employer, country: job.country,
      location: job.location, url: job.url, source: job.source, description: job.description,
      salary: job.salary, employment_type: job.employment_type, visa_evidence: job.visa_evidence,
      retrieved_at: job.retrieved_at
    })),
    providers_used: result.providers,
    providers_configured: result.configured,
    notice,
    community_reports: community.reports,
    community_note: community.note
  };
}
