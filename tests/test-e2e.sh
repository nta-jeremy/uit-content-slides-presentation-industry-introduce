#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

npm run build:pptx
node tests/test-capture-slides.mjs --verify-only
python3 tests/test-build-pptx.py --verify-only

echo "E2E passed: presentation.pptx"
