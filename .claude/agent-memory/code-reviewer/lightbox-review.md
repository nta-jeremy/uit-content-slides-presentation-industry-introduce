---
name: lightbox-review
description: Lightbox zoom feature review for UIT slide presentation — critical stale color bug and theme inconsistency findings
metadata:
  type: project
---

## Lightbox Feature Review (2026-05-31)

**Project**: UIT Slide Presentation (static HTML/CSS/JS, glassmorphism neon theme)
**Feature**: Image Lightbox Zoom on `.slide-image` click

### Key Findings

1. **CRITICAL — Stale `--neon-color` leak**: `closeLightbox()` does not clear `--neon-color` custom property set by `openLightbox()`. If next open has falsy `neonColor`, previous slide's color persists on border. Fix: add `style.removeProperty('--neon-color')` in `closeLightbox()`.

2. **MEDIUM — Hardcoded cyan glow**: `.lightbox-image` `box-shadow` uses `rgba(0, 242, 254, ...)` (cyan) instead of dynamic `--neon-color`. Border changes color per slide but glow stays cyan — visual inconsistency. Use `color-mix()` or JS-set shadow color.

3. **MEDIUM — Duplicate `.slide-image` rule blocks**: Two separate `.slide-image` blocks in CSS. Merge `cursor: zoom-in` into existing block for maintainability.

4. **LOW — Empty `src=""` on lightbox `<img>`**: May trigger unnecessary network request. Remove `src` attribute from HTML, set only via JS.

### What Works Well
- Escape priority chain correct: lightbox (600) > grid view (500) > slides (5-20) > HUD (100)
- Touch handlers properly guarded against lightbox being open
- Defensive null checks in JS
- Responsive breakpoint (95vw x 85vh on mobile)
- `window.closeLightbox` exposed globally
- No regression to grid view behavior