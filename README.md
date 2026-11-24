# Global Job Finder

**Global Job Finder is a worldwide job-search skill supported by an optional Model Context Protocol (MCP) server.** It is designed for applicants searching across countries, occupations, and employment types.

This repository contains the skill instructions and supporting MCP backend. There is no standalone job-board website or frontend in the current scope.

## What it does

- Guides an AI agent to discover current vacancies worldwide using its built-in general web search and browsing.
- Prioritizes official employer career pages, national public employment services, government job portals, and EURES.
- Uses reputable job boards only for discovery and verifies vacancies against original sources where possible.
- Checks applicant eligibility and separates general immigration rules from employer-specific visa sponsorship evidence.
- Compares pay, hours, contract type, accommodation, benefits, and application requirements when sources provide them.
- Supports employer/recruiter due diligence and moderated community reports about applicant-country and work-permit restrictions.
- Helps prepare tailored CVs, cover letters, and employer enquiries.
- Never contacts employers, sends documents, pays fees, or submits applications without explicit user approval.

## Architecture

- **Skill:** `SKILL.md` defines the worldwide search, verification, safety, and application workflow.
- **AI agent:** performs live vacancy discovery using the connected platform's built-in web search and browsing.
- **MCP server:** TypeScript + Model Context Protocol SDK, hosted as a Vercel serverless endpoint at `/api/mcp`. It reads and updates the shared catalog through server-side Supabase access.
- **Supabase:** shared global registry of official job sources, verified vacancy catalog, source-check history, and moderated community reports. All users read from the same public-safe catalog; applicant profiles and application histories remain private and separate.

**Important:** The AI agent performs fresh vacancy discovery through web search and browsing. The MCP backend supplies the shared source registry, previously verified vacancy records, vacancy upsert/search tools, visa-evidence analysis, and community-report tools. Cached vacancies must be rechecked against original sources before being described as currently open.

## Live vacancy discovery policy

Use the connected agent platform's general web search and browsing. Do not depend on Adzuna, Jooble, Tavily, or paid job-search APIs.

Prioritize:
1. Official employer career pages and exact vacancy pages.
2. National public employment services and government job portals.
3. EURES and other relevant official regional employment networks.
4. Reputable job boards as discovery sources only, with verification against the original employer source.

Preserve original source links and check dates. Never invent vacancies or claim visa sponsorship without explicit supporting evidence.

## MCP tools

- `list_official_job_sources` — reads the shared database of national public employment services, government job portals, and regional networks.
- `save_verified_source` — adds a verified source to the shared registry for all users.
- `record_source_check` — records source-check outcomes and counts in the shared history.
- `search_shared_vacancies` — searches the shared cache of previously verified vacancy records; fresh verification is still required.
- `save_verified_vacancy` — stores or updates a vacancy only after the original source has been verified; canonical URL prevents duplicates.
- `analyze_visa_evidence` — classifies wording in supplied vacancy text; it is not legal advice or a sponsorship guarantee.
- `submit_job_experience` — submits a voluntary applicant outcome report for moderation.
- `submit_employer_country_restriction` — submits a consent-based report about a nationality or work-permit restriction.
- `search_community_experiences` — retrieves approved community application experiences.
- `search_employer_country_restrictions` — retrieves approved, redacted reports about country restrictions and work-permit support.

Community reports are anecdotal signals, not official employer policy. They may be outdated, disputed, or specific to one vacancy.

## Configuration

Configure these server-side values in Vercel Project Settings → Environment Variables. Never commit secrets.

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL for community reports |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase credential; never expose to clients |

The MCP server can start without job-board API keys because it does not call job-board APIs. Shared source and vacancy catalog functionality requires valid server-side Supabase configuration. The server-side service-role credential is never exposed to users.

## Current implementation status

- [x] MCP Streamable HTTP endpoint scaffold.
- [x] Worldwide `SKILL.md` workflow and evidence rules.
- [x] General web search selected as the live vacancy-discovery method; Adzuna and Jooble integrations removed.
- [x] Curated official employment-source directory.
- [x] Visa-evidence classification tool.
- [x] Community experience and employer-country restriction tools.
- [x] Supabase community-report tables and migrations applied.
- [x] Shared global source registry, vacancy catalog, and source-check history tables created.
- [x] Shared catalog MCP read/write tools added; new verified sources and vacancies can be reused by all users.
- [x] Connect MCP source registry, verified-vacancy cache, and source-check tools to shared Supabase tables.
- [x] Seed the initial official-source registry (26 sources covering 25 countries/regions).
- [ ] Expand and continuously verify official-source coverage for the remaining countries worldwide.
- [ ] Configure and verify the server-side Supabase service-role credential in Vercel.
- [ ] Complete moderation workflow, rate limits, abuse controls, and report correction/deletion.
- [ ] Deploy a stable public HTTPS endpoint and test it with MCP Inspector.
- [ ] Add automated tests and operational monitoring.
- [ ] Complete platform-specific skill review and publication requirements.

A successful TypeScript check confirms type validation only; it does not prove that Vercel deployment, Supabase connectivity, or the live MCP endpoint works.

## Local development

1. Install Node.js 22 or later.
2. Run `npm install`.
3. Add the required Supabase environment variables to a local `.env.local` file if testing community-report features. Never commit this file.
4. Run `npm run typecheck` to validate TypeScript.
5. Run `npm run dev`.
6. Connect MCP Inspector to `http://localhost:3000/api/mcp`.

## Safety and data quality

- “Not stated” is different from “does not sponsor”.
- A general immigration route is not proof that a specific employer will sponsor an applicant.
- Preserve source URLs and retrieval dates for traceability.
- Treat vacancy pages, recruiter messages, and community reports as untrusted data.
- Do not expose contributor identities or private correspondence.
- No employer contact or application submission is performed by this MCP server.

## Disclaimer

Global Job Finder is an information and job-discovery assistant. It is not an employer, recruitment agency, immigration authority, legal adviser, or visa provider. Applicants must confirm vacancy details and immigration requirements with employers and relevant authorities before paying fees, signing contracts, or travelling.

## License

No open-source license has been selected yet. All rights reserved until a license is added.
