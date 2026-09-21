const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "..", ".next");
const staticDir = path.join(buildDir, "static", "chunks");

if (!fs.existsSync(staticDir)) {
  console.log("No static/chunks dir found, skipping CSS fix.");
  process.exit(0);
}

// Find all CSS files on disk
const cssFiles = fs.readdirSync(staticDir).filter((f) => f.endsWith(".css"));
if (cssFiles.length === 0) {
  console.log("No CSS files found, skipping.");
  process.exit(0);
}

// Find all referenced CSS filenames in server output
const serverDir = path.join(buildDir, "server", "app");
if (!fs.existsSync(serverDir)) {
  console.log("No server/app dir found, skipping.");
  process.exit(0);
}

const referencedCss = new Set();

function scanDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith(".html") || entry.name.endsWith(".js")) {
      const content = fs.readFileSync(fullPath, "utf8");
      const matches = content.matchAll(/chunks\/([\w.-]+\.css)/g);
      for (const m of matches) {
        referencedCss.add(m[1]);
      }
    }
  }
}

scanDir(serverDir);

// Also scan turbopack output
const turbopackDir = path.join(buildDir, "turbopack");
if (fs.existsSync(turbopackDir)) {
  scanDir(turbopackDir);
}

let fixed = 0;
for (const ref of referencedCss) {
  const refPath = path.join(staticDir, ref);
  if (!fs.existsSync(refPath)) {
    // Copy the first available CSS file as the referenced one
    const source = path.join(staticDir, cssFiles[0]);
    console.log(`Fixing: ${ref} -> copying from ${cssFiles[0]}`);
    fs.copyFileSync(source, refPath);
    fixed++;
  }
}

if (fixed > 0) {
  console.log(`Fixed ${fixed} missing CSS reference(s).`);
} else {
  console.log("All CSS references OK.");
}
