---
phase: 2
title: "Implement Screenshot Capture"
status: completed
priority: P1
effort: "1.5h"
dependencies: [1]
---

# Phase 2: Implement Screenshot Capture

## Overview

Viết Node.js script dùng Puppeteer để mở `index.html`, điều khiển slide navigation (qua JS injection), và chụp screenshot từng slide thành file PNG 1920×1080.

## Architecture

```
scripts/capture-slides.mjs
  ├── Launch Puppeteer (headless, viewport 1920×1080)
  ├── Open file://.../index.html
  ├── Wait for fonts + CSS load
  ├── Inject CSS: hide HUD, hide grid-view, hide lightbox, force visible slide
  ├── For each slide i = 0..24:
  │     ├── JS: document.querySelectorAll('.slide')[i].scrollIntoView() or set active class
  │     ├── Wait 200ms for CSS transition
  │     └── Screenshot to temp/slide-images/slide-XX.png
  └── Close browser
```

## Related Code Files

- **Create**: `scripts/capture-slides.mjs`
- **Read for context**: `js/app.js` (cách slide navigation hoạt động, class `.active`, z-index)
- **Read for context**: `css/style.css` (các element cần hide: `.hud-nav`, `.grid-view-overlay`, `.image-lightbox-overlay`)
- **Read for context**: `export-pdf.mjs` (pattern launch browser, set viewport, screenshot)

## Implementation Steps

1. **Script scaffolding**
   - File: `scripts/capture-slides.mjs` (ES Module, consistent với `export-pdf.mjs`)
   - Dùng `import puppeteer from 'puppeteer'`

2. **Browser launch & page setup**
   - `viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 }` (Retina cho ảnh sắc nét, hoặc 1 nếu file quá lớn)
   - `args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']`
   - `await page.goto('file://' + path.resolve('index.html'), { waitUntil: 'networkidle0' })`

3. **Inject cleanup CSS**
   Trước khi chụp, inject style block để:
   - Ẩn `.hud-nav`, `.progress-indicator`, `.grid-view-overlay`, `.image-lightbox-overlay`
   - Force `.slide` không có transition (tránh motion blur)
   - Force slide đang active có `opacity: 1; visibility: visible; transform: none`
   - Ẩn `.slide-footer` nếu user không muốn (hoặc giữ lại — tùy yêu cầu)

4. **Capture loop**
   ```js
   const slides = await page.$$eval('.slide', els => els.length);
   for (let i = 0; i < slides; i++) {
     await page.evaluate(idx => {
       const all = document.querySelectorAll('.slide');
       all.forEach((s, j) => {
         s.style.opacity = j === idx ? '1' : '0';
         s.style.visibility = j === idx ? 'visible' : 'hidden';
         s.style.transform = 'none';
         s.style.transition = 'none';
       });
     }, i);
     await page.waitForTimeout(300); // đợi browser composite frame
     await page.screenshot({
       path: `temp/slide-images/slide-${String(i + 1).padStart(2, '0')}.png`,
       fullPage: false, // viewport = 1920×1080, không cần fullPage
       type: 'png'
     });
   }
   ```

5. **Error handling**
   - Nếu `index.html` không tìm thấy → throw với absolute path
   - Nếu chụp lỗi 1 slide → log warning, continue với slide tiếp theo
   - Cuối cùng: in summary "Captured N/25 slides"

## Success Criteria

- [x] Script chạy không lỗi: `node scripts/capture-slides.mjs`
- [x] Tạo đúng 25 file PNG trong `temp/slide-images/`
- [x] Mỗi file có kích thước ~1920×1080 (hoặc ×2 nếu deviceScaleFactor: 2)
- [x] Ảnh không chứa HUD navigation, progress bar, grid view, lightbox overlay
- [x] Ảnh hiển thị đúng glassmorphism, neon colors, custom fonts
- [x] Thời gian chạy < 60 giây cho 25 slides

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Slide transition CSS làm ảnh bị blur/intermediate state | Cao | Cao | Inject `transition: none !important` trước khi chụp; wait 300ms |
| `file://` protocol không load external fonts (Google Fonts) | Trung bình | Cao | Dùng `http-server` (npx serve) hoặc inline fonts; thử `file://` trước |
| deviceScaleFactor: 2 tạo file quá lớn (~3MB × 25 = 75MB) | Trung bình | Thấp | Nếu file PPTX quá lớn, giảm xuống scale 1 hoặc dùng JPEG |

## Next Steps

Sau khi có 25 ảnh screenshot, chuyển sang Phase 3 để ghép thành file PPTX.
