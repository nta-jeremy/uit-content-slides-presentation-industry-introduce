#!/usr/bin/env node

import { strict as assert } from 'assert';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(repoRoot, 'temp', 'slide-images');
const expectedSlides = 25;
const expectedWidth = 1920;
const expectedHeight = 1080;
const verifyOnly = process.argv.includes('--verify-only');

function readPngSize(filePath) {
  const fd = fs.openSync(filePath, 'r');
  try {
    const header = Buffer.alloc(24);
    fs.readSync(fd, header, 0, header.length, 0);
    assert.equal(header.toString('ascii', 1, 4), 'PNG', `${filePath} is not a PNG`);
    return {
      width: header.readUInt32BE(16),
      height: header.readUInt32BE(20),
    };
  } finally {
    fs.closeSync(fd);
  }
}

if (!verifyOnly) {
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }

  execFileSync('node', ['scripts/capture-slides.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

const files = fs
  .readdirSync(outputDir)
  .filter(file => file.endsWith('.png'))
  .sort();

assert.equal(files.length, expectedSlides, `Expected ${expectedSlides} PNG files, got ${files.length}`);

for (const file of files) {
  const filePath = path.join(outputDir, file);
  const stats = fs.statSync(filePath);
  assert(stats.size > 10000, `${file} is too small and may be blank`);

  const { width, height } = readPngSize(filePath);
  assert.equal(width, expectedWidth, `${file} width should be ${expectedWidth}`);
  assert.equal(height, expectedHeight, `${file} height should be ${expectedHeight}`);
}

console.log('Screenshot tests passed');
