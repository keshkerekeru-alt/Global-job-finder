# Global Job Finder

**Global Job Finder is a ChatGPT plugin powered by the Model Context Protocol (MCP).** It is designed to search for jobs internationally—not for one country or one profession.

This repository contains the plugin's backend only. There is no standalone job-board website or frontend in the project scope.

## What it is intended to do

- Search for vacancies across countries, regions, and job categories.
- Combine multiple job data providers and deduplicate overlapping listings.
- Return the original employer or vacancy URL wherever available.
- Extract employer-stated work-permit and visa-sponsorship information without inventing guarantees.
- Compare salary, location, employment type, and other vacancy details when sources provide them.
- Support different applicant profiles and search preferences as the product evolves.
- Never contact employers or submit applications without explicit user approval.

## Architecture

- **ChatGPT:** user-facing conversation and tool selection.
- **MCP server:** TypeScript + Model Context Protocol SDK.
- **Hosting:** Vercel serverless endpoint at `/api/mcp`.
- **Job providers:** provider adapters (Adzuna and Jooble are the first planned integrations).
- **Database:** Supabase is planned for saved jobs, provider cache, user preferences, and deduplication.

## Current implementation status

- [x] MCP server endpoint scaffold using Streamable HTTP.
- [x] Global job-search tool schema.
- [x] Provider adapter structure for Adzuna and Jooble.
- [x] Explicit visa-evidence classification (no unsupported visa promises).
- [ ] Configure provider API credentials and validate live searches.
- [ ] Add Supabase storage, caching, and cross-user preferences.
- [ ] Add more official and country-specific job sources.
- [ ] Add automated tests and operational monitoring.
- [ ] Deploy a stable public HTTPS endpoint and test it with MCP Inspector.
- [ ] Complete ChatGPT plugin review and publication requirements.

Until provider API credentials are configured, live search results are not available. The MCP tool reports this clearly rather than fabricating vacancies.

## Tools exposed to ChatGPT

### `search_global_jobs`

Searches by keyword, country, location, category, employment type, and optional visa-sponsorship preference. Results include provider/source information and direct vacancy links when available.

### `analyze_visa_evidence`

Examines the supplied vacancy text for explicit employer statements about visa sponsorship or work permits. It is an evidence classifier, not an immigration-law decision and not proof that an employer will sponsor a particular applicant.

## Environment variables

Configure these in Vercel Project Settings → Environment Variables. Do not commit secrets.

| Variable | Purpose |
|---|---|
| `ADZUNA_APP_ID` | Adzuna API application ID |
| `ADZUNA_APP_KEY` | Adzuna API key |
| `JOOBLE_API_KEY` | Jooble API key |
| `SUPABASE_URL` | Planned database URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Planned server-only database key |

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
