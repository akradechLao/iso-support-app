const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "..", ".next");
const chunksDir = path.join(buildDir, "static", "chunks");
const cssDir = path.join(buildDir, "static", "css");

// Find actual CSS file
let sourceCss = null;
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"));
  if (cssFiles.length > 0) sourceCss = path.join(cssDir, cssFiles[0]);
}
if (!sourceCss && fs.existsSync(chunksDir)) {
  const cssFiles = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".css"));
  if (cssFiles.length > 0) sourceCss = path.join(chunksDir, cssFiles[0]);
}

if (!sourceCss) {
  console.log("No CSS file found, skipping.");
  process.exit(0);
}

console.log(`Source CSS: ${path.basename(sourceCss)}`);

// Ensure chunks dir exists
if (!fs.existsSync(chunksDir)) {
  fs.mkdirSync(chunksDir, { recursive: true });
}

// Always copy CSS to chunks/ with the Turbopack-style name that HTML references
const targetName = "22ao1ut6opq8_.css";
const targetPath = path.join(chunksDir, targetName);

if (!fs.existsSync(targetPath) || fs.statSync(targetPath).size !== fs.statSync(sourceCss).size) {
  fs.copyFileSync(sourceCss, targetPath);
  console.log(`Copied: ${path.basename(sourceCss)} -> chunks/${targetName}`);
} else {
  console.log(`chunks/${targetName} already OK.`);
}
