const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "..", ".next");
const chunksDir = path.join(buildDir, "static", "chunks");
const cssDir = path.join(buildDir, "static", "css");
const staticDir = path.join(buildDir, "static");

if (!fs.existsSync(staticDir)) {
  console.log("No .next/static dir found, skipping.");
  process.exit(0);
}

// Find all CSS files on disk
const cssFiles = [];
if (fs.existsSync(cssDir)) {
  cssFiles.push(...fs.readdirSync(cssDir).filter((f) => f.endsWith(".css")).map((f) => path.join(cssDir, f)));
}
if (fs.existsSync(chunksDir)) {
  cssFiles.push(...fs.readdirSync(chunksDir).filter((f) => f.endsWith(".css")).map((f) => path.join(chunksDir, f)));
}

if (cssFiles.length === 0) {
  console.log("No CSS files found, skipping.");
  process.exit(0);
}

const sourceCss = cssFiles[0];
console.log(`Source CSS: ${path.basename(sourceCss)}`);

// Scan ALL files in .next/static for CSS references
const referencedCss = new Set();

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith(".js") || entry.name.endsWith(".html")) {
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        const matches = content.matchAll(/chunks\/([\w.-]+\.css)/g);
        for (const m of matches) {
          referencedCss.add(m[1]);
        }
      } catch {}
    }
  }
}

scanDir(staticDir);

console.log(`Referenced CSS: ${[...referencedCss].join(", ") || "(none)"}`);

if (referencedCss.size === 0) {
  console.log("No CSS references found, nothing to fix.");
  process.exit(0);
}

if (!fs.existsSync(chunksDir)) {
  fs.mkdirSync(chunksDir, { recursive: true });
}

let fixed = 0;
for (const refName of referencedCss) {
  const inChunks = path.join(chunksDir, refName);
  if (!fs.existsSync(inChunks)) {
    console.log(`Fixing: chunks/${refName} <- ${path.basename(sourceCss)}`);
    fs.copyFileSync(sourceCss, inChunks);
    fixed++;
  }
}

if (fixed > 0) {
  console.log(`Fixed ${fixed} missing CSS reference(s).`);
} else {
  console.log("All CSS references already OK.");
}
