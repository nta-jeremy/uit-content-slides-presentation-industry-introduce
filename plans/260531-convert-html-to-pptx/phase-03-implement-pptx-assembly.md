---
phase: 3
title: "Implement PPTX Assembly"
status: completed
priority: P1
effort: "1.5h"
dependencies: [2]
---

# Phase 3: Implement PPTX Assembly

## Overview

Viết Python script đọc 25 ảnh PNG từ Phase 2, tạo PowerPoint file với mỗi slide dùng ảnh làm background. Đồng thời extract text từ `index.html` bằng BeautifulSoup và đưa vào slide notes.

## Architecture

```
scripts/build-pptx.py
  ├── Parse index.html với BeautifulSoup
  ├── Extract từng slide:
  │     ├── slide-title, slide-category (header text)
  │     ├── list items (ul/li)
  │     ├── paragraphs (p)
  │     └── slide-footer
  ├── For each slide i:
  │     ├── Add blank slide (layout 6)
  │     ├── Add picture: slide-XX.png (cover full slide)
  │     └── Add notes text frame với extracted content
  └── Save presentation.pptx
```

## Related Code Files

- **Create**: `scripts/build-pptx.py`
- **Read for reuse**: `convert_to_pptx.py` — helper functions `clean_text`, `add_bg_shape`, cách dùng `Presentation()` và `slide_layouts[6]`
- **Read for context**: `index.html` — cấu trúc `.slide`, `.slide-content`, `.slide-title`, `.slide-category`, `.slide-footer`

## Implementation Steps

1. **Script scaffolding**
   - File: `scripts/build-pptx.py`
   - Dùng `pathlib.Path` cho cross-platform paths

2. **Slide dimension setup**
   - `SLIDE_WIDTH = Inches(13.333)` — 16:9 widescreen (1920px @ 144dpi)
   - `SLIDE_HEIGHT = Inches(7.5)`
   - Hoặc dùng `prs.slide_width = Inches(13.333)` nếu cần custom

3. **Text extraction logic**
   ```python
   def extract_slide_text(html_slide):
       parts = []
       # Category + Title
       cat = html_slide.find('div', class_='slide-category')
       title = html_slide.find(['h1','h2','h3'], class_='slide-title')
       if cat: parts.append(f"[{clean_text(cat.get_text())}]")
       if title: parts.append(clean_text(title.get_text()))
       # List items
       for li in html_slide.find_all('li'):
           txt = clean_text(li.get_text())
           if txt: parts.append(f"• {txt}")
       # Paragraphs (not in lists, not footer)
       for p in html_slide.find_all('p'):
           if p.find_parent('li'): continue
           if 'slide-footer' in (p.get('class') or []): continue
           txt = clean_text(p.get_text())
           if txt: parts.append(txt)
       # Footer
       footer = html_slide.find('div', class_='slide-footer')
       if footer: parts.append(f"--- {clean_text(footer.get_text())} ---")
       return '\n'.join(parts)
   ```

4. **Picture placement (cover full slide)**
   - `slide.shapes.add_picture(img_path, Inches(0), Inches(0), width=SLIDE_WIDTH, height=SLIDE_HEIGHT)`
   - Đảm bảo ảnh không bị stretch — kiểm tra aspect ratio trước khi set height
   - Nếu ảnh 1920×1080 và slide 13.333"×7.5" (tỷ lệ giống nhau), cover full slide là chính xác

5. **Notes text frame**
   - `notes_slide = slide.notes_slide`
   - `text_frame = notes_slide.notes_text_frame`
   - `text_frame.text = extracted_text`
   - Set font: Calibri, size 11, color đen — readable trong Notes pane

6. **Error handling**
   - Nếu ảnh thiếu (do Phase 2 lỗi 1 slide) → skip ảnh, vẫn tạo slide với text notes
   - Nếu `index.html` không parse được → throw sớm
   - In summary: "Slide 1/25: OK with image + notes"

## Success Criteria

- [x] Script chạy không lỗi: `python3 scripts/build-pptx.py`
- [x] Tạo file `presentation.pptx` trong project root
- [x] File có đúng 25 slides
- [x] Mỗi slide có ảnh nền cover toàn bộ slide (không bị letterbox hoặc stretch)
- [x] Mỗi slide có notes chứa title, bullets, paragraphs, footer
- [x] File mở bình thường trong PowerPoint / LibreOffice / Google Slides

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Ảnh aspect ratio không khớp slide → bị stretch hoặc cắt | Thấp | Cao | Verify 1920/1080 == 13.333/7.5. Nếu khác, dùng `fit` thay vì `cover` |
| `python-pptx` add_picture làm mất transparency (ảnh PNG có alpha) | Thấp | Trung bình | PNG alpha thường được preserve; test slide có glass panel trên nền tối |
| Notes text quá dài, Notes pane khó đọc | Trung bình | Thấp | Split bằng newlines; user có thể zoom Notes pane trong PowerPoint |

## Next Steps

Sau khi có file PPTX, chuyển sang Phase 4 để test end-to-end.
