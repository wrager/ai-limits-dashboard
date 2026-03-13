#!/usr/bin/env node
/* eslint-env node */
/** Creates minimal placeholder icons for Tauri bundle (PNG + icon.ico for Windows). */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const toIco = require("to-ico");
const sharp = require("sharp");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "..", "src-tauri", "icons");

fs.mkdirSync(iconsDir, { recursive: true });

// Create valid 32x32 gray PNG with sharp
const png32 = await sharp({
  create: { width: 32, height: 32, channels: 4, background: { r: 128, g: 128, b: 128, alpha: 1 } },
})
  .png()
  .toBuffer();

fs.writeFileSync(path.join(iconsDir, "32x32.png"), png32);

// Larger sizes
const png128 = await sharp({ create: { width: 128, height: 128, channels: 4, background: { r: 128, g: 128, b: 128, alpha: 1 } } })
  .png()
  .toBuffer();
fs.writeFileSync(path.join(iconsDir, "128x128.png"), png128);
fs.writeFileSync(path.join(iconsDir, "128x128@2x.png"), png128);

// Create icon.ico required for Windows resource
const icoBuffer = await toIco([png32], { sizes: [32] });
fs.writeFileSync(path.join(iconsDir, "icon.ico"), icoBuffer);

console.log("Icons generated.");
