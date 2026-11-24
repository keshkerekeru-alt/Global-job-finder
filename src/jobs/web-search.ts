import type { JobSearchInput, GlobalJob } from "./providers.js";

export async function searchWebJobs(input: JobSearchInput, limit: number): Promise<GlobalJob[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];
  const destinations = (input.countries ?? []).join(", ");
  const query = [
    input.keywords,
    input.category,
    "jobs vacancies careers",
    destinations,
    input.location,
    input.visa_sponsorship === "required" ? '"visa sponsorship" OR "work permit support"' : ""
  ].filter(Boolean).join(" ");

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      accept: "application/json"
    },
    body: JSON.stringify({
      query,
      topic: "general",
      search_depth: "advanced",
      max_results: Math.min(limit, 20),
      include_answer: false,
      include_raw_content: false
    }),
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`Web search: HTTP ${response.status}`);
  const data = await response.json() as { results?: Array<{ title?: string; url?: string; content?: string; score?: number }> };
  const now = new Date().toISOString();
  return (data.results ?? []).flatMap((item, index) => {
    const url = String(item.url ?? "");
    if (!/^https?:\/\//i.test(url)) return [];
    const description = String(item.content ?? "").slice(0, 1800);
    return [{
      id: `web:${url}`,
      title: String(item.title ?? "Web search result"),
      employer: "See source",
      country: destinations || "Not specified",
      location: input.location ?? destinations ?? "Not specified",
      url,
      source: "Web search",
      description,
      salary: "",
      employment_type: "Not stated",
      visa_evidence: /visa sponsorship|work permit support|sponsor(?:ship|ing)? a work visa/i.test(description)
        ? "Search snippet mentions visa/work-permit support; verify on the original page."
        : "No explicit visa-sponsorship statement detected in the search snippet.",
      retrieved_at: now
    } satisfies GlobalJob];
  });
}
