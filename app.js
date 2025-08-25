// /app.js
async function loadOptions(url, selectEl) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const arr = await res.json();

    // reset 
    [...selectEl.querySelectorAll('option:not(:first-child)')].forEach(o => o.remove());

    for (const it of arr) {
      const opt = document.createElement('option');
      opt.value = it.url;          // ex: cal/publics/xxx.ics
      opt.textContent = it.label;  // ex: BUT2 Info A
      selectEl.appendChild(opt);
    }
  } catch (e) {
    console.error('loadOptions failed for', url, e);
    selectEl.innerHTML = '<option value="">Erreur: impossible de charger la liste</option>';
    selectEl.disabled = true;
  }
}

function wireSelect(selectId, linkId) {
  const sel = document.getElementById(selectId);
  const a   = document.getElementById(linkId);
  sel?.addEventListener('change', () => {
    if (sel.value) {
      a.href = sel.value;
      a.classList.remove('hidden');
      // DL direct à la sélection :
      // window.location.assign(sel.value);
    } else {
      a.classList.add('hidden');
      a.removeAttribute('href');
    }
  });
}

async function init() {
  await Promise.all([
    loadOptions('cal/publics/index.json', document.getElementById('sel-public')),
    loadOptions('cal/ues/index.json',     document.getElementById('sel-ue')),
  ]);
  wireSelect('sel-public', 'dl-public');
  wireSelect('sel-ue',     'dl-ue');
}

document.addEventListener('DOMContentLoaded', init);
