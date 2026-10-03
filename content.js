(() => {
  const ID = 'tf-root';
  let folders = {};  // { nombre: ['login', ...] }
  let collapsed = {}; // { nombre: true }
  let section = null, observer = null, t = null;

  const load = () => new Promise(r => chrome.storage.local.get(['folders', 'collapsed'], d => { folders = d.folders || {}; collapsed = d.collapsed || {}; r(); }));
  const save = () => chrome.storage.local.set({ folders, collapsed });
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const OFF = /\b(offline|desconectado|hors ligne|не в сети)\b/i;

  // ---------- localizar la sección "Canales que sigues" ----------
  function findSection() {
    const nav = document.querySelector('[data-a-target="side-nav-bar"], #side-nav, nav.side-nav');
    if (!nav) return null;
    if (nav.querySelector('.side-nav--collapsed, [class*="collapsed"]') || nav.getBoundingClientRect().width < 100) return 'collapsed';
    const a = nav.querySelector('a[href^="/"]:not([href*="/directory"])');
    return a ? (a.closest('[class*="side-nav-section"]') || a.parentElement.parentElement) : null;
  }

  // ---------- leer las tarjetas originales ----------
  function readCards() {
    const map = new Map();
    for (const a of section.querySelectorAll('a[href^="/"]')) {
      const m = a.getAttribute('href').match(/^\/([a-z0-9_]+)\/?$/i);
      if (!m || m[1] === 'directory') continue;
      const card = a.closest('[class*="side-nav-card"]:not(a)') || a;
      if (card.closest('#' + ID)) continue;
      const live = !card.querySelector('[class*="offline"]') && !OFF.test(card.textContent);
      map.set(m[1].toLowerCase(), { card, live });
    }
    return map;
  }

  // ---------- render ----------
  function render() {
    const s = findSection();
    if (s === 'collapsed' || !s) { teardown(); return; }
    if (s !== section) { teardown(); section = s; }
    if (document.activeElement?.classList.contains('tf-in')) { clearTimeout(t); t = setTimeout(render, 1000); return; }
    const cards = readCards();
    if (!cards.size) return;

    let root = section.querySelector('#' + ID);
    if (!root) {
      root = el('div'); root.id = ID;
      const first = [...cards.values()][0].card;
      (first.parentElement.parentElement === section ? first.parentElement : first).before(root);
    }
    root.innerHTML = '';
    for (const { card } of cards.values()) card.classList.add('tf-hidden');

    // crear carpeta
    const head = el('div', 'tf-new');
    const inp = el('input', 'tf-in'); inp.placeholder = '+ New folder';
    for (const ev of ['keydown', 'keyup', 'keypress']) inp.addEventListener(ev, e => e.stopPropagation());
    inp.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') { const n = inp.value.trim(); if (n && !folders[n] && n !== 'Others') { folders[n] = []; save(); inp.value = ''; render(); } } };
    head.append(inp); root.append(head);

    const assigned = new Set(Object.values(folders).flat());
    const list = Object.keys(folders).map(n => [n, folders[n]]);
    list.push(['Others', [...cards.keys()].filter(l => !assigned.has(l))]);

    for (const [name, logins] of list) {
      const live = logins.filter(l => cards.get(l)?.live);
      const f = el('div', 'tf-folder' + (collapsed[name] ? ' tf-col' : ''));
      const h = el('div', 'tf-h');
      h.append(el('span', 'tf-chev', '▾'), el('span', 'tf-name', name), el('span', 'tf-n', String(live.length)));
      if (name !== 'Others') {
        const x = el('button', 'tf-x', '×'); x.title = 'Delete folder';
        x.onclick = e => { e.stopPropagation(); delete folders[name]; delete collapsed[name]; save(); render(); };
        h.append(x);
      }
      h.onclick = () => { collapsed[name] = !collapsed[name]; save(); f.classList.toggle('tf-col', collapsed[name]); };
      f.append(h);
      const body = el('div', 'tf-body');
      for (const l of live) {
        const { card } = cards.get(l);
        const c = card.cloneNode(true);
        c.classList.remove('tf-hidden'); c.classList.add('tf-card'); c.draggable = true;
        c.ondragstart = e => { e.dataTransfer.setData('text/plain', l); e.dataTransfer.effectAllowed = 'move'; };
        c.onclick = e => { e.preventDefault(); (card.querySelector('a') || card).click(); };
        body.append(c);
      }
      if (!live.length) body.append(el('div', 'tf-empty', 'No one live'));
      f.append(body);
      f.ondragover = e => { e.preventDefault(); f.classList.add('tf-over'); };
      f.ondragleave = () => f.classList.remove('tf-over');
      f.ondrop = e => {
        e.preventDefault(); f.classList.remove('tf-over');
        const l = e.dataTransfer.getData('text/plain'); if (!l) return;
        for (const k in folders) folders[k] = folders[k].filter(x => x !== l);
        if (name !== 'Others') folders[name].push(l);
        save(); render();
      };
      root.append(f);
    }
  }

  function teardown() {
    document.getElementById(ID)?.remove();
    document.querySelectorAll('.tf-hidden').forEach(e => e.classList.remove('tf-hidden'));
    section = null;
  }

  // ---------- resistente a cambios: observa el DOM y re-renderiza con debounce ----------
  function schedule(muts) {
    if (muts && muts.every(m => (m.target.nodeType === 1 ? m.target : m.target.parentElement)?.closest('#' + ID))) return;
    clearTimeout(t); t = setTimeout(render, 250);
  }
  load().then(() => {
    render();
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'href'] });
    window.addEventListener('resize', () => schedule());
  });
})();
