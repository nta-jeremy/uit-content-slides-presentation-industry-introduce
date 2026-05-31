---
phase: 1
title: "Add HTML Overlay Structure"
status: pending
priority: P2
effort: "5m"
dependencies: []
---

# Phase 1: Add HTML Overlay Structure

## Overview

Thêm lightbox overlay div vào `index.html`, đặt trước `</body>` và sau `grid-view-overlay`. Cấu trúc tương tự grid-view-overlay pattern đã có.

## Requirements

- 1 div overlay chứa nút close và ảnh phóng to
- ID `imageLightbox` để JS query
- Semantic HTML với aria labels
- Đặt SAU `grid-view-overlay`, TRƯỚC `<script>`

## Architecture

```
<body>
  ...existing content...
  grid-view-overlay (z-500)
  image-lightbox-overlay (z-600)  ← NEW
  <script>
</body>
```

## Related Code Files

- Modify: `index.html` — thêm overlay div trước dòng 1324 (`<script>`)

## Implementation Steps

1. Mở `index.html`, tìm vị trí sau `</div>` đóng `grid-view-overlay` (dòng ~1322)
2. Thêm lightbox overlay HTML block giữa grid-view-overlay và `<script>` tag
3. Cấu trúc HTML:

```html
<!-- Image Lightbox Zoom Overlay -->
<div class="image-lightbox-overlay" id="imageLightbox">
    <button class="lightbox-close" aria-label="Đóng ảnh phóng to" title="Đóng (Escape)">✕</button>
    <div class="lightbox-content">
        <img class="lightbox-image" src="" alt="">
    </div>
</div>
```

## Success Criteria

- [ ] Lightbox overlay div tồn tại trong DOM với id `imageLightbox`
- [ ] Nút close có aria-label và title
- [ ] Ảnh placeholder với src rỗng và alt rỗng
- [ ] Vị trí đúng: sau grid-view-overlay, trước script tag
- [ ] HTML validate không có lỗi

## Risk Assessment

Thấp — chỉ thêm HTML tĩnh, không sửa code hiện có.