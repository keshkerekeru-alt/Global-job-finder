# Global Job Finder

**Global Job Finder is a ChatGPT plugin powered by the Model Context Protocol (MCP).** It is designed to search for jobs internationally—not for one country or one profession.

This repository contains the plugin's backend only. There is no standalone job-board website or frontend in the project scope.

## What it is intended to do

- Search for vacancies across countries, regions, and job categories.
- Combine configured job-board APIs and deduplicate overlapping listings.
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
- **Live vacancy discovery:** performed by the connected AI agent's built-in web search, prioritizing official employer career pages and public employment services. This MCP server does not call Adzuna, Jooble, Tavily, or any paid job-search API.
- **Database:** Supabase is connected for moderated community reports; saved jobs, provider cache, user preferences, and deduplication are future work.

## Current implementation status

- [x] MCP server endpoint scaffold using Streamable HTTP.
- [x] Global job-search tool schema.
- [x] Removed Adzuna and Jooble provider integrations; live discovery is delegated to the agent platform's general web search.
- [x] Explicit visa-evidence classification (no unsupported visa promises).
- [x] Add a curated directory of official public employment services, government job portals and EURES links.
- [x] Documented the general web-search workflow: the agent searches official employer career pages and public employment services directly.
- [x] Add moderated applicant-experience and country-restriction reporting/search MCP tools.
- [x] Create Supabase project and apply both community-report SQL migrations; both tables and RLS are verified. Server-side service-role credential and moderation workflow are still outstanding.
- [ ] Add caching, rate limits, and abuse controls.
- [ ] Add and validate more country-specific official sources and direct employer career-page extraction.
- [ ] Add automated tests and operational monitoring.
- [ ] Deploy a stable public HTTPS endpoint and test it with MCP Inspector.
- [ ] Complete ChatGPT plugin review and publication requirements.

Live vacancy discovery is performed by the connected agent's web-search capability, not by this MCP backend. The MCP server supplies official-source links, visa-evidence analysis, and moderated community reports. Community reports require server-side Supabase credentials and remain private until moderated and approved.

## Planned global discovery and community intelligence

General web search is not called from this MCP server. The connected AI agent must use its built-in web-search capability to discover current vacancies, then use this MCP server to retrieve official public-employment portals, analyze visa wording, and consult approved community evidence. No Adzuna, Jooble, Tavily, or other paid job-search API is used.

Country-restriction reporting is implemented in the MCP server and has a dedicated Supabase migration. Users can submit the refused applicant country, job country, employer, date, outcome, vacancy/company-wide scope, evidence type and a redacted excerpt, with explicit consent. Reports remain pending until moderation. Job searches can return approved reports matching applicant origin and destination country; old reports are flagged as potentially outdated. Both database tables and migrations are now applied in Supabase. Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel before community reporting works live; moderation and public-read safeguards must be completed before reports are exposed.

See [Web Search and Community Reports requirements](docs/WEB-SEARCH-AND-COMMUNITY-REPORTS.md).

## Tools exposed to ChatGPT

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
| `SUPABASE_URL` | Supabase project URL for community reports |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase secret key; never expose to clients |


The server starts without job-board API keys. It does not return live vacancies; use the connected agent's general web search for vacancy discovery and this MCP server for supporting verification tools.

## Local development

1. Install Node.js 22 or later.
2. Run `npm install`.
3. Copy any provider credentials you choose to use into a local `.env.local` file (never commit it).
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
