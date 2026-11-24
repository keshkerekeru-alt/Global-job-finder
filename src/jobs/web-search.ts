import type { JobSearchInput, GlobalJob } from "./providers.js";

export async function searchWebJobs(input: JobSearchInput, limit: number): Promise<GlobalJob[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];
  const destinations = (input.countries ?? []).join(", ");
  const baseTerms = [input.keywords, input.category, destinations, input.location,
    input.visa_sponsorship === "required" ? '"visa sponsorship" OR "work permit support"' : ""].filter(Boolean).join(" ");
  const queries = [
    `${baseTerms} jobs vacancies careers`,
    `${baseTerms} official employer careers job vacancies public employment service EURES government job portal`
  ];
  const responses = await Promise.all(queries.map(async query => {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ query, topic: "general", search_depth: "advanced", max_results: Math.min(limit, 20), include_answer: false, include_raw_content: true }),
      signal: AbortSignal.timeout(18000)
    });
    if (!response.ok) throw new Error(`Web search: HTTP ${response.status}`);
    return response.json() as Promise<{ results?: Array<{ title?: string; url?: string; content?: string; raw_content?: string }> }>;
  }));
  const now = new Date().toISOString();
  const unique = new Map<string, GlobalJob>();
  for (const response of responses) for (const item of response.results ?? []) {
    const url = String(item.url ?? "");
    if (!/^https?:\/\//i.test(url)) continue;
    const normalizedUrl = url.toLowerCase().replace(/\/$/, "");
    const description = String(item.raw_content || item.content || "").slice(0, 1800);
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (!unique.has(normalizedUrl)) unique.set(normalizedUrl, {
      id: `web:${url}`, title: String(item.title ?? "Web search result"),
      employer: "See source", country: destinations || "Not specified",
      location: input.location || destinations || "Not specified", url,
      source: `General web search: ${host}`, description, salary: "", employment_type: "Not stated",
      visa_evidence: /visa sponsorship|work permit support|sponsor(?:ship|ing)? a work visa/i.test(description)
        ? "Search result mentions visa/work-permit support; confirm on the original employer page."
        : "No explicit visa-sponsorship statement detected in the returned page text.",
      retrieved_at: now
    });
  }
  return [...unique.values()].slice(0, limit);
}
