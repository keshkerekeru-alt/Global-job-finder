create table if not exists public.job_experiences (
  id bigint generated always as identity primary key,
  origin_country text not null check (char_length(origin_country) between 2 and 80),
  destination_country text not null check (char_length(destination_country) between 2 and 80),
  employer_name text not null check (char_length(employer_name) between 2 and 180),
  outcome text not null check (outcome in ('rejected', 'accepted', 'no_response')),
  reason text,
  visa_support text check (visa_support in ('yes', 'no', 'unclear')),
  notes text,
  source_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.job_experiences enable row level security;
revoke all on table public.job_experiences from anon, authenticated;
grant all on table public.job_experiences to service_role;

create index if not exists job_experiences_search_idx
  on public.job_experiences (status, destination_country, origin_country, employer_name);
