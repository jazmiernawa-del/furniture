#!/usr/bin/env bash
# Push env vars from .env.local to the Vercel project (production + preview).
# NEXT_PUBLIC_SITE_URL is overridden to the production URL.
#
# Auth: either run `npx vercel login` first, OR set VERCEL_TOKEN in the env.
# Usage:
#   bash scripts/push-env-to-vercel.sh
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT="furniture-two-ashy"
SITE_URL="https://furniture-two-ashy.vercel.app"

TOKEN_ARG=()
if [ -n "${VERCEL_TOKEN:-}" ]; then TOKEN_ARG=(--token="$VERCEL_TOKEN"); fi
VC() { npx --yes vercel "${TOKEN_ARG[@]}" "$@"; }

# Load values from .env.local
set -a
# shellcheck disable=SC1091
source <(grep -vE '^\s*#' .env.local | grep -E '^[A-Z].*=')
set +a

# Link to the existing project (creates .vercel/project.json)
VC link --yes --project "$PROJECT" >/dev/null

names=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  STRIPE_SECRET_KEY
  NEXT_PUBLIC_SITE_URL
)

for envname in production preview; do
  for name in "${names[@]}"; do
    if [ "$name" = "NEXT_PUBLIC_SITE_URL" ]; then
      value="$SITE_URL"
    else
      value="${!name:-}"
    fi
    [ -z "$value" ] && { echo "skip $name (empty)"; continue; }
    VC env rm "$name" "$envname" -y >/dev/null 2>&1 || true
    printf '%s' "$value" | VC env add "$name" "$envname" >/dev/null
    echo "set $name ($envname)"
  done
done

echo ""
echo "Done. Now redeploy:  npx vercel --prod ${TOKEN_ARG[*]}"
