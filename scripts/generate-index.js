// node scripts/generate-index.js
const fs = require('fs');
const path = require('path');

function listICS(dir) {
  const abs = path.resolve(dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.toLowerCase().endsWith('.ics'))
    .map(d => {
      const file = d.name;
      const name = file.replace(/\.ics$/i, '');
      const label = name
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      // URL relative au site 
      return { label, url: `${dir}/${encodeURIComponent(file)}` };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' }));
}

function writeJSON(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✔ Wrote ${file} (${data.length} items)`);
}

const publics = listICS('cal/publics');
const ues     = listICS('cal/ues');

writeJSON('cal/publics/index.json', publics);
writeJSON('cal/ues/index.json', ues);
