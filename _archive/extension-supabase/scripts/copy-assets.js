import { mkdir, cp, rename } from "fs/promises";
import { resolve } from "path";
import { existsSync } from "fs";

const root = resolve(process.cwd());
const manifestSrc = resolve(root, "src/manifest.json");
const dist = resolve(root, "dist");

await mkdir(dist, { recursive: true });
await cp(manifestSrc, resolve(dist, "manifest.json"));

// Move popup HTML from nested path to root
const nestedHtml = resolve(dist, "src/popup/index.html");
const rootHtml = resolve(dist, "index.html");

if (existsSync(nestedHtml)) {
  await rename(nestedHtml, rootHtml);
  console.log("Moved index.html to dist root");
}

// Move auth callback HTML from nested path to root
const nestedCallback = resolve(dist, "src/auth/callback.html");
const rootCallback = resolve(dist, "callback.html");

if (existsSync(nestedCallback)) {
  await rename(nestedCallback, rootCallback);
  console.log("Moved callback.html to dist root");
}
