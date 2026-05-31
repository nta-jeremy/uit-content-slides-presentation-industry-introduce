# Brainstorm Report: Image Lightbox Zoom Feature

**Date:** 2026-05-30  
**Feature:** Click-to-zoom image lightbox overlay  
**Status:** Approved — Phương án A (Pure JS Lightbox)

---

## Problem Statement

Hiện tại click vào ảnh trong slide không có gì xảy ra. Cần thêm tính năng: khi click ảnh → ảnh phóng to chiếm 80% màn hình, nằm giữa, overlay dạng popup, style glassmorphism neon.

## Requirements (Exact)

| # | Requirement | Chi tiết |
|---|---|---|
| 1 | Phạm vi ảnh | Tất cả ảnh có class `.slide-image` đều zoom được |
| 2 | Kích thước overlay | Ảnh chiếm 80% viewport (80vw × 80vh max), centered |
| 3 | Đóng bằng nút X | Nút close góc trên phải, icon × |
| 4 | Đóng bằng click nền | Click vùng tối/blur bên ngoài ảnh |
| 5 | Đóng bằng Escape | Nhấn phím Esc trên bàn phím |
| 6 | Style | Glassmorphism neon — khớp theme hiện tại |
| 7 | Animation | Fade in/out mượt, transition phù hợp slide transition |

### Out of Scope

- Gallery/navigation giữa các ảnh (prev/next arrows)
- Caption hiển thị alt text
- Download nút
- Pinch-to-zoom trên mobile
- Swipe gesture trong lightbox

## Approaches Evaluated

### A. Pure JS Lightbox Overlay (CHOSEN)

- 1 div overlay HTML, ~30 dòng CSS, ~40 dòng JS
- Tái sử dụng pattern `.grid-view-overlay` và convention `.active`
- Không dependency, consistent với codebase

### B. CSS-only Lightbox (Rejected)

- Checkbox hack: HTML phình to, mỗi ảnh cần 1 checkbox riêng
- Không xử lý Escape key, animation giới hạn
- UX kém cho presentation context

### C. Third-party Library (Rejected)

- GLightbox/Lightbox2: overkill, phải custom CSS nhiều để khớp neon theme
- Thêm dependency không cần thiết (YAGNI)

## Chosen Solution: Approach A — Pure JS Lightbox

### Architecture

```
HTML:  1 div .image-lightbox-overlay (thêm cuối body, trước script)
CSS:   .image-lightbox-overlay styles (thêm section mới trong style.css)
JS:    lightbox logic (thêm vào app.js DOMContentLoaded callback)
```

### HTML Structure

```html
<!-- Thêm trước </body>, sau grid-view-overlay -->
<div class="image-lightbox-overlay" id="imageLightbox">
  <button class="lightbox-close" aria-label="Đóng" title="Đóng">×</button>
  <div class="lightbox-content">
    <img class="lightbox-image" src="" alt="">
  </div>
</div>
```

### CSS Design (Glassmorphism Neon)

Dựa trên pattern `.grid-view-overlay` hiện có:

- `position: fixed; z-index: 600` (cao hơn grid-view z-500)
- `backdrop-filter: blur(20px)` + `background: rgba(0,0,0,0.85)`
- Ảnh: `max-width: 80vw; max-height: 80vh; object-fit: contain`
- Centered: flexbox `justify-content: center; align-items: center`
- Neon border glow: `border: 1px solid var(--neon-color)` + `box-shadow` glow
- Close button: góc trên phải, style giống `.hud-btn`
- Transition: `opacity 0.3s ease, visibility 0.3s ease`
- `.active` class toggle (giống pattern slide và grid-view)

### JS Logic

```javascript
// Trong DOMContentLoaded callback, thêm sau logic hiện có:

const lightboxOverlay = document.getElementById('imageLightbox');
const lightboxImage = lightboxOverlay.querySelector('.lightbox-image');
const lightboxClose = lightboxOverlay.querySelector('.lightbox-close');

// Gắn click cho tất cả .slide-image
document.querySelectorAll('.slide-image').forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => {
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
    // Kế thừa --neon-color từ slide cha
    const neonColor = getComputedStyle(img.closest('.slide'))
      .getPropertyValue('--neon-color').trim();
    lightboxOverlay.style.setProperty('--neon-color', neonColor);
    lightboxOverlay.classList.add('active');
  });
});

// Đóng lightbox
function closeLightbox() {
  lightboxOverlay.classList.remove('active');
}
window.closeLightbox = closeLightbox;

// Click nền đóng
lightboxOverlay.addEventListener('click', (e) => {
  if (e.target === lightboxOverlay) closeLightbox();
});

// Nút X đóng
lightboxClose.addEventListener('click', closeLightbox);

// Escape đóng (thêm vào keyboard handler hiện có)
// Trong event handler keydown đã có, thêm case:
// case 'Escape': if lightbox active → closeLightbox()
```

### Integration Points (Touchpoints)

| File | Change Type | Mô tả |
|---|---|---|
| `index.html` | Thêm 1 div | `.image-lightbox-overlay` trước `</body>` |
| `css/style.css` | Thêm section mới | Section 14: "Image Lightbox Overlay" (~30 dòng) |
| `js/app.js` | Thêm logic | Lightbox handlers trong DOMContentLoaded (~40 dòng) |

### Edge Cases

1. **Ảnh đang load**: ảnh gốc lớn (2-3MB) → browser đã cache nên lightbox load nhanh
2. **Mobile**: overlay responsive, ảnh auto-fit 80% viewport
3. **Grid view đang mở + click ảnh**: grid view z-500, lightbox z-600 → lightbox sẽ trên grid view (không conflict)
4. **Fullscreen mode đang bật**: lightbox vẫn hoạt động bình thường vì `position: fixed`
5. **Animation conflict**: lightbox fade-in không conflict với slide transition vì khác z-index layer

### Success Criteria

- [ ] Click vào bất kỳ `.slide-image` nào → overlay hiện ảnh phóng to 80% viewport, centered
- [ ] Click nút X → overlay đóng
- [ ] Click vùng nền tối → overlay đóng
- [ ] Nhấn Escape → overlay đóng
- [ ] Overlay style glassmorphism neon khớp theme
- [ ] Neon color của overlay match với neon color của slide đang xem
- [ ] Cursor `zoom-in` khi hover ảnh
- [ ] Animation fade in/out mượt
- [ ] Không conflict với grid view, fullscreen, slide navigation

### Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Ảnh lớn (2-3MB) load chậm lần đầu | Thấp — browser đã cache ảnh | Low priority, chấp nhận |
| Z-index conflict với grid view | Thấp — lightbox z-600 > grid z-500 | Đảm bảo z-index đúng |
| Neon color không inherit đúng | Thấp — dùng `getComputedStyle` | Test trên tất cả slide |

## Next Step

→ `/ck:plan` để tạo implementation plan chi tiết