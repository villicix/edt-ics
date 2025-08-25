const ROOTS = {
  publics: 'cal/publics',
  ues: 'cal/ues'
};

const STATE = { filterPublic: '', filterUe: '' };

const $ = (sel) => document.querySelector(sel);
const el = (tag, attrs = {}, ...kids) => {
  const node = Object.assign(document.createElement(tag), attrs);
  for (const k of kids) node.append(k);
  return node;
};

async function loadManifest() {
  const res = await fetch('manifest.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('manifest.json introuvable');
  return res.json();
}

function buildUrl(base, pathParts) {
  // URLs en query (compat GH Pages), ex: /?type=publics&slug=L1-INF
  const qs = new URLSearchParams({ type: base, slug: pathParts.join('/') });
  return `${location.origin}${location.pathname}?${qs.toString()}`;
}

function buildCleanUrl(base, pathParts) {
  // Variante non-routeable en prod GH Pages (fonctionne via JS): /p/publics/L1-INF
  return `${location.origin}${location.pathname}#/${base}/${pathParts.join('/')}`;
}

function makeItem(kind, slug, files) {
  const url = buildUrl(kind, [slug]);
  const clean = buildCleanUrl(kind, [slug]);
  const count = files.length;
  const left = el('div', { className:'row' },
    el('span', { className:'pill' }, slug),
    el('span', { className:'muted' }, `${count} fichier${count>1?'s':''}`)
  );
  const actions = el('div', { className:'actions' },
    el('a', { href:url, className:'btn', title:'Ouvrir URL routeable' }, 'Ouvrir'),
    el('button', { className:'btn', onclick: () => navigator.clipboard.writeText(url) }, 'Copier URL'),
    el('button', { className:'btn', onclick: () => navigator.clipboard.writeText(clean) }, 'Copier #URL')
  );
  return el('div', { className:'item', role:'listitem' }, left, actions);
}

function renderList(container, items, kind, filter='') {
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  items
    .filter(({ slug }) => slug.toLowerCase().includes(filter.toLowerCase()))
    .sort((a,b)=> a.slug.localeCompare(b.slug, 'fr'))
    .forEach(({ slug, files }) => frag.appendChild(makeItem(kind, slug, files)));
  container.appendChild(frag);
}

function attachSearch(manifest) {
  const $p = $('#search-public');
  const $u = $('#search-ue');
  const listP = $('#list-public');
  const listU = $('#list-ue');

  const publics = Object.entries(manifest.publics).map(([slug, files]) => ({ slug, files }));
  const ues = Object.entries(manifest.ues).map(([slug, files]) => ({ slug, files }));

  renderList(listP, publics, 'publics', STATE.filterPublic);
  renderList(listU, ues, 'ues', STATE.filterUe);

  $p.addEventListener('input', (e)=>{ STATE.filterPublic = e.target.value; renderList(listP, publics, 'publics', STATE.filterPublic); });
  $u.addEventListener('input', (e)=>{ STATE.filterUe = e.target.value; renderList(listU, ues, 'ues', STATE.filterUe); });
}

function applyKeyboardShortcuts(){
  // L = toggle layout (liste / grille)
  document.addEventListener('keydown', (e)=>{
    if (e.key.toLowerCase()==='l') {
      const grid = document.querySelector('.grid');
      grid.style.gridTemplateColumns = getComputedStyle(grid).gridTemplateColumns.includes('minmax')
        ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))';
    }
  });
}

function routeFromUrl(manifest){
  const p = new URLSearchParams(location.search);
  const type = p.get('type');
  const slug = p.get('slug');
  if (!type || !slug) return;

  const base = type === 'publics' ? manifest.publics : manifest.ues;
  const files = base?.[slug];
  if (!files) return;

  // Si on a un seul ICS 
  if (files.length === 1) {
    location.href = files[0];
    return;
  }
  // Liste des ics dispos
  const choices = files.map((href)=> `• <a href="${href}">${href.split('/').pop()}</a>`).join('<br>');
  const box = document.createElement('div');
  box.style = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:grid;place-items:center;z-index:9999;';
  box.innerHTML = `<div style="background:#0f0f15;border:1px solid rgba(255,255,255,.1);padding:20px;border-radius:12px;max-width:720px">
    <h3 style="margin:0 0 8px">Plusieurs fichiers disponibles</h3>
    <p class="muted" style="margin-top:0">Sélectionne celui que tu veux :</p>
    <div style="line-height:1.9">${choices}</div>
    <div style="margin-top:12px;text-align:right"><button class="btn" onclick="this.closest('div').parentElement.remove()">Fermer</button></div>
  </div>`;
  document.body.appendChild(box);
}

async function main(){
  try {
    const manifest = await loadManifest();
    attachSearch(manifest);
    applyKeyboardShortcuts();
    routeFromUrl(manifest);
  } catch (e) {
    console.error(e);
    alert('Erreur de chargement du manifest. Vérifie le fichier manifest.json.');
  }
}

addEventListener('DOMContentLoaded', main);
