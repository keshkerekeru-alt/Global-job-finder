create table if not exists public.official_job_sources (
  id bigint generated always as identity primary key,
  country text not null,
  source_name text not null,
  source_url text not null unique,
  source_kind text not null check (source_kind in ('public_employment_service','government_job_portal','regional_network','employer_career_page','licensed_recruitment_agency')),
  source_scope text not null default 'national' check (source_scope in ('national','regional','international','employer')),
  language_codes text[] not null default '{}',
  notes text not null default '',
  is_active boolean not null default true,
  verification_status text not null default 'needs_review' check (verification_status in ('verified','needs_review','inactive','disputed')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists official_job_sources_country_idx on public.official_job_sources (country, is_active, verification_status);

create table if not exists public.job_vacancies (
  id bigint generated always as identity primary key,
  title text not null,
  employer_name text not null,
  employer_url text,
  country text not null,
  city text,
  source_id bigint references public.official_job_sources(id) on delete set null,
  source_name text not null,
  source_url text not null,
  canonical_url text not null unique,
  discovery_url text,
  vacancy_status text not null default 'open' check (vacancy_status in ('open','closed','expired','unknown')),
  employment_type text,
  salary_text text,
  requirements_text text,
  description_excerpt text check (char_length(description_excerpt) <= 4000),
  published_at date,
  closing_date date,
  international_applicants_status text not null default 'not_stated' check (international_applicants_status in ('confirmed','not_confirmed','restricted','not_stated','unclear')),
  visa_support_status text not null default 'not_stated' check (visa_support_status in ('confirmed','not_offered','not_stated','unclear','not_applicable')),
  evidence_url text,
  verification_status text not null default 'needs_review' check (verification_status in ('verified','needs_review','rejected','stale')),
  first_seen_at timestamptz not null default now(),
  last_checked_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists job_vacancies_search_idx on public.job_vacancies (country, vacancy_status, verification_status, last_checked_at desc);
create index if not exists job_vacancies_employer_idx on public.job_vacancies (lower(employer_name), country);

create table if not exists public.source_check_runs (
  id bigint generated always as identity primary key,
  source_id bigint references public.official_job_sources(id) on delete set null,
  source_url text not null,
  checked_at timestamptz not null default now(),
  result_status text not null check (result_status in ('success','partial','failed','blocked')),
  vacancies_found integer not null default 0 check (vacancies_found >= 0),
  vacancies_verified integer not null default 0 check (vacancies_verified >= 0),
  error_summary text,
  run_metadata jsonb not null default '{}'::jsonb
);
create index if not exists source_check_runs_source_date_idx on public.source_check_runs (source_id, checked_at desc);

alter table public.official_job_sources enable row level security;
alter table public.job_vacancies enable row level security;
alter table public.source_check_runs enable row level security;
revoke all on public.official_job_sources from anon, authenticated;
revoke all on public.job_vacancies from anon, authenticated;
revoke all on public.source_check_runs from anon, authenticated;
grant all on public.official_job_sources to service_role;
grant all on public.job_vacancies to service_role;
grant all on public.source_check_runs to service_role;
