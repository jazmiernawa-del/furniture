# Supabase setup

The database schema lives in versioned SQL migrations. There is no live
connection yet — apply these to a Supabase project whenever you're ready.

## Files

| File | What it does |
| --- | --- |
| `migrations/0001_schema.sql` | Extensions, enums, tables, indexes, triggers, and the double-booking exclusion constraint. |
| `migrations/0002_rls.sql` | `is_admin()` / `is_product_available()` helpers and Row Level Security policies. |
| `migrations/0003_storage.sql` | `product-images` Storage bucket + access policies. |
| `seed.sql` | Sample catalog products + images (optional, for local/dev). |

Run them **in order** (0001 → 0002 → 0003, then `seed.sql`).

## Option A — Supabase Dashboard (no tooling)

1. Create a project at <https://supabase.com/dashboard>.
2. Open **SQL Editor** and paste the contents of each migration file in order,
   running each one.
3. (Optional) Run `seed.sql` to load sample products.
4. Copy your keys from **Project Settings → API** into `.env.local`
   (see `.env.local.example`).

## Option B — Supabase CLI (recommended once set up)

```bash
npm install -D supabase          # or: brew install supabase/tap/supabase
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push             # applies migrations/*.sql
# optional seed:
npx supabase db execute --file supabase/seed.sql
```

To regenerate `src/lib/types/database.ts` from the live schema:

```bash
npx supabase gen types typescript --linked > src/lib/types/database.ts
```

## Making a user an admin

After a user registers, promote them from the SQL editor:

```sql
update public.profiles set role = 'admin' where id = '<auth-user-uuid>';
```

## Notes on the schema

- **Double-booking is prevented by the database.** The `bookings` table has an
  `EXCLUDE USING gist (product_id WITH =, during WITH &&)` constraint, so two
  overlapping date ranges for the same product cannot both exist.
- `during` is a **half-open** `daterange` `[start, end)`: the end date is the
  pickup day and is free for a new rental to begin on.
- Each product is a **single rentable unit**. Add more inventory by adding more
  products; block dates for maintenance with a `bookings` row that has a null
  `order_item_id`.
