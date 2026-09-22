const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "..", ".next");
const chunksDir = path.join(buildDir, "static", "chunks");
const cssDir = path.join(buildDir, "static", "css");

if (!fs.existsSync(chunksDir)) {
  fs.mkdirSync(chunksDir, { recursive: true });
}

// Copy CSS from css/ to chunks/ with the name HTML expects
let sourceCss = null;
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"));
  if (cssFiles.length > 0) sourceCss = path.join(cssDir, cssFiles[0]);
}
if (sourceCss) {
  const targetPath = path.join(chunksDir, "22ao1ut6opq8_.css");
  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(sourceCss, targetPath);
    console.log(`CSS: copied to chunks/22ao1ut6opq8_.css`);
  } else {
    console.log("CSS: already OK");
  }
} else {
  console.log("CSS: no source found in css/");
}

// Check turbopack runtime file
const turbopackRuntime = path.join(chunksDir, "turbopack-0k6b093_-quzy.js");
if (!fs.existsSync(turbopackRuntime)) {
  console.log("WARNING: turbopack-0k6b093_-quzy.js not found - this is a Next.js 16 runtime file");
}

// List what we have
const jsFiles = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".js"));
console.log(`Chunks: ${jsFiles.length} JS files in chunks/`);
