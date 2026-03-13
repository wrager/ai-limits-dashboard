#!/usr/bin/env node
/* eslint-env node */
/** Creates minimal placeholder icons for Tauri bundle. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "..", "src-tauri", "icons");

// Minimal 32x32 gray PNG (valid PNG format)
const PNG_32 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAKklEQVR42u3OMQEAAAjDMMC/5waCTgq4MZEJAAAAAODHAQMBAQAAAAAAAAAAAAAAAOD+AQrEAAH1jPTHAAAAAElFTkSuQmCC",
  "base64"
);

fs.mkdirSync(iconsDir, { recursive: true });
fs.writeFileSync(path.join(iconsDir, "32x32.png"), PNG_32);
fs.copyFileSync(path.join(iconsDir, "32x32.png"), path.join(iconsDir, "128x128.png"));
fs.copyFileSync(path.join(iconsDir, "32x32.png"), path.join(iconsDir, "128x128@2x.png"));
console.log("Icons generated.");
