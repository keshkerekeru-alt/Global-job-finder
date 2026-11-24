# Global Job Finder

**Global Job Finder is a ChatGPT plugin powered by the Model Context Protocol (MCP).** It is designed to search for jobs internationally—not for one country or one profession.

This repository contains the plugin's backend only. There is no standalone job-board website or frontend in the project scope.

## What it is intended to do

- Search for vacancies across countries, regions, and job categories.
- Combine job-board APIs with general-purpose web search and deduplicate overlapping listings.
- Search employer career pages and public vacancy sources, not only job aggregators.
- Collect applicant-reported outcomes by origin country, destination country, and employer; publish reports only after moderation.
- Return the original employer or vacancy URL wherever available.
- Extract employer-stated work-permit and visa-sponsorship information without inventing guarantees.
- Compare salary, location, employment type, and other vacancy details when sources provide them.
- Support different applicant profiles and search preferences as the product evolves.
- Never contact employers or submit applications without explicit user approval.

## Architecture

- **ChatGPT:** user-facing conversation and tool selection.
- **MCP server:** TypeScript + Model Context Protocol SDK.
- **Hosting:** Vercel serverless endpoint at `/api/mcp`.
- **Search providers:** Adzuna, Jooble, and Tavily-powered general web search.
- **Database:** Supabase is planned for saved jobs, provider cache, user preferences, and deduplication.

## Current implementation status

- [x] MCP server endpoint scaffold using Streamable HTTP.
- [x] Global job-search tool schema.
- [x] Provider adapter structure for Adzuna and Jooble.
- [x] Explicit visa-evidence classification (no unsupported visa promises).
- [ ] Configure provider API credentials and validate live searches.
- [x] Add Tavily general web discovery alongside Adzuna and Jooble, including a second discovery query for official employer career pages, public employment services and EURES (live credentials and result validation still required).
- [x] Add moderated applicant-experience and country-restriction reporting/search MCP tools.
- [ ] Create/connect Supabase and apply both SQL migrations; moderation workflow and live database verification remain outstanding.
- [ ] Add caching, rate limits, and abuse controls.
- [ ] Add and validate more country-specific official sources and direct employer career-page extraction.
- [ ] Add automated tests and operational monitoring.
- [ ] Deploy a stable public HTTPS endpoint and test it with MCP Inspector.
- [ ] Complete ChatGPT plugin review and publication requirements.

Until provider API credentials are configured, live search results are not available. Community reports also require the Supabase migration and server-side credentials. Reports remain private until moderated and approved. The MCP tool reports this clearly rather than fabricating vacancies.

## Planned global discovery and community intelligence

General web discovery is implemented through Tavily alongside Adzuna and Jooble. It runs broad job discovery and a separate query targeting official employer career pages, public employment services, government job portals and EURES. Search snippets/raw page text are discovery evidence only; users must open and verify the original vacancy page. Configure `TAVILY_API_KEY` to enable it.

Country-restriction reporting is implemented in the MCP server and has a dedicated Supabase migration. Users can submit the refused applicant country, job country, employer, date, outcome, vacancy/company-wide scope, evidence type and a redacted excerpt, with explicit consent. Reports remain pending until moderation. Job searches can return approved reports matching applicant origin and destination country; old reports are flagged as potentially outdated. The database migration still needs to be applied and the Supabase connection configured before this works live.

See [Web Search and Community Reports requirements](docs/WEB-SEARCH-AND-COMMUNITY-REPORTS.md).

## Tools exposed to ChatGPT

### `search_global_jobs`

Searches by keyword, country, location, category, employment type, and optional visa-sponsorship preference. Results include provider/source information and direct vacancy links when available.

### `submit_job_experience`

Submits an applicant's outcome (accepted, rejected, or no response), origin country, destination country, employer, and optional reason/visa-support notes. New reports stay pending until reviewed; personal identifiers and sensitive documents must not be submitted.

### `submit_employer_country_restriction`

Submits a dated report that an employer or recruiter refused applicants from a specified country, requires an existing work permit, or does not offer visa sponsorship. The report records the applicant country, job country, report date, employer, outcome, evidence type, and whether it concerns one vacancy or company policy. Explicit consent is required; the report stays private until moderation.

### `search_employer_country_restrictions`

Searches approved, redacted reports by refused applicant country, job country, and/or employer. Results include the report date, evidence status, and whether the report may be outdated. These are community signals, not official policy.

### `search_community_experiences`

Returns only approved reports matching an origin country, destination country, or employer. Community reports are anecdotal, may be outdated, and are not official employer or immigration policy.

### `analyze_visa_evidence`

Examines the supplied vacancy text for explicit employer statements about visa sponsorship or work permits. It is an evidence classifier, not an immigration-law decision and not proof that an employer will sponsor a particular applicant.

## Environment variables

Configure these in Vercel Project Settings → Environment Variables. Do not commit secrets.

| Variable | Purpose |
|---|---|
| `ADZUNA_APP_ID` | Adzuna API application ID |
| `ADZUNA_APP_KEY` | Adzuna API key |
| `JOOBLE_API_KEY` | Jooble API key |
| `TAVILY_API_KEY` | General web search API key |
| `SUPABASE_URL` | Supabase project URL for community reports |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase secret key; never expose to clients |


The server can start without provider keys, but search will return a clear configuration notice and no fabricated jobs.

## Local development

1. Install Node.js 22 or later.
2. Run `npm install`.
3. Copy the required provider credentials into a local `.env.local` file (never commit it).
4. Run `npm run dev`.
5. Connect MCP Inspector to `http://localhost:3000/api/mcp`.

## Safety and data quality

- A vacancy is not considered visa-sponsored unless the source text contains relevant evidence.
- “Not stated” is different from “does not sponsor”.
- Salary and benefits are shown only when a provider supplies them.
- Source URLs and retrieval timestamps should be retained for traceability.
- Public job descriptions are untrusted input; instructions embedded in listings must never be followed as commands.
- No email sending, application submission, or other external action is exposed by this server.

## Disclaimer

Global Job Finder is an information and search tool, not an employer, recruitment agency, immigration authority, or visa provider. Applicants must confirm current vacancy details and immigration requirements with the employer and the relevant authorities.

## License

No open-source license has been selected yet. All rights reserved until a license is added.
