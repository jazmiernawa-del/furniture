# Furniture — furniture rental web app

Rent premium furniture by the week or month. Customers pick a piece, choose a
term, pay the rental fee + a refundable deposit + delivery via Stripe, and
manage everything from a rentals dashboard. Admins manage inventory, images,
availability, and refunds.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind v4 · Supabase
(Postgres, Auth, Storage) · Stripe · Vercel.

---

## Features

- Product catalog with search + filters (category, style, max price, available dates)
- Product pages with a rental-period selector, availability calendar, live price breakdown
- Cookie cart → Stripe Checkout (rental + refundable deposit + delivery)
- Accounts: register/login, active rentals, history, **extend** / **return early**, saved cards (Stripe billing portal)
- Admin: product CRUD, image upload, rental management, status transitions, deposit refunds
- **Double-booking is impossible** — enforced by a Postgres exclusion constraint on `bookings`

## Getting started

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.local.example .env.local
```

Fill in Supabase + Stripe values (see `.env.local.example`).

### 3. Database

Apply the SQL migrations in `supabase/` (in order), then optionally the seed.
See [`supabase/README.md`](./supabase/README.md) for both the Dashboard and CLI
routes. To make yourself an admin:

```sql
update public.profiles set role = 'admin' where id = '<your-auth-user-id>';
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000. Without Supabase/Stripe configured the app still
runs and shows setup notices instead of crashing.

## Stripe webhook (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`. The webhook
fulfils orders (`checkout.session.completed`) and releases dates for expired
sessions. The success page also fulfils as a fallback.

## Deploy to Vercel

1. Push this repo to GitHub and import it at [vercel.com/new](https://vercel.com/new).
2. Add all variables from `.env.local.example` in **Project → Settings → Environment Variables**
   (set `NEXT_PUBLIC_SITE_URL` to your production URL).
3. Deploy.
4. In the Stripe Dashboard, add a webhook endpoint at
   `https://your-app.vercel.app/api/stripe/webhook` for the events
   `checkout.session.completed` and `checkout.session.expired`, and put its
   signing secret in `STRIPE_WEBHOOK_SECRET`.
5. In Supabase Auth settings, add your Vercel URL to the allowed redirect URLs.

## Project layout

```
src/
  app/            routes (catalog, cart, checkout, account, admin, auth, api)
  components/     UI (site chrome, product, rental selector, admin, checkout)
  lib/
    supabase/     browser / server / admin clients + session proxy
    data/         data access (products, availability, orders, rentals, admin)
    rental.ts     pure date + pricing helpers
    cart.ts       cookie cart
    stripe.ts     Stripe client
supabase/         SQL migrations + seed
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
