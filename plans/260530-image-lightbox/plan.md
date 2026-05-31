---
title: "Image Lightbox Zoom Feature"
description: "Click-to-zoom lightbox overlay cho ảnh trong slide presentation. Ảnh phóng to 80% viewport, glassmorphism neon style, đóng bằng X/click nền/Escape."
status: completed
priority: P2
branch: "dev"
tags: [feature, ui, lightbox]
blockedBy: []
blocks: []
created: "2026-05-30T09:45:05.421Z"
createdBy: "ck:plan"
source: skill
---

# Image Lightbox Zoom Feature

## Overview

Thêm tính năng click-to-zoom cho ảnh trong slide presentation. Khi click vào `.slide-image`, overlay glassmorphism neon hiện ảnh phóng to 80% viewport, nằm giữa màn hình. Đóng bằng nút X, click nền, hoặc Escape. Z-index 600 (trên grid-view 500).

**Brainstorm report:** `plans/260530-image-lightbox/brainstorm-report.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Add HTML Overlay Structure](./phase-01-add-html-overlay-structure.md) | Completed |
| 2 | [Add CSS Lightbox Styles](./phase-02-add-css-lightbox-styles.md) | Completed |
| 3 | [Add JS Lightbox Logic](./phase-03-add-js-lightbox-logic.md) | Completed |

## Touchpoints

| File | Change | Lines |
|------|--------|-------|
| `index.html` | Thêm 1 div lightbox overlay trước `</body>` | ~8 |
| `css/style.css` | Thêm section 14: Image Lightbox Overlay | ~35 |
| `js/app.js` | Thêm lightbox handlers trong DOMContentLoaded | ~45 |

## Key Design Decisions

1. **Pure vanilla JS** — không dependency, consistent với codebase
2. **Kế thừa pattern `.grid-view-overlay`** — `.active` class toggle, backdrop-filter blur
3. **`--neon-color` kế thừa từ slide cha** — mỗi slide có neon accent riêng, lightbox match
4. **Z-index 600** — trên grid-view (500), slide deck (5-20), HUD (100), progress (100)
5. **Escape handler priority** — lightbox > grid view > slide navigation

## Dependencies

None — feature hoàn toàn self-contained.