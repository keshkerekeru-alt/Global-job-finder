export type OfficialJobSource = {
  country: string;
  name: string;
  url: string;
  kind: "public_employment_service" | "government_job_portal" | "regional_network";
  notes: string;
};

const EUROPEAN_SOURCES: OfficialJobSource[] = [
  {
    country: "Europe",
    name: "EURES – European Job Mobility Portal",
    url: "https://eures.europa.eu/",
    kind: "regional_network",
    notes: "Official EU employment-mobility network covering 31 EURES countries. Non-EU applicants must still meet each destination country's work-permit rules."
  },
  {
    country: "Europe",
    name: "European Public Employment Services directory",
    url: "https://employment-social-affairs.ec.europa.eu/policies-and-activities/coordination-employment-and-social-policies/european-network-public-employment-services-pes-network/public-employment-services_en",
    kind: "regional_network",
    notes: "European Commission directory of national public employment services; use it to locate the competent official service."
  }
];

const COUNTRY_SOURCES: OfficialJobSource[] = [
  { country: "Australia", name: "Workforce Australia – Find a job", url: "https://www.workforceaustralia.gov.au/individuals/jobs", kind: "government_job_portal", notes: "Australian Government employment service. Check visa and work-right requirements on the vacancy and official immigration site." },
  { country: "Belgium", name: "VDAB – Find a job (Flanders)", url: "https://www.vdab.be/vindeenjob", kind: "public_employment_service", notes: "Public employment service for Flanders; Belgium also has regional services for Brussels and Wallonia." },
  { country: "Bulgaria", name: "Employment Agency", url: "https://www.az.government.bg/", kind: "public_employment_service", notes: "Bulgarian national Employment Agency; vacancy search and services may be primarily in Bulgarian." },
  { country: "Canada", name: "Job Bank", url: "https://www.jobbank.gc.ca/home", kind: "government_job_portal", notes: "Government of Canada job portal. Use its foreign-candidate and temporary foreign worker information; a listing alone does not guarantee LMIA or a work permit." },
  { country: "Croatia", name: "Croatian Employment Service – Job vacancies", url: "https://burzarada.hzz.hr/", kind: "public_employment_service", notes: "Official Croatian Employment Service vacancy portal; check the employer's ability to hire non-EU nationals." },
  { country: "Denmark", name: "Jobnet", url: "https://job.jobnet.dk/", kind: "public_employment_service", notes: "Official Danish public employment portal; some functions and listings may require Danish-language navigation." },
  { country: "Estonia", name: "Estonian Unemployment Insurance Fund", url: "https://www.tootukassa.ee/en", kind: "public_employment_service", notes: "Official public employment service; follow its job-vacancy section." },
  { country: "Finland", name: "Job Market Finland", url: "https://tyomarkkinatori.fi/en", kind: "public_employment_service", notes: "Official Finnish employment service portal; confirm residence and work-permit requirements with Migri." },
  { country: "France", name: "France Travail – Job offers", url: "https://www.francetravail.fr/accueil/offres%20d%27emploi", kind: "public_employment_service", notes: "Official French public employment service vacancy search; many listings are in French." },
  { country: "Germany", name: "Federal Employment Agency – Job search", url: "https://www.arbeitsagentur.de/jobsuche/", kind: "public_employment_service", notes: "Official German Federal Employment Agency job search. Make it in Germany provides separate information for international applicants." },
  { country: "India", name: "National Career Service", url: "https://www.ncs.gov.in/", kind: "government_job_portal", notes: "Government of India employment and career portal." },
  { country: "Ireland", name: "JobsIreland", url: "https://jobsireland.ie/", kind: "government_job_portal", notes: "Irish public employment service job-matching portal." },
  { country: "Japan", name: "Hello Work Internet Service", url: "https://www.hellowork.mhlw.go.jp/", kind: "public_employment_service", notes: "Japanese Ministry of Health, Labour and Welfare job-search service; much of the interface is Japanese." },
  { country: "Latvia", name: "State Employment Agency – CV and vacancies", url: "https://cvvp.nva.gov.lv/", kind: "public_employment_service", notes: "Official Latvian State Employment Agency vacancy portal." },
  { country: "Lithuania", name: "Employment Service of Lithuania", url: "https://uzt.lt/", kind: "public_employment_service", notes: "Official Lithuanian Employment Service; use its vacancy search section." },
  { country: "Netherlands", name: "Werk.nl – Vacancies", url: "https://www.werk.nl/werkzoekenden/vacatures/", kind: "public_employment_service", notes: "UWV public employment service vacancy portal; some services may require a Dutch DigiD account." },
  { country: "Norway", name: "NAV Arbeidsplassen – Vacancies", url: "https://arbeidsplassen.nav.no/stillinger", kind: "public_employment_service", notes: "Official NAV job portal. Non-EU applicants must independently meet Norwegian immigration requirements." },
  { country: "Poland", name: "Central Job Offer Database (ePraca)", url: "https://oferty.praca.gov.pl/portal/", kind: "government_job_portal", notes: "Official Polish public employment job-offer portal." },
  { country: "Romania", name: "ANOFM – Medierea muncii", url: "https://mediere.anofm.ro/app/module/mediere/jobs", kind: "public_employment_service", notes: "Official Romanian National Agency for Employment job mediation portal." },
  { country: "Singapore", name: "MyCareersFuture", url: "https://www.mycareersfuture.gov.sg/", kind: "government_job_portal", notes: "Singapore government-supported job portal; verify work-pass eligibility and employer sponsorship separately." },
  { country: "Slovenia", name: "Employment Service of Slovenia – Vacancies", url: "https://www.ess.gov.si/iskalci-zaposlitve/iskanje-zaposlitve/prosta-delovna-mesta/", kind: "public_employment_service", notes: "Official Slovenian Employment Service vacancy page; check single-permit requirements with the competent authority." },
  { country: "Sweden", name: "Arbetsförmedlingen – Platsbanken", url: "https://arbetsformedlingen.se/platsbanken.html", kind: "public_employment_service", notes: "Official Swedish Public Employment Service job bank; includes seasonal vacancies." },
  { country: "United Kingdom", name: "Find a Job", url: "https://findajob.dwp.gov.uk/", kind: "government_job_portal", notes: "UK Government job-search service. Check whether the employer is licensed to sponsor the relevant visa where required." },
  { country: "United States", name: "USAJOBS", url: "https://www.usajobs.gov/", kind: "government_job_portal", notes: "Official US federal-government jobs portal; not a directory of all private-sector vacancies and many roles have citizenship restrictions." }
];

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

const ALIASES: Record<string, string> = {
  uk: "united kingdom",
  "great britain": "united kingdom",
  usa: "united states",
  us: "united states",
  holland: "netherlands,
  "the netherlands": "netherlands",
  "czech republic": "czechia"
};

export function listOfficialJobSources(countries?: string[]) {
  if (!countries?.length) {
    return {
      sources: [...EUROPEAN_SOURCES, ...COUNTRY_SOURCES],
      matched_countries: [...new Set(COUNTRY_SOURCES.map(source => source.country))],
      note: "This is a curated directory of official public employment portals, not a live vacancy feed. Open the source and verify each vacancy, employer and work-permit conditions. EURES and the European public-service directory are regional sources."
    };
  }

  const wanted = new Set(countries.map(country => {
    const key = normalize(country);
    return ALIASES[key] ?? key;
  }));
  const matches = COUNTRY_SOURCES.filter(source => wanted.has(normalize(source.country)));
  const isEurope = [...wanted].some(country =>
    ["austria", "belgium", "bulgaria", "croatia", "cyprus", "czechia", "denmark", "estonia", "finland", "france", "germany", "greece", "hungary", "ireland", "italy", "latvia", "lithuania", "luxembourg", "malta", "netherlands", "norway", "poland", "portugal", "romania", "slovakia", "slovenia", "spain", "sweden", "iceland", "liechtenstein", "switzerland"].includes(country)
  );
  const sources = [...(isEurope ? EUROPEAN_SOURCES : []), ...matches];
  return {
    sources,
    matched_countries: [...new Set(matches.map(source => source.country))],
    note: sources.length
      ? "This is a curated directory of official sources, not a live vacancy feed. An empty country match means the directory does not yet contain a verified national portal for that country. Verify each vacancy, employer and work-permit conditions."
      : "No verified national portal is currently listed for the requested country. Use ChatGPT Web Search to locate the official public employment service or employer career page; do not assume a private job board is government-run."
  };
}
