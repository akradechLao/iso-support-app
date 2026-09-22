const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "..", ".next");
const chunksDir = path.join(buildDir, "static", "chunks");
const cssDir = path.join(buildDir, "static", "css");
const targetName = "22ao1ut6opq8_.css";

if (!fs.existsSync(chunksDir)) {
  fs.mkdirSync(chunksDir, { recursive: true });
}

// Find actual CSS file - check css/ first, then chunks/
let sourceCss = null;
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"));
  if (cssFiles.length > 0) sourceCss = path.join(cssDir, cssFiles[0]);
}
if (!sourceCss && fs.existsSync(chunksDir)) {
  const cssFiles = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".css") && f !== targetName);
  if (cssFiles.length > 0) sourceCss = path.join(chunksDir, cssFiles[0]);
}

if (sourceCss) {
  const targetPath = path.join(chunksDir, targetName);
  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(sourceCss, targetPath);
    console.log(`CSS: copied ${path.basename(sourceCss)} -> chunks/${targetName}`);
  } else {
    console.log("CSS: already OK");
  }
} else {
  console.log("CSS: no source found");
}

const jsFiles = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".js"));
console.log(`Chunks: ${jsFiles.length} JS files in chunks/`);
