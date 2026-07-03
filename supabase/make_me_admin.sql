-- ===========================================================================
-- Bootstrap the first admin.
--
-- 1) Relax the role-change guard so back-end / service-role callers and
--    existing admins can set roles (regular signed-in users still cannot
--    escalate their own role).
-- 2) Promote your account to admin.
--
-- Paste this whole file into the Supabase SQL Editor and click Run.
-- ===========================================================================

create or replace function public.enforce_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only admins can change a user role';
  end if;
  return new;
end;
$$;

-- Promote by email (works regardless of user id).
update public.profiles p
set role = 'admin'
from auth.users u
where u.id = p.id
  and u.email = 'jazmiernawa@gmail.com';

-- Show the result.
select p.id, u.email, p.role, p.full_name
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'jazmiernawa@gmail.com';
