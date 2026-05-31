---
phase: 3
title: "Add JS Lightbox Logic"
status: pending
priority: P2
effort: "15m"
dependencies: [2]
---

# Phase 3: Add JS Lightbox Logic

## Overview

Thêm lightbox JavaScript logic vào `js/app.js` trong DOMContentLoaded callback. Logic gắn click handler cho tất cả `.slide-image`, mở/đóng overlay, xử lý Escape key priority (lightbox > grid view > slide nav).

## Requirements

- Click `.slide-image` → mở lightbox với src và alt từ ảnh gốc
- Kế thừa `--neon-color` từ slide cha → set lên overlay
- Đóng bằng: nút X, click nền overlay, Escape key
- Escape priority: lightbox active → đóng lightbox trước, grid view active → đóng grid view, else → không làm gì
- Touch: không conflict với swipe navigation hiện có
- `window.closeLightbox` expose cho inline onclick nếu cần

## Architecture

JS pattern theo convention hiện có:
- Cache DOM elements ở đầu DOMContentLoaded (giống `progressBarFill`, `gridViewOverlay`)
- Attach `window.xxx` cho global access (giống `window.nextSlide`, `window.toggleGridView`)
- `classList.add/remove('active')` pattern (giống slide và grid-view)
- Keyboard handler mở rộng: check lightbox → grid view → slide nav

## Related Code Files

- Modify: `js/app.js` — thêm lightbox logic trong DOMContentLoaded callback

## Implementation Steps

1. **Cache DOM elements** — thêm sau block UI Elements (sau dòng 15):

```javascript
// Lightbox elements
const lightboxOverlay = document.getElementById('imageLightbox');
const lightboxImage = lightboxOverlay ? lightboxOverlay.querySelector('.lightbox-image') : null;
const lightboxClose = lightboxOverlay ? lightboxOverlay.querySelector('.lightbox-close') : null;
```

2. **Add open/close functions** — thêm sau `closeGridView` function (sau dòng 224):

```javascript
// ==========================================================================
// Image Lightbox Zoom
// ==========================================================================
function openLightbox(imageSrc, imageAlt, neonColor) {
    if (!lightboxOverlay || !lightboxImage) return;
    lightboxImage.src = imageSrc;
    lightboxImage.alt = imageAlt || '';
    if (neonColor) {
        lightboxOverlay.style.setProperty('--neon-color', neonColor);
    }
    lightboxOverlay.classList.add('active');
}

function closeLightbox() {
    if (lightboxOverlay) {
        lightboxOverlay.classList.remove('active');
    }
}

window.closeLightbox = closeLightbox;
```

3. **Attach click handlers** — thêm sau lightbox functions:

```javascript
// Bind click on all slide images
if (lightboxOverlay) {
    document.querySelectorAll('.slide-image').forEach(img => {
        img.addEventListener('click', () => {
            const slide = img.closest('.slide');
            const neonColor = slide
                ? getComputedStyle(slide).getPropertyValue('--neon-color').trim()
                : '';
            openLightbox(img.src, img.alt, neonColor);
        });
    });

    // Close on overlay background click
    lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) closeLightbox();
    });

    // Close on X button
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
}
```

4. **Update keyboard handler** — sửa Escape case trong keydown handler (dòng 96-100). Thêm lightbox check TRƯỚC grid view check:

```javascript
document.addEventListener('keydown', (e) => {
    // Priority: lightbox > grid view > slide navigation
    if (lightboxOverlay && lightboxOverlay.classList.contains('active') && e.key === 'Escape') {
        closeLightbox();
        return;
    }

    if (gridViewOverlay.classList.contains('active') && e.key === 'Escape') {
        closeGridView();
        return;
    }

    // ... rest of switch cases unchanged
```

5. **Update touch handler** — thêm lightbox check vào `touchstart` và `touchend` (dòng 147-157):

```javascript
document.addEventListener('touchstart', (e) => {
    // Avoid conflict with overlays
    if (gridViewOverlay.classList.contains('active')) return;
    if (lightboxOverlay && lightboxOverlay.classList.contains('active')) return;
    touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', (e) => {
    if (gridViewOverlay.classList.contains('active')) return;
    if (lightboxOverlay && lightboxOverlay.classList.contains('active')) return;
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, false);
```

## Success Criteria

- [ ] Click vào `.slide-image` mở lightbox với đúng src, alt, neon color
- [ ] Click nút X đóng lightbox
- [ ] Click nền overlay (không phải ảnh) đóng lightbox
- [ ] Escape đóng lightbox khi đang mở (priority: lightbox > grid view)
- [ ] Touch swipe không conflict khi lightbox đang mở
- [ ] Neon color overlay match với slide đang xem
- [ ] Không JS errors trong console
- [ ] `window.closeLightbox` accessible globally

## Risk Assessment

Thấp — logic đơn giản, theo pattern hiện có. Escape priority cần test kỹ:
- Test 1: Lightbox mở + Escape → đóng lightbox, grid vẫn đóng
- Test 2: Grid mở + Escape → đóng grid, lightbox vẫn đóng
- Test 3: Cả hai mở (unlikely) → Escape đóng lightbox trước

## Next Steps

Sau khi hoàn thành 3 phases → test thủ công:
1. Mở presentation, click ảnh ở mỗi slide
2. Verify neon color match
3. Test Escape, click nền, nút X
4. Test grid view + lightbox interaction
5. Test trên mobile viewport