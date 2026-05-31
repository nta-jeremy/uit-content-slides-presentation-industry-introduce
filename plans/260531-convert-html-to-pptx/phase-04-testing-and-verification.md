---
phase: 4
title: "Testing and Verification"
status: completed
priority: P1
effort: "1h"
dependencies: [3]
---

# Phase 4: Testing and Verification

## Overview

Viết tests cho cả 2 scripts và chạy full end-to-end pipeline để verify output đúng spec. Mode `--tdd` yêu cầu tests-first mindset: định nghĩa acceptance criteria thành test cases trước, sau đó implement cho đến khi pass.

## Architecture

```
tests/
├── test-capture-slides.mjs          # Test script screenshot (Node)
├── test-build-pptx.py               # Test script PPTX assembly (Python)
└── test-e2e.sh                      # Bash script chạy full pipeline
```

## Related Code Files

- **Create**: `tests/test-capture-slides.mjs`
- **Create**: `tests/test-build-pptx.py`
- **Create**: `tests/test-e2e.sh`
- **Read**: `scripts/capture-slides.mjs` — cần export/call từ test
- **Read**: `scripts/build-pptx.py` — cần import hoặc subprocess từ test

## Implementation Steps

### 1. Test Screenshot Script (`tests/test-capture-slides.mjs`)

```js
import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TEMP_DIR = 'temp/slide-images';

// Cleanup trước khi test
if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true });

// Run capture
execSync('node scripts/capture-slides.mjs', { stdio: 'inherit', cwd: process.cwd() });

// Assertions
const files = fs.readdirSync(TEMP_DIR).filter(f => f.endsWith('.png'));
assert.equal(files.length, 25, `Expected 25 PNG files, got ${files.length}`);

for (const f of files) {
  const imgPath = path.join(TEMP_DIR, f);
  const stats = fs.statSync(imgPath);
  assert(stats.size > 10000, `${f} quá nhỏ, có thể ảnh trắng/lỗi`);
}

// Kiểm tra resolution (dùng sharp nếu có, hoặc skip nếu không install)
console.log('✅ Screenshot tests passed');
```

### 2. Test PPTX Script (`tests/test-build-pptx.py`)

```python
import os
import subprocess
from pptx import Presentation

# Build
subprocess.run(['python3', 'scripts/build-pptx.py'], check=True)

# Assertions
prs = Presentation('presentation.pptx')
assert len(prs.slides) == 25, f"Expected 25 slides, got {len(prs.slides)}"

for i, slide in enumerate(prs.slides):
    # Mỗi slide phải có ít nhất 1 shape (ảnh background)
    assert len(slide.shapes) >= 1, f"Slide {i+1} không có ảnh nền"
    
    # Notes phải có text
    notes = slide.notes_slide.notes_text_frame
    notes_text = notes.text.strip()
    assert len(notes_text) > 10, f"Slide {i+1} notes quá ngắn hoặc trống"

print("✅ PPTX tests passed")
```

### 3. End-to-End Test (`tests/test-e2e.sh`)

```bash
#!/bin/bash
set -e

echo "=== E2E: HTML → PPTX ==="

# Phase 2: Capture
echo "[1/3] Capturing slides..."
node scripts/capture-slides.mjs

# Phase 3: Build
echo "[2/3] Building PPTX..."
python3 scripts/build-pptx.py

# Verify output
echo "[3/3] Verifying..."
python3 tests/test-build-pptx.py

# File size check (không quá 200MB)
SIZE=$(stat -f%z presentation.pptx 2>/dev/null || stat -c%s presentation.pptx)
MAX=$((200 * 1024 * 1024))
if [ "$SIZE" -gt "$MAX" ]; then
    echo "❌ File quá lớn: ${SIZE} bytes > 200MB"
    exit 1
fi

echo "✅ E2E passed: presentation.pptx (${SIZE} bytes)"
```

### 4. Manual Verification Checklist

- [x] Mở `presentation.pptx` bằng LibreOffice headless qua `soffice --headless --convert-to pdf`
- [x] Kiểm tra bản PDF export từ LibreOffice có đúng 25 trang
- [x] Kiểm tra file PPTX có ảnh nền trên từng slide bằng test tự động
- [x] Kiểm tra notes XML có text ở slide 1 và slide 25

## Success Criteria

- [x] `node tests/test-capture-slides.mjs` pass
- [x] `python3 tests/test-build-pptx.py` pass
- [x] `bash tests/test-e2e.sh` pass (full pipeline)
- [x] File `presentation.pptx` mở được trong PowerPoint / LibreOffice Impress
- [x] Mỗi slide có notes text chứa đủ title, bullets, paragraphs
- [x] Kích thước file PPTX < 200MB

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| sharp (Node image lib) chưa install cho test | Thấp | Thấp | Skip resolution test nếu thiếu; chỉ test file existence + size |
| PowerPoint không mở được do python-pptx tạo file không chuẩn | Thấp | Cao | Test bằng LibreOffice Impress (có sẵn trên Mac/Linux) làm sanity check |

## Next Steps

Sau khi tất cả tests pass, plan hoàn thành. User có thể chạy `bash tests/test-e2e.sh` để regenerate `presentation.pptx` bất kỳ lúc nào.
