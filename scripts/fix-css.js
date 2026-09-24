/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "..", ".next");
const chunksDir = path.join(buildDir, "static", "chunks");
const cssDir = path.join(buildDir, "static", "css");

function walk(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p, ext));
    else if (ent.name.endsWith(ext)) out.push(p);
  }
  return out;
}

if (!fs.existsSync(chunksDir)) fs.mkdirSync(chunksDir, { recursive: true });

const emittedCss = [...walk(cssDir, ".css"), ...walk(chunksDir, ".css")];

// Only scan HTML + JSON manifests — never .js (minified code has false matches like H.css)
const scanRoots = [
  path.join(buildDir, "server", "app"),
  path.join(buildDir, "server", "pages"),
];
const scanFiles = [];
for (const root of scanRoots) scanFiles.push(...walk(root, ".html"));
for (const name of [
  "build-manifest.json",
  "app-build-manifest.json",
  "react-loadable-manifest.json",
  "prerender-manifest.json",
]) {
  const p = path.join(buildDir, name);
  if (fs.existsSync(p)) scanFiles.push(p);
}

const referenced = new Set();
for (const file of scanFiles) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    for (const m of raw.matchAll(/["'/(]([A-Za-z0-9_-]{6,}\.css)/g)) {
      referenced.add(m[1]);
    }
    for (const m of raw.matchAll(/static\/chunks\/([A-Za-z0-9_-]+\.css)/g)) {
      referenced.add(m[1]);
    }
  } catch {
    /* skip */
  }
}

let copied = 0;
for (const name of referenced) {
  const target = path.join(chunksDir, name);
  if (fs.existsSync(target)) continue;
  const source = emittedCss.find((p) => path.basename(p) === name);
  if (source) {
    fs.copyFileSync(source, target);
    copied += 1;
    console.log(`CSS: copied ${path.basename(source)} -> chunks/${name}`);
  } else if (emittedCss.length >= 1) {
    // Alias real build CSS to whatever name HTML references
    fs.copyFileSync(emittedCss[0], target);
    copied += 1;
    console.log(`CSS: aliased ${path.basename(emittedCss[0])} -> chunks/${name}`);
  } else {
    console.warn(`CSS: referenced ${name} but no emitted CSS found`);
  }
}

// Copy any CSS only in static/css into chunks
for (const source of walk(cssDir, ".css")) {
  const target = path.join(chunksDir, path.basename(source));
  if (!fs.existsSync(target)) {
    fs.copyFileSync(source, target);
    copied += 1;
    console.log(`CSS: copied ${path.basename(source)} -> chunks/`);
  }
}

// Remove junk CSS aliases from previous buggy runs (e.g. H.css)
for (const f of fs.readdirSync(chunksDir)) {
  if (f === "H.css") {
    fs.rmSync(path.join(chunksDir, f), { force: true });
    console.log(`CSS: removed junk ${f}`);
  }
}

const jsCount = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".js")).length;
const cssFiles = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".css"));
console.log(`Chunks: ${jsCount} JS, CSS=[${cssFiles.join(", ")}] (copies: ${copied})`);
console.log(`Referenced CSS: [${[...referenced].join(", ")}]`);

if (jsCount < 5) {
  console.error("FAIL: too few JS chunks");
  process.exit(1);
}
