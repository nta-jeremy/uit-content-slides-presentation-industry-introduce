---
phase: 2
title: "Add CSS Lightbox Styles"
status: pending
priority: P2
effort: "10m"
dependencies: [1]
---

# Phase 2: Add CSS Lightbox Styles

## Overview

Thêm section CSS mới (Section 14) vào cuối `css/style.css` cho lightbox overlay. Style kế thừa pattern `.grid-view-overlay` hiện có — glassmorphism, backdrop blur, neon glow, fade transition.

## Requirements

- Overlay: fixed, z-index 600, 100vw×100vh, backdrop-filter blur
- Ảnh: max 80vw × 80vh, object-fit contain, centered
- Close button: góc trên phải, style tương tự `.grid-view-close`
- Transition: fade in/out với opacity + visibility (giống `.slide.active` pattern)
- Neon border glow: kế thừa `--neon-color` từ slide đang xem
- Hover ảnh gốc: cursor zoom-in

## Architecture

CSS pattern theo convention hiện có:
- `.active` class toggle (giống `.slide.active` và `.grid-view-overlay.active`)
- `visibility: hidden` + `opacity: 0` → `visible` + `1` (giống grid-view)
- CSS custom properties `--neon-color` cascade từ JS set trên overlay element
- `backdrop-filter: blur(20px)` (giống grid-view)

## Related Code Files

- Modify: `css/style.css` — thêm section mới sau Micro-Animations (sau dòng 710)

## Implementation Steps

1. Thêm `.slide-image` cursor style ngay sau `.slide-image-container:hover .slide-image` block (dòng ~411)

```css
/* Zoom cursor cho ảnh có thể click */
.slide-image {
    cursor: zoom-in;
}
```

2. Thêm Section 14 mới ở cuối file (sau dòng 710):

```css
/* ==========================================================================
   Image Lightbox Overlay (Zoom-to-View)
   ========================================================================== */
.image-lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(4, 4, 7, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 600;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                visibility 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.image-lightbox-overlay.active {
    opacity: 1;
    visibility: visible;
}

.lightbox-content {
    max-width: 80vw;
    max-height: 80vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.lightbox-image {
    max-width: 80vw;
    max-height: 80vh;
    object-fit: contain;
    border: 2px solid var(--neon-color, var(--neon-cyan));
    box-shadow: 0 0 30px rgba(0, 242, 254, 0.15),
                0 0 60px rgba(0, 242, 254, 0.05);
    border-radius: 4px;
}

.lightbox-close {
    position: absolute;
    top: 25px;
    right: 25px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #ffffff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 601;
}

.lightbox-close:hover {
    background: var(--neon-pink);
    border-color: var(--neon-pink);
    transform: rotate(90deg);
}
```

3. Thêm responsive breakpoint trong `@media (max-width: 768px)`:

```css
.lightbox-content {
    max-width: 95vw;
    max-height: 85vh;
}

.lightbox-image {
    max-width: 95vw;
    max-height: 85vh;
}
```

## Success Criteria

- [ ] Overlay hidden mặc định (`opacity: 0; visibility: hidden`)
- [ ] Overlay hiện khi `.active` thêm vào (`opacity: 1; visibility: visible`)
- [ ] Ảnh chiếm tối đa 80vw × 80vh, centered
- [ ] Neon border glow match `--neon-color`
- [ ] Nút close góc trên phải, hover hiệu ứng giống grid-view-close
- [ ] Cursor `zoom-in` trên `.slide-image`
- [ ] Transition fade mượt, cùng cubic-bezier với slide transition
- [ ] Responsive: 95vw × 85vh trên mobile

## Risk Assessment

Thấp — CSS-only, không ảnh hưởng layout hiện có. Z-index 600 đảm bảo không conflict.