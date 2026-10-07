// Marp CLI only converts .md files — it doesn't copy sibling assets (images,
// etc.) referenced by relative path, so we copy them into dist/<deck>/
// ourselves after the build.
const fs = require('fs');
const path = require('path');

const presentationsDir = path.join(__dirname, '..', 'presentations');
const distDir = path.join(__dirname, '..', 'dist');

for (const entry of fs.readdirSync(presentationsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const srcDir = path.join(presentationsDir, entry.name);
  const outDir = path.join(distDir, entry.name);
  if (!fs.existsSync(outDir)) continue;

  for (const file of fs.readdirSync(srcDir)) {
    if (file.endsWith('.md')) continue;

    const srcFile = path.join(srcDir, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, path.join(outDir, file));
    }
  }
}
