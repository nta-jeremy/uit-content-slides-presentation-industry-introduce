---
phase: 1
title: "Setup Environment"
status: completed
priority: P1
effort: "30m"
dependencies: []
---

# Phase 1: Setup Environment

## Overview

Cài đặt và verify tất cả dependencies cần thiết cho cả 2 stack (Node/Puppeteer và Python/python-pptx). Đảm bảo environment sẵn sàng trước khi implement.

## Requirements

- **Functional**: Có thể chạy Puppeteer headless để screenshot. Có thể import `python-pptx` và `BeautifulSoup` trong Python.
- **Non-functional**: Không thêm dependencies mới vào `package.json` nếu puppeteer đã có. Python dependencies nên dùng virtual environment hoặc global install tùy project setup.

## Related Code Files

- **Read**: `package.json` — verify puppeteer version
- **Read**: `export-pdf.mjs` — hiểu cách project hiện launch Puppeteer
- **Modify (if needed)**: `package.json` — thêm script entry nếu cần
- **Modify (if needed)**: `.gitignore` — thêm thư mục temp output

## Implementation Steps

1. **Verify Node dependencies**
   - Kiểm tra `package.json` đã có `puppeteer` chưa
   - Nếu chưa: `npm install puppeteer`
   - Nếu đã có: `npm install` để đảm bảo `node_modules` đầy đủ

2. **Verify Python dependencies**
   - Kiểm tra `python-pptx` có sẵn: `python3 -c "from pptx import Presentation; print('OK')"`
   - Kiểm tra `beautifulsoup4` + `lxml`: `python3 -c "from bs4 import BeautifulSoup; print('OK')"`
   - Nếu thiếu: `pip3 install python-pptx beautifulsoup4 lxml`
   - **Chú ý**: Nếu project có venv (thấy trong `/images/venv/`), hỏi user nên dùng global hay venv

3. **Tạo thư mục output**
   - `mkdir -p temp/slide-images` — nơi lưu screenshot tạm thời
   - Đảm bảo thư mục này được `.gitignore`

4. **Kiểm tra font rendering trong headless**
   - Puppeteer headless có thể thiếu font (Be Vietnam Pro, Bricolage Grotesque, Space Grotesk)
   - Test nhanh: chạy 1-liner Puppeteer screenshot slide 1, kiểm tra xem text có bị fallback về system font không
   - Nếu font lỗi → cần cấu hình `font-family` fallback hoặc dùng `puppeteer.launch({ args: ['--font-render-hinting=none'] })`

## Success Criteria

- [x] `node -e "require('puppeteer')"` chạy không lỗi
- [x] `python3 -c "from pptx import Presentation; from bs4 import BeautifulSoup"` chạy không lỗi
- [x] Thư mục `temp/slide-images/` đã tồn tại và trong `.gitignore`
- [x] 1 ảnh test screenshot từ slide 1 được tạo thành công với text render đúng font

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Font không render đúng trong headless | Trung bình | Cao | Kiểm tra sớm ở Step 4; nếu lỗi thì dùng `--no-sandbox` + `--disable-setuid-sandbox` hoặc embed font qua `@font-face` base64 |
| `python-pptx` chưa install | Thấp | Trung bình | `pip3 install` và ghi chú trong README |

## Next Steps

Sau khi environment ready, chuyển sang Phase 2 để implement script chụp screenshot.
