#!/usr/bin/env node
/**
 * Capture screenshots of each HTML slide as PNG images.
 * Uses Puppeteer headless to render slides at 1920x1080.
 * Hides HUD, progress bar, grid view, and lightbox before capture.
 *
 * Usage: node scripts/capture-slides.mjs
 */

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.join(__dirname, '..', 'index.html');
const OUTPUT_DIR = path.join(__dirname, '..', 'temp', 'slide-images');
const TOTAL_SLIDES = 25;
const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;

async function captureSlides() {
  console.log('Launching Puppeteer...');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      deviceScaleFactor: 1,
    });

    console.log('Loading presentation...');
    await page.goto(`file://${HTML_PATH}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await page.waitForFunction(() => document.fonts.ready, { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    await page.evaluate(() => {
      const style = document.createElement('style');
      style.id = 'capture-cleanup-style';
      style.textContent = `
        .hud-nav,
        .progress-bar-container,
        .grid-view-overlay,
        .image-lightbox-overlay {
          display: none !important;
        }
        .slide {
          transition: none !important;
          transform: none !important;
        }
        .slide .animate-element {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
    });

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    for (const file of fs.readdirSync(OUTPUT_DIR)) {
      if (/^slide-\d+\.png$/.test(file)) {
        fs.rmSync(path.join(OUTPUT_DIR, file));
      }
    }

    console.log('Capturing slides...');
    const slides = await page.$$eval('.slide', elements => elements.length);
    if (slides !== TOTAL_SLIDES) {
      throw new Error(`Expected ${TOTAL_SLIDES} slides, found ${slides}`);
    }

    let captured = 0;
    for (let i = 0; i < slides; i++) {
      await page.evaluate(idx => {
        const all = document.querySelectorAll('.slide');
        all.forEach((slide, j) => {
          if (j === idx) {
            slide.classList.add('active');
            slide.style.opacity = '1';
            slide.style.visibility = 'visible';
            slide.style.transform = 'none';
          } else {
            slide.classList.remove('active');
            slide.style.opacity = '0';
            slide.style.visibility = 'hidden';
            slide.style.transform = 'none';
          }
          slide.style.transition = 'none';
        });
      }, i);

      await new Promise(resolve => setTimeout(resolve, 300));

      const filename = `slide-${String(i + 1).padStart(2, '0')}.png`;
      await page.screenshot({
        path: path.join(OUTPUT_DIR, filename),
        fullPage: false,
        type: 'png',
      });
      captured++;
      console.log(`  - ${filename}`);
    }

    if (captured !== TOTAL_SLIDES) {
      throw new Error(`Expected ${TOTAL_SLIDES} screenshots, captured ${captured}`);
    }

    console.log(`Captured ${captured}/${slides} slides -> ${OUTPUT_DIR}`);
  } finally {
    await browser.close();
  }
}

captureSlides().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
