export type JobSearchInput = {
  keywords: string;
  countries?: string[];
  origin_country?: string;
  location?: string;
  category?: string;
  employment_type?: string;
  visa_sponsorship?: "required" | "preferred" | "any";
  page?: number;
  limit?: number;
};

export type GlobalJob = {
  id: string;
  title: string;
  employer: string;
  country: string;
  location: string;
  url: string;
  source: string;
  description: string;
  salary: string;
  employment_type: string;
  visa_evidence: string;
  retrieved_at: string;
};

const ADZUNA_COUNTRIES: Record<string, string> = {
  australia: "au", austria: "at", belgium: "be", brazil: "br", canada: "ca",
  germany: "de", france: "fr", india: "in", ireland: "ie", italy: "it",
  mexico: "mx", netherlands: "nl", newzealand: "nz", "new zealand": "nz",
  poland: "pl", singapore: "sg", southafrica: "za", "south africa": "za",
  spain: "es", sweden: "se", switzerland: "ch", unitedkingdom: "gb",
  "united kingdom": "gb", uk: "gb", usa: "us", "united states": "us",
  "united states of america": "us"
};

function normalizeCountry(value: string) {
  return value.toLowerCase().replace(/[.,]/g, "").replace(/\s+/g, " ").trim();
}

function visaEvidence(description: string) {
  const text = description.toLowerCase();
  const negative = /no (?:visa )?sponsorship|unable to sponsor|cannot sponsor|visa sponsorship (?:is )?not available|must have (?:the )?right to work|right to work required|valid work authori[sz]ation required/.test(text);
  if (!negative && /visa sponsorship|sponsor(?:ship|ing)? (?:a |the )?work visa|work permit sponsorship|sponsorship available|will sponsor (?:a )?visa/.test(text)) {
    return "Employer wording mentions visa/work-permit sponsorship; verify directly with employer.";
  }
  if (negative) {
    return "The listing mentions existing work authorization or no sponsorship; inspect the exact wording.";
  }
  return "No explicit visa-sponsorship statement detected in the returned description.";
}

function toJob(raw: any, source: string, countryFallback = ""): GlobalJob | null {
  const title = String(raw.title ?? raw.position ?? "").trim();
  const url = String(raw.redirect_url ?? raw.link ?? raw.url ?? "").trim();
  if (!title || !url || !/^https?:\/\//i.test(url)) return null;
  const description = String(raw.description ?? raw.snippet ?? "").slice(0, 1800);
  const location = typeof raw.location === "string"
    ? raw.location
    : [raw.location?.display_name, raw.location?.city, raw.location?.area?.join?.(", ")].filter(Boolean).join(", ");
  const salary = raw.salary_min || raw.salary_max
    ? [raw.salary_min, raw.salary_max].filter(Boolean).join("–") + (raw.salary_is_predicted ? " (estimated)" : "")
    : String(raw.salary ?? "");
  return {
    id: source.toLowerCase() + ":" + (raw.id ?? url),
    title,
    employer: String(raw.company?.display_name ?? (typeof raw.company === "string" ? raw.company : raw.employer) ?? "Not provided"),
    country: String(raw.country ?? countryFallback),
    location: String(location || countryFallback || "Not provided"),
    url,
    source,
    description,
    salary,
    employment_type: String(raw.contract_type ?? raw.contractTime ?? raw.employment_type ?? "Not provided"),
    visa_evidence: visaEvidence(description),
    retrieved_at: new Date().toISOString()
  };
}

async function searchAdzuna(input: JobSearchInput, countries: string[], limit: number): Promise<GlobalJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];
  const searchCountries = countries.length
    ? countries
    : ["United Kingdom", "United States", "Canada", "Australia", "Germany"];
  const countryCodes = searchCountries.map(name => ADZUNA_COUNTRIES[normalizeCountry(name)]).filter(Boolean).slice(0, 8);
  if (!countryCodes.length) return [];
  const groups = await Promise.all(countryCodes.map(async code => {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: String(limit),
      what: [input.keywords, input.category].filter(Boolean).join(" "),
      content_type: "application/json"
    });
    if (input.location && countryCodes.length === 1) params.set("where", input.location);
    const response = await fetch(`https://api.adzuna.com/v1/api/jobs/${code}/search/${input.page ?? 1}?${params}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) throw new Error(`Adzuna ${code}: HTTP ${response.status}`);
    const data = await response.json() as { results?: any[] };
    const countryName = searchCountries.find(name => ADZUNA_COUNTRIES[normalizeCountry(name)] === code) ?? code.toUpperCase();
    return (data.results ?? []).map(item => toJob(item, "Adzuna", countryName)).filter(Boolean) as GlobalJob[];
  }));
  return groups.flat();
}

const JOOBLE_DOMAINS: Record<string, string> = {
  au: "au", at: "at", be: "be", ca: "ca", de: "de", fr: "fr", ie: "ie",
  it: "it", nl: "nl", nz: "nz", pl: "pl", sg: "sg", za: "za", es: "es",
  se: "se", ch: "ch", gb: "uk", us: ""
};

function joobleKeys(): Record<string, string> {
  const raw = process.env.JOOBLE_API_KEYS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return Object.fromEntries(Object.entries(parsed)
        .filter(([country, key]) => /^[a-z]{2}$/i.test(country) && typeof key === "string" && key.trim())
        .map(([country, key]) => [country.toLowerCase(), String(key).trim()]));
    } catch {
      return {};
    }
  }
  // Backward compatibility: the unqualified key is the Jooble US key only.
  return process.env.JOOBLE_API_KEY ? { us: process.env.JOOBLE_API_KEY } : {};
}

async function searchJooble(input: JobSearchInput, countries: string[], limit: number): Promise<GlobalJob[]> {
  const keys = joobleKeys();
  const requested = countries.length ? countries : [input.location ?? "United States"];
  const targets = requested.map(name => {
    const code = ADZUNA_COUNTRIES[normalizeCountry(name)];
    if (!code || !keys[code]) return null;
    const domain = JOOBLE_DOMAINS[code];
    if (domain === undefined) return null;
    return { name, code, domain, key: keys[code] };
  }).filter((item): item is { name: string; code: string; domain: string; key: string } => item !== null).slice(0, 8);

  const groups = await Promise.all(targets.map(async target => {
    const host = target.domain ? `${target.domain}.jooble.org` : "jooble.org";
    const response = await fetch(`https://${host}/api/${encodeURIComponent(target.key)}`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        keywords: [input.keywords, input.category].filter(Boolean).join(" "),
        location: input.location || target.name,
        page: input.page ?? 1,
        ResultOnPage: limit
      }),
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) throw new Error(`Jooble ${target.code.toUpperCase()}: HTTP ${response.status}`);
    const data = await response.json() as { jobs?: any[] };
    return (data.jobs ?? []).map(item => toJob(item, "Jooble", target.name)).filter(Boolean) as GlobalJob[];
  }));
  return groups.flat();
}

export async function searchProviders(input: JobSearchInput) {
  const countries = input.countries ?? [];
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 20);
  const providers: string[] = [];
  const jobs: GlobalJob[] = [];
  const errors: string[] = [];
  const tasks: Array<{ name: string; run: () => Promise<GlobalJob[]> }> = [];

  if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) {
    tasks.push({ name: "Adzuna", run: () => searchAdzuna(input, countries, limit) });
  }
  if (Object.keys(joobleKeys()).length > 0) {
    tasks.push({ name: "Jooble", run: () => searchJooble(input, countries, limit) });
  }

  const settled = await Promise.allSettled(tasks.map(task => task.run()));
  settled.forEach((item, index) => {
    if (item.status === "fulfilled") {
      providers.push(tasks[index].name);
      jobs.push(...item.value);
    } else {
      errors.push(`${tasks[index].name}: ${item.reason instanceof Error ? item.reason.message : "provider request failed"}`);
    }
  });

  const unique = new Map<string, GlobalJob>();
  for (const job of jobs) {
    const key = job.url.toLowerCase().replace(/\/$/, "");
    if (!unique.has(key)) unique.set(key, job);
  }

  let selected = [...unique.values()];
  if (input.employment_type && input.employment_type !== "any") {
    const wanted = input.employment_type.replace(/-/g, " ");
    selected = selected.filter(job => {
      const typeText = `${job.employment_type} ${job.title} ${job.description}`.toLowerCase();
      if (wanted === "full time") return /full[ -]?time|permanent/i.test(typeText) || job.employment_type === "Not provided";
      if (wanted === "part time") return /part[ -]?time/i.test(typeText) || job.employment_type === "Not provided";
      if (wanted === "seasonal") return /seasonal|season|harvest/i.test(typeText) || job.employment_type === "Not provided";
      if (wanted === "temporary") return /temporary|temp\b|seasonal/i.test(typeText) || job.employment_type === "Not provided";
      if (wanted === "contract") return /contract|fixed.term|freelance/i.test(typeText) || job.employment_type === "Not provided";
      if (wanted === "internship") return /intern(ship)?|trainee/i.test(typeText) || job.employment_type === "Not provided";
      return true;
    });
  }

  if (input.visa_sponsorship === "required") {
    selected = selected.filter(job => job.visa_evidence.startsWith("Employer wording mentions"));
  } else if (input.visa_sponsorship === "preferred") {
    selected.sort((a, b) =>
      Number(b.visa_evidence.startsWith("Employer wording mentions")) -
      Number(a.visa_evidence.startsWith("Employer wording mentions"))
    );
  }

  return { jobs: selected.slice(0, limit), providers, configured: tasks.length > 0, errors };
}
