#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

npm run build:pptx
npm run build:pdf
node tests/test-capture-slides.mjs --verify-only
python3 tests/test-build-pptx.py --verify-only

test -s build/uit-presentation-slides.pdf

echo "E2E passed: build/presentation.pptx and build/uit-presentation-slides.pdf"
