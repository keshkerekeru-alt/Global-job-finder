create extension if not exists pg_trgm with schema extensions;

create table if not exists public.company_profiles (
  id bigint generated always as identity primary key,
  company_name text not null,
  normalized_name text generated always as (
    lower(regexp_replace(btrim(company_name), '[[:space:][:punct:]]+', ' ', 'g'))
  ) stored,
  country text not null,
  company_type text not null default 'employer'
    check (company_type in ('employer','recruitment_agency','public_agency','other')),
  industry_summary text,
  roles_summary text,
  website_url text,
  reference_url text,
  reference_type text not null default 'notion_import_unverified'
    check (reference_type in ('official_company_site','official_career_page','public_job_portal','recruitment_directory','notion_import_unverified')),
  public_contact_email text,
  email_verification_status text not null default 'unverified'
    check (email_verification_status in ('verified','unverified','invalid','not_stated')),
  data_origin text not null default 'notion_user_import',
  data_quality_status text not null default 'unverified_import'
    check (data_quality_status in ('verified','unverified_import','needs_review','disputed','inactive')),
  last_verified_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists company_profiles_name_country_uidx
  on public.company_profiles (normalized_name, lower(country));
create index if not exists company_profiles_country_type_idx
  on public.company_profiles (country, company_type, data_quality_status);
create index if not exists company_profiles_email_idx
  on public.company_profiles (lower(public_contact_email))
  where public_contact_email is not null;
create index if not exists company_profiles_name_trgm_idx
  on public.company_profiles using gin (company_name extensions.gin_trgm_ops);
create index if not exists company_profiles_search_idx
  on public.company_profiles using gin (
    to_tsvector('simple',
      coalesce(company_name,'') || ' ' ||
      coalesce(country,'') || ' ' ||
      coalesce(industry_summary,'') || ' ' ||
      coalesce(roles_summary,'')
    )
  );

create table if not exists public.company_aliases (
  id bigint generated always as identity primary key,
  company_id bigint not null references public.company_profiles(id) on delete cascade,
  alias text not null,
  normalized_alias text generated always as (
    lower(regexp_replace(btrim(alias), '[[:space:][:punct:]]+', ' ', 'g'))
  ) stored,
  country text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists company_aliases_alias_country_uidx
  on public.company_aliases (normalized_alias, lower(country));
create index if not exists company_aliases_search_idx
  on public.company_aliases using gin (alias extensions.gin_trgm_ops);

alter table public.company_profiles enable row level security;
alter table public.company_aliases enable row level security;
revoke all on public.company_profiles from anon, authenticated;
revoke all on public.company_aliases from anon, authenticated;
grant all on public.company_profiles to service_role;
grant all on public.company_aliases to service_role;
