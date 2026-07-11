// One-time: converts a TTF into a three.js typeface JSON, keeping only the
// glyphs the drive world needs (A-Z, 0-9, space).
// Usage: node scripts/convert-font.mjs <in.ttf> <out.json>
import { readFileSync, writeFileSync } from "fs";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader.js";

const [ttfPath, outPath] = process.argv.slice(2);
const KEEP = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ".split(""));

const buf = readFileSync(ttfPath);
const json = new TTFLoader().parse(
  buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
);
json.glyphs = Object.fromEntries(
  Object.entries(json.glyphs).filter(([ch]) => KEEP.has(ch))
);
writeFileSync(outPath, JSON.stringify(json));
console.log(`wrote ${outPath}: ${Object.keys(json.glyphs).length} glyphs`);
