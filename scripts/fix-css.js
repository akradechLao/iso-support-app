const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "..", ".next");
const chunksDir = path.join(buildDir, "static", "chunks");
const cssDir = path.join(buildDir, "static", "css");
const serverDir = path.join(buildDir, "server");

if (!fs.existsSync(serverDir)) {
  console.log("No server dir found, skipping.");
  process.exit(0);
}

// Find all CSS files on disk (check both chunks/ and css/)
const cssFiles = [];
if (fs.existsSync(chunksDir)) {
  cssFiles.push(...fs.readdirSync(chunksDir).filter((f) => f.endsWith(".css")).map((f) => path.join(chunksDir, f)));
}
if (fs.existsSync(cssDir)) {
  cssFiles.push(...fs.readdirSync(cssDir).filter((f) => f.endsWith(".css")).map((f) => path.join(cssDir, f)));
}

if (cssFiles.length === 0) {
  console.log("No CSS files found, skipping.");
  process.exit(0);
}

console.log(`Found ${cssFiles.length} CSS file(s): ${cssFiles.map((f) => path.basename(f)).join(", ")}`);

// Find all referenced CSS filenames in server output
const referencedCss = new Map(); // refName -> match

function scanDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith(".js")) {
      const content = fs.readFileSync(fullPath, "utf8");
      const matches = content.matchAll(/chunks\/([\w.-]+\.css)/g);
      for (const m of matches) {
        if (!referencedCss.has(m[1])) {
          referencedCss.set(m[1], m[0]);
        }
      }
    }
  }
}

scanDir(serverDir);

let fixed = 0;
for (const [refName] of referencedCss) {
  // Check if file exists in chunks/
  const inChunks = path.join(chunksDir, refName);
  if (fs.existsSync(inChunks)) continue;

  // Copy first available CSS file with the referenced name
  const source = cssFiles[0];
  console.log(`Fixing: chunks/${refName} <- ${path.basename(source)}`);
  fs.copyFileSync(source, inChunks);
  fixed++;
}

if (fixed > 0) {
  console.log(`Fixed ${fixed} missing CSS reference(s).`);
} else {
  console.log("All CSS references OK.");
}
