---
title: "Convert HTML Slides to PPTX"
description: "Convert 25 HTML presentation slides sang file .pptx bằng cách chụp screenshot từng slide làm ảnh nền, đồng thời extract text vào slide notes để giữ khả năng chỉnh sửa."
status: completed
priority: P2
branch: "main"
tags: [conversion, pptx, export, puppeteer, python-pptx]
blockedBy: []
blocks: []
created: "2026-05-31T07:19:29.726Z"
createdBy: "ck:plan"
source: skill
---

# Convert HTML Slides to PPTX

## Overview

Chuyển đổi 25 HTML presentation slides (Neo-Brutalism + Glassmorphism) sang file `.pptx` với phương pháp **Screenshot + Notes Hybrid**:
- **Visual layer**: Mỗi slide PPTX dùng 1 ảnh screenshot 16:9 chụp từ HTML, giữ 100% pixel-perfect design (glassmorphism, neon colors, custom fonts, layouts).
- **Editable layer**: Text nội dung được extract từ HTML bằng BeautifulSoup và đưa vào **slide notes**, cho phép user copy/edit nếu cần.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Setup Environment](./phase-01-setup-environment.md) | Completed |
| 2 | [Implement Screenshot Capture](./phase-02-implement-screenshot-capture.md) | Completed |
| 3 | [Implement PPTX Assembly](./phase-03-implement-pptx-assembly.md) | Completed |
| 4 | [Testing and Verification](./phase-04-testing-and-verification.md) | Completed |

## Touchpoints

| File | Change | Purpose |
|------|--------|---------|
| `scripts/capture-slides.mjs` | Create | Puppeteer script chụp screenshot từng slide |
| `scripts/build-pptx.py` | Create | Python script ghép ảnh + text → file .pptx |
| `export-pdf.mjs` | Read (reuse logic) | Tham khảo cách launch Puppeteer và set viewport |
| `convert_to_pptx.py` | Read (reuse logic) | Tham khảo cách dùng python-pptx và BeautifulSoup |
| `index.html` | Read-only | Nguồn slides để chụp và extract text |
| `css/style.css` | Read-only | Style ảnh hưởng render screenshot |
| `js/app.js` | Read-only | Slide navigation logic, cần disable khi chụp |

## Key Design Decisions

1. **Puppeteer cho screenshot** — Đã có sẵn trong `package.json`, reuse thay vì thêm Playwright dependency.
2. **Python cho PPTX assembly** — `python-pptx` đã được dùng trong `convert_to_pptx.py`, reuse hoàn toàn.
3. **Screenshot dimensions: 1920×1080** — 16:9 aspect ratio chuẩn, đủ đẹp cho projection.
4. **Text vào Notes thay vì overlay** — PowerPoint object model không thể render glassmorphism/gradient borders/đúng font. Nếu vẽ text lại trên slide, visual sẽ xấu. Notes là trade-off tốt nhất giữa pixel-perfect visual và khả năng edit text.
5. **Không xóa `convert_to_pptx.py` cũ** — Giữ lại để tham khảo. Script mới sẽ ở `scripts/build-pptx.py`.
6. **Script chạy headless, single-thread** — 25 slides × ~1s = ~25-30s, đủ nhanh, không cần parallel.

## Dependencies

- **Node**: `puppeteer` (đã có trong project)
- **Python**: `python-pptx`, `beautifulsoup4`, `lxml` (cần install nếu chưa có)

## Acceptance Criteria

- [x] Script `scripts/capture-slides.mjs` chạy thành công, tạo 25 ảnh PNG trong thư mục `temp/` (hoặc tương tự)
- [x] Mỗi ảnh có resolution 1920×1080, không bị cắt, không có HUD/grid-view/lightbox overlay
- [x] Script `scripts/build-pptx.py` chạy thành công, tạo file `presentation.pptx`
- [x] File PPTX có đúng 25 slides, mỗi slide có ảnh nền và text trong notes
- [x] Có thể mở bằng Microsoft PowerPoint / LibreOffice Impress / Google Slides mà không lỗi
- [x] Full pipeline (chụp + build) chạy bằng 1 command duy nhất (hoặc script wrapper)
