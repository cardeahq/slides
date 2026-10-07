// Generates dist/index.html linking to each built deck, so the Pages root isn't a 404.
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const presentationsDir = path.join(__dirname, '..', 'presentations');

// A deck is a dist/<name>/ folder holding slides.html or one slides.<lang>.html per language.
const slidesOf = (name) =>
  fs
    .readdirSync(path.join(distDir, name))
    .filter((file) => /^slides(\.[a-z]{2})?\.html$/.test(file))
    .sort();

const decks = fs
  .readdirSync(distDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => slidesOf(name).length > 0)
  .sort();

// Reuse a deck's logo as the site-wide brand logo, since there's no separate
// top-level brand asset yet.
const logoDeck = decks.find((name) => fs.existsSync(path.join(presentationsDir, name, 'logo.svg')));
if (logoDeck) {
  fs.copyFileSync(path.join(presentationsDir, logoDeck, 'logo.svg'), path.join(distDir, 'logo.svg'));
}

const items = decks
  .map((name) => {
    const title = name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const files = slidesOf(name);
    if (files.length === 1 && files[0] === 'slides.html') {
      return `      <li><a href="${name}/slides.html">${title}</a></li>`;
    }
    const links = files.map((file) => {
      const lang = file.match(/^slides\.([a-z]{2})\.html$/)[1].toUpperCase();
      return `<a href="${name}/${file}">${lang}</a>`;
    });
    return `      <li>${title}: ${links.join(' | ')}</li>`;
  })
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Cardea Slides</title>
    <style>
      body { font-family: sans-serif; background: #1e293b; color: #e2e8f0; padding: 2rem; }
      a { color: #38bdf8; }
      li { margin: 0.5rem 0; }
      .logo { width: 96px; height: 96px; display: block; margin-bottom: 1.5rem; }
    </style>
  </head>
  <body>
${logoDeck ? '    <img class="logo" src="logo.svg" alt="Cardea logo" />\n' : ''}    <h1>Cardea Slides</h1>
    <ul>
${items}
    </ul>
  </body>
</html>
`;

fs.writeFileSync(path.join(distDir, 'index.html'), html);
console.log(`Wrote dist/index.html with ${decks.length} deck(s).`);
