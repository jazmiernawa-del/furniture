-- ===========================================================================
-- Furniture (rental app)
-- Migration 0004: relax the role-change guard so back-end / service-role
-- callers (and admins) can set roles, while still blocking regular users from
-- escalating their own role.
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
