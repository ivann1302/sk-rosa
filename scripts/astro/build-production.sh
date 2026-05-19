#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f "public_html/calculator.html" || ! -f "public_html/blog.html" ]]; then
  echo "Legacy public_html baseline is missing; building it for parity checks."
  npm run build:hosting
fi

npm run build:astro:poc
npm run check:astro:poc
npm run check:astro:services
npm run check:astro:blog
npm run check:astro:production

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required to promote public_html_astro to public_html" >&2
  exit 1
fi

rsync -a --delete --exclude ".gitkeep" public_html_astro/ public_html/

echo "Astro production build promoted to public_html."
