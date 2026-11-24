import type { JobSearchInput } from "./providers.js";
import { searchProviders } from "./providers.js";
import { searchRestrictionReports } from "./experiences.js";

export async function searchGlobalJobs(input: JobSearchInput) {
  const [result, communityByCountry] = await Promise.all([
    searchProviders(input),
    Promise.all((input.countries?.length ? input.countries : [undefined]).map(country =>
      searchRestrictionReports(input.origin_country, country).catch(() => ({
        reports: [], count: 0,
        note: "Community restriction reports are currently unavailable; vacancy search can continue without them."
      }))
    ))
  ]);
  const reportMap = new Map<string, (typeof communityByCountry)[number]["reports"][number]>();
  for (const group of communityByCountry) for (const report of group.reports) reportMap.set(String(report.id), report);
  const communityReports = [...reportMap.values()];
  const communityNote = communityByCountry.every(group => group.count === 0) && communityByCountry.some(group => group.note.includes("unavailable"))
    ? "Community restriction reports are currently unavailable; vacancy search can continue without them."
    : "Approved, redacted community reports are shown as dated signals only. A single report is not a universal employer policy.";
  const notice = result.jobs.length
    ? `Found ${result.jobs.length} job listings from ${result.providers.join(" and ")}. Check original source pages. Visa wording is evidence only, not a sponsorship guarantee.`
    : result.configured
      ? `No matching vacancies were returned. ${result.errors.join("; ") || "Try broader keywords, another country, or another page."}`
      : "Live job-board search is not configured. Configure Adzuna and/or regional Jooble API credentials, or use ChatGPT web search separately. No sample vacancies are fabricated.";
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
    community_reports: communityReports,
    community_note: communityNote
  };
}
