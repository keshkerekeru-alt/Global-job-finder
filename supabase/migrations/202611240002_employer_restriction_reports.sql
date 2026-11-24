create table if not exists public.employer_restriction_reports (
  id bigint generated always as identity primary key,
  employer_name text not null check (char_length(employer_name) between 2 and 180),
  employer_url text,
  vacancy_url text,
  refused_applicant_country text not null check (char_length(refused_applicant_country) between 2 and 80),
  job_country text not null check (char_length(job_country) between 2 and 80),
  report_date date not null default current_date,
  outcome text not null check (outcome in ('nationality_not_accepted','no_work_permit_support','no_visa_sponsorship','permit_already_required','role_filled','other')),
  scope text not null default 'unclear' check (scope in ('specific_vacancy','company_policy','unclear')),
  evidence_type text not null check (evidence_type in ('employer_email','official_vacancy_page','recruiter_message','phone_call','user_observation')),
  evidence_excerpt_redacted text check (char_length(evidence_excerpt_redacted) <= 600),
  details text check (char_length(details) <= 1200),
  evidence_status text not null default 'unverified' check (evidence_status in ('unverified','corroborated','expired','disputed')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected')),
  consent_to_share boolean not null default false check (consent_to_share = true),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.employer_restriction_reports enable row level security;
revoke all on table public.employer_restriction_reports from anon, authenticated;
grant all on table public.employer_restriction_reports to service_role;

create index if not exists employer_restriction_reports_lookup_idx
  on public.employer_restriction_reports (moderation_status, refused_applicant_country, job_country, employer_name, report_date desc);
