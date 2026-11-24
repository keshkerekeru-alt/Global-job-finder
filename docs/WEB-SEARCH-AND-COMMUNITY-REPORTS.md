# Global Job Finder — Web Search and Community Evidence

## Product requirements

### 1. General web search for live vacancies
The connected AI agent's general web-search and browsing capability is the primary vacancy-discovery method. Do not use Adzuna, Jooble, Tavily, or paid job-search APIs.

Search and prioritize:
- Official employer career pages and exact vacancy pages.
- National public employment services and government job portals.
- EURES and other official regional employment networks where relevant.
- Reputable job boards only as discovery sources; verify vacancies on the original employer or official source whenever possible.

The MCP backend does not retrieve live vacancies. It provides official-source directories, visa-evidence analysis, and moderated community reports to support the agent's research.

Search results must preserve the original source URL, employer, country, retrieval/check date, and whether the result is a direct vacancy or a discovery page. Deduplicate equivalent vacancies. Never invent a vacancy or claim that a page confirms sponsorship unless the page explicitly says so.

Use only the web-search and browsing capabilities available in the connected agent platform. Do not scrape sites that prohibit automated access.

### 2. Community-reported country restrictions
Users may voluntarily submit a report when an employer or recruiter says applicants from a particular country are not accepted, or when a work permit / visa route is unavailable.

Each report should support:
- Employer or recruiter name (required where known).
- Employer website or vacancy URL (recommended).
- Applicant nationality/country that was refused (required).
- Country where the job is located (required).
- Report date (required; default to submission date but editable).
- Outcome: nationality_not_accepted, no_work_permit_support, no_visa_sponsorship, permit_already_required, role_filled, other.
- Optional reason and a short evidence excerpt.
- Evidence type: employer_email, official_vacancy_page, recruiter_message, phone_call, user_observation.
- Confidence/status: unverified, corroborated, expired, disputed.

Do not conflate a nationality restriction with lack of visa sponsorship. A company may reject one application for a role without having a general country-wide policy.

### 3. Reuse reports to help other searchers
When searching, show relevant approved reports alongside vacancies, filtered by employer, job country, and refused applicant country. Display report date, evidence type, confidence, and status. Older reports must be visibly marked as potentially outdated. Reports are signals for further verification, not guarantees or legal advice.

### 4. Privacy, consent, and abuse prevention
- Community reporting must be voluntary and require clear user consent before submission.
- Do not publish applicant names, email addresses, phone numbers, passport details, full private email threads, or other personal data.
- Store only a short redacted evidence excerpt and source metadata; do not ingest or publish full private correspondence.
- Provide report correction/deletion and dispute mechanisms.
- Rate-limit submissions, detect duplicates, and log moderation decisions.
- Public search must use aggregated employer/country evidence, not expose individual contributors.
- Do not infer or label a company as discriminatory from one unverified report.

### 5. Data model (planned)
employer_reports:
- id
- employer_name
- employer_domain
- job_country
- refused_applicant_country
- outcome
- report_date
- evidence_type
- evidence_excerpt_redacted
- source_url
- status
- created_at
- updated_at

Contributor identity, if needed for abuse prevention, must be private and separated from public report data. Anonymous public display is the default.

### 6. Acceptance criteria
- The AI agent can discover current vacancies through general web search and browsing; the MCP backend is not expected to return live vacancy listings.
- Each discovered vacancy links to its original source and records a check/retrieval date.
- A user can submit a country-restriction / permit-support report with a date and evidence category, with explicit consent.
- Other users can see approved matching reports without seeing contributor identity or private correspondence.
- The output distinguishes not stated, reported no sponsorship, and confirmed refusal of a particular applicant nationality.
- Stale, disputed, and unverified reports are clearly labeled.
- No user report is treated as verified employer policy without corroboration.
