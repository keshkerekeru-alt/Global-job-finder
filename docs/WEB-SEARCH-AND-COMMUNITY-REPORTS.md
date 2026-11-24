# Global Job Finder — Web Search and Community Evidence

## Product requirements

### 1. Search beyond job APIs
The primary search experience must combine:
- Job-provider APIs (initially Adzuna and Jooble).
- Compliant direct discovery from official employer career pages and public vacancy feeds.
- Official employer career pages and public employment portals.
- Country-specific public job services, including EURES where relevant.

Search results must preserve the original source URL, employer, country, retrieval timestamp, and whether the result is a direct vacancy or a discovery page. Deduplicate equivalent vacancies. Never invent a vacancy or claim that a page confirms sponsorship unless the page explicitly says so.

ChatGPT's built-in Web Search may be used separately during ChatGPT conversations, but it is not an API that this MCP backend can call. The backend must use permitted public feeds, official vacancy pages, and other compliant direct integrations; do not scrape sites that prohibit automated access.

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
When searching, show relevant reports alongside vacancies, filtered by employer, job country, and refused applicant country. Display report date, evidence type, confidence, and status. Older reports must be visibly marked as potentially outdated. Reports are signals for further verification, not guarantees or legal advice.

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
- A search can return API vacancies and relevant official web-discovered vacancies in one deduplicated result set.
- Each result links to its original source and carries a retrieval timestamp.
- A user can submit a country-restriction / permit-support report with a date and evidence category.
- Other users can see matching reports without seeing contributor identity or private correspondence.
- The interface distinguishes not stated, reported no sponsorship, and confirmed not accepting this nationality.
- Stale, disputed, and unverified reports are clearly labeled.
- No user report is treated as verified policy without corroboration.