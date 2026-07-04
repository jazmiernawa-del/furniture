-- ===========================================================================
-- Harden new-user profile creation for social (OAuth) sign-ups.
--
-- Google and Facebook populate the display name under different metadata keys:
--   * Google   -> raw_user_meta_data ->> 'full_name' (and also 'name')
--   * Facebook -> raw_user_meta_data ->> 'name'
-- The original trigger only read 'full_name', so Facebook users (and any
-- provider that omits it) ended up with a NULL name. Fall back to 'name',
-- then to the email local-part, so every account has something to show.
-- ===========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
