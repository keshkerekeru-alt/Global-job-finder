create or replace function public.search_company_directory(
  p_query text default null,
  p_country text default null,
  p_company_type text default null,
  p_limit integer default 20
)
returns table (
  id bigint,
  company_name text,
  country text,
  company_type text,
  roles_summary text,
  website_url text,
  reference_url text,
  public_contact_email text,
  data_quality_status text,
  email_verification_status text,
  last_verified_at timestamptz,
  match_score real
)
language sql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
  with q as (
    select
      nullif(btrim(p_query), '') as raw_query,
      case when nullif(btrim(p_query), '') is null then null
        else websearch_to_tsquery('simple', btrim(p_query)) end as ts_query,
      case when nullif(btrim(p_query), '') is null then null
        else lower(regexp_replace(btrim(p_query), '[[:space:][:punct:]]+', ' ', 'g')) end as normalized_query
  )
  select
    c.id, c.company_name, c.country, c.company_type, c.roles_summary,
    c.website_url, c.reference_url, c.public_contact_email,
    c.data_quality_status, c.email_verification_status, c.last_verified_at,
    greatest(
      case when q.normalized_query is not null and c.normalized_name = q.normalized_query then 1.0 else 0.0 end,
      case when q.ts_query is not null then ts_rank_cd(
        to_tsvector('simple',
          coalesce(c.company_name,'') || ' ' || coalesce(c.country,'') || ' ' ||
          coalesce(c.industry_summary,'') || ' ' || coalesce(c.roles_summary,'')
        ), q.ts_query
      ) else 0.0 end,
      case when q.raw_query is not null then similarity(c.company_name, q.raw_query) else 0.0 end
    )::real as match_score
  from public.company_profiles c
  cross join q
  where
    (q.raw_query is null
      or to_tsvector('simple',
        coalesce(c.company_name,'') || ' ' || coalesce(c.country,'') || ' ' ||
        coalesce(c.industry_summary,'') || ' ' || coalesce(c.roles_summary,'')
      ) @@ q.ts_query
      or c.company_name % q.raw_query
      or exists (
        select 1 from public.company_aliases a
        where a.company_id = c.id
          and (a.normalized_alias = q.normalized_query or a.alias % q.raw_query)
      )
    )
    and (nullif(btrim(p_country),'') is null or lower(c.country) = lower(btrim(p_country)) or c.country ilike '%' || btrim(p_country) || '%')
    and (nullif(btrim(p_company_type),'') is null or c.company_type = p_company_type)
  order by
    case when q.normalized_query is not null and c.normalized_name = q.normalized_query then 0 else 1 end,
    match_score desc,
    c.company_name asc
  limit least(greatest(coalesce(p_limit,20),1),50);
$$;

revoke all on function public.search_company_directory(text,text,text,integer) from public, anon, authenticated;
grant execute on function public.search_company_directory(text,text,text,integer) to service_role;
