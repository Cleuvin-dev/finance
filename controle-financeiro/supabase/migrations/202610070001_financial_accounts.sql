-- Run in the Supabase SQL Editor. Passwords are managed by Supabase Auth.
-- Separate table so existing D1/SQLite data is never overwritten.
begin;

create table if not exists public.financial_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.financial_accounts enable row level security;
alter table public.financial_accounts force row level security;

revoke all on public.financial_accounts from public, anon, authenticated;
grant select on public.financial_accounts to authenticated;
grant insert (user_id, payload) on public.financial_accounts to authenticated;
grant update (payload) on public.financial_accounts to authenticated;

drop policy if exists financial_accounts_select_own on public.financial_accounts;
create policy financial_accounts_select_own on public.financial_accounts
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists financial_accounts_insert_own on public.financial_accounts;
create policy financial_accounts_insert_own on public.financial_accounts
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists financial_accounts_update_own on public.financial_accounts;
create policy financial_accounts_update_own on public.financial_accounts
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.bump_financial_account_version()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'Financial account owner cannot change';
  end if;
  new.version := old.version + 1;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.bump_financial_account_version() from public, anon, authenticated;

drop trigger if exists financial_account_version on public.financial_accounts;
create trigger financial_account_version before update on public.financial_accounts
  for each row execute function public.bump_financial_account_version();

comment on table public.financial_accounts is 'One private financial state per Supabase Auth user. Access enforced by RLS.';
comment on column public.financial_accounts.payload is 'Financial entries, categories, banks, goals and settings as JSONB.';
comment on column public.financial_accounts.version is 'Concurrency version, incremented by database trigger.';

commit;
