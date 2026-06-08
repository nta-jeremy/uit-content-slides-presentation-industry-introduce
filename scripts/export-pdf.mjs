#!/usr/bin/env node
/**
 * Export UIT Slide Presentation to PDF.
 * Renders each slide as a separate page in the PDF.
 *
 * Usage: node scripts/export-pdf.mjs
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.join(__dirname, '..');
const HTML_PATH = path.join(BASE_DIR, 'index.html');
const OUTPUT_PATH = path.join(BASE_DIR, 'build', 'uit-presentation-slides.pdf');
const TOTAL_SLIDES = 25;
const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;

async function exportToPDF() {
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

  const page = await browser.newPage();

  await page.setViewport({ width: SLIDE_WIDTH, height: SLIDE_HEIGHT });

  console.log('Loading presentation...');
  await page.goto(`file://${HTML_PATH}`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  await page.waitForFunction(() => document.fonts.ready, { timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    const hud = document.querySelector('.hud-nav');
    const progressBar = document.querySelector('.progress-bar-container');
    if (hud) hud.style.display = 'none';
    if (progressBar) progressBar.style.display = 'none';
  });

  console.log(`Preparing ${TOTAL_SLIDES} slides...`);

  await page.evaluate((slideWidth, slideHeight) => {
    const style = document.createElement('style');
    style.id = 'pdf-export-style';
    style.textContent = `
      @page {
        size: ${slideWidth}px ${slideHeight}px;
        margin: 0;
      }
      html,
      body {
        margin: 0 !important;
        padding: 0 !important;
        width: ${slideWidth}px !important;
        height: auto !important;
        min-height: auto !important;
        display: block !important;
        overflow: visible !important;
      }
      .slide-deck {
        display: block !important;
        max-width: none !important;
        max-height: none !important;
        width: ${slideWidth}px !important;
        height: auto !important;
        border: 0 !important;
        box-shadow: none !important;
        overflow: visible !important;
      }
      .slide {
        position: relative !important;
        opacity: 1 !important;
        visibility: visible !important;
        z-index: 20 !important;
        transform: none !important;
        width: ${slideWidth}px !important;
        height: ${slideHeight}px !important;
        min-height: 0 !important;
        max-height: none !important;
        padding: 5% 6% !important;
        box-sizing: border-box !important;
        break-after: page !important;
        page-break-after: always !important;
        page-break-inside: avoid !important;
        overflow: hidden !important;
      }
      .slide:last-child {
        break-after: auto !important;
        page-break-after: auto !important;
      }
      .slide .animate-element {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }
      .hud-nav {
        display: none !important;
      }
      .progress-bar-container {
        display: none !important;
      }
      .grid-view-overlay {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }, SLIDE_WIDTH, SLIDE_HEIGHT);

  await new Promise(r => setTimeout(r, 1500));

  console.log('Exporting PDF...');

  const fs = await import('fs');
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await page.pdf({
    path: OUTPUT_PATH,
    width: `${SLIDE_WIDTH}px`,
    height: `${SLIDE_HEIGHT}px`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: false,
    displayHeaderFooter: false,
  });

  console.log(`Exported PDF: ${OUTPUT_PATH}`);

  await page.evaluate(() => {
    const style = document.getElementById('pdf-export-style');
    if (style) style.remove();
  });

  await browser.close();
  console.log('Done.');
}

exportToPDF().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
