'use strict';
/* INFINYTHARQ - deterministic infinite profile universe. Pure vanilla JS.
   Profile N is computed from its ID string alone, so nothing needs storing. */

const FIRST = 360, BATCH = 300;

/* ---------- exact decimal ID helpers (strings only, no Number/parseInt) ---------- */
function normId(s) {
  s = String(s).trim().replace(/^#/, '').replace(/^0+(?=\d)/, '');
  return /^[1-9]\d*$/.test(s) ? s : null;
}
function incId(s) { // exact +1 on an arbitrarily long decimal string
  const a = s.split('');
  for (let i = a.length - 1; i >= 0; i--) {
    if (a[i] === '9') a[i] = '0';
    else { a[i] = String.fromCharCode(a[i].charCodeAt(0) + 1); return a.join(''); }
  }
  return '1' + a.join('');
}

/* ---------- seeded randomness from the ID string ---------- */
function seedFrom(id) {
  const h = [0x811c9dc5, 0x1b873593, 0xcc9e2d51, 0x85ebca6b];
  for (let i = 0; i < id.length; i++) {
    const c = id.charCodeAt(i);
    for (let k = 0; k < 4; k++) h[k] = Math.imul(h[k] ^ (c + k * 31), 16777619 + k * 2) >>> 0;
  }
  for (let k = 0; k < 4; k++) { h[k] = Math.imul(h[k] ^ (h[k] >>> 15), 0x2c1b3c6d) >>> 0; h[k] ^= h[(k + 1) % 4] >>> 13; }
  return h;
}
function rng(key) { // sfc32
  let [a, b, c, d] = seedFrom(key);
  const f = () => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0; t = (t + d) | 0; c = (c + t) | 0; return (t >>> 0) / 4294967296;
  };
  for (let i = 0; i < 12; i++) f();
  return f;
}

/* ---------- vocabulary ---------- */
const W = s => s.split(' '), L = s => s.split('|');
const PRE = W('ael bra cae dor eli fen gal hax ily jor kai lum mir nyx ori pax quil rhe syl tor ura vex wyn xan yor zel ash bel cyr dra eir fyn gry hel ivo kes lor mav nor');
const MID = W('a e i o u an en ar el or in ia ue ae ith yr ox al is um ez');
const END = W('ron dra lis nix thor wyn mere vik zar quin sel dane rae tis mon fia lor kai bel ric ven ula dor ssa gan rith');
const S1 = W('Star Moon Void Ember Frost Ash Storm Glimmer Nova Dusk Dawn Thorn Quartz Iron Silver Mist Rift Echo Lumen Cinder');
const S2 = W('weaver walker bloom fall song forge runner watcher cross ward veil hollow light shade drift mark born glass');
const OA = W('Cobalt Verdant Amber Obsidian Lunar Solar Crystal Silent Neon Drifting Hollow Gilded Misty Ancient Floating Violet');
const OB = W('Reach Harbor Spire Archipelago Basin Orbit Belt Colony Canyon Observatory Market Garden Station Atoll');
const PL = W('Veyra Oshun Tal-9 Kepler Halcyon Mirelle Dune Aster Pellis Zora Quenna Ixion');
const TR = W('curious stubborn gentle mischievous fearless dreamy meticulous restless generous wry patient bold shy loyal playful stoic radiant cunning tender inventive brooding cheerful fierce thoughtful impulsive serene sarcastic hopeful relentless humble witty');
const AU = W('Ember Tidal Aurora Frost Solar Lunar Void Verdant Prism Storm');
const ROLES = L("a cartographer of lost stars|a clockwork gardener|a dream archivist|a tide pilot|a glass-blower of comet dust|a signal poet|a moss botanist|a comet courier|a memory tailor|a lantern engineer|an ice sculptor|an orbital baker|a ruin surveyor|an echo tuner|a night-market chemist|a stormglass reader|an archive diver|a rooftop beekeeper|a pocket-universe mechanic|a wandering translator");
const QU = L("hums in a minor key whenever it rains|keeps a pet pebble named Gerald|never finishes a cup of tea|writes letters to the moon|counts every staircase out loud|collects mismatched gloves|laughs a full second before the joke|talks to machines like old friends|sleeps with one boot on|names every cloud they pass");
const HO = L("mapping constellations on tea towels|restoring broken music boxes|growing glowing mushrooms|trading riddles at the market|folding paper comets|sketching strangers on the tram|brewing smoky violet tea|repairing antique compasses|recording the sound of snow|stargazing from rooftops");
const MO = L("Every orbit has room for one more|Wander first, plan later|Small lights still count|Listen to the quiet parts|Curiosity pays the rent|Be the echo you want to hear|Borrow courage, return it doubled|Gravity is only a suggestion");
const EV = L("a meteor storm|a lost transmission|the Long Eclipse|a silent aurora|the Great Tide|a comet's return|the night the stars rearranged|a failed lighthouse test|the day the river ran uphill|a forgotten festival");
const MN = L("a retired comet-pilot|their grandmother|a wandering archivist|a stubborn old robot|the lighthouse keeper|a street astronomer|a masked cartographer|the village weaver");
const BIO = L("{n}, {age} cycles old, is {role} from {origin}. Most days you will find {n} {hobby}.|Born beneath {event} in {origin}, {n} grew into {role} with a talent for being {t1}.|{role}, {t1} by nature: {n} left {origin} once and has been drawn back ever since.|Locals in {origin} say {n} {quirk}. {n} just shrugs and goes back to {hobby}.|{n} is {role} who believes every {t2} act leaves a glow somewhere in the universe.|After {event}, {n} rebuilt a life in {origin} as {role}.");
const PER = L("{t1}, {t2}, and quietly {t3}: {n} wins people over by listening first and acting second.|Seen as {t1} by strangers and {t3} by friends, {n} balances both with practiced calm.|{n} runs on {t2} instinct; the {t1} streak shows when plans change, and the {t3} side saves the day.|Under a {t1} surface lives a {t2} heart, and {n} will never admit to being {t3}.");
const BK = L("Raised in {origin}, {n} was taught by {mentor}. Years later, {event} changed everything and set {n} on the path to becoming {role}.|{mentor} once told {n} that the sky keeps receipts. That lesson, plus {event}, shaped the {aura}-aligned life {n} lives today.|Few know that {n} left {origin} after {event}, carrying only a map, a tin cup, and a promise to {mentor}.|The {aura} aura of {n} was first noticed when {event} lit {origin} for three nights straight; {mentor} took {n} in soon after.");

const cap = s => s[0].toUpperCase() + s.slice(1);

function generate(id) {
  const r = rng(id), p = a => a[Math.floor(r() * a.length)];
  const first = cap(p(PRE) + p(MID) + p(END)), name = first + ' ' + p(S1) + p(S2);
  const hue = Math.floor(r() * 360);
  const role = p(ROLES), origin = p(OA) + ' ' + p(OB) + ', ' + p(PL);
  const traits = [];
  while (traits.length < 3) { const t = p(TR); if (!traits.includes(t)) traits.push(t); }
  const v = { n: first, role, origin, t1: traits[0], t2: traits[1], t3: traits[2], age: 17 + Math.floor(r() * 103),
    quirk: p(QU), hobby: p(HO), event: p(EV), mentor: p(MN), aura: p(AU) };
  const fill = s => cap(s.replace(/\{(\w+)\}/g, (_, k) => v[k]));
  const o = { id, name, hue, role, origin, traits, age: v.age, quirk: v.quirk, hobby: v.hobby, aura: v.aura, motto: p(MO),
    handle: first.toLowerCase() + '.' + seedFrom(id)[0].toString(36).slice(0, 6),
    bio: fill(p(BIO)), personality: fill(p(PER)), background: fill(p(BK)) };
  o.hay = (id + ' ' + name + ' ' + o.handle + ' ' + role + ' ' + origin + ' ' + traits.join(' ') + ' ' + o.quirk + ' ' + o.hobby + ' ' + o.aura + ' ' + o.bio).toLowerCase();
  return o;
}

function avatar(p) {
  const r = rng(p.id + '~'), h = p.hue, h2 = Math.floor((h + 40 + r() * 80) % 360), n = k => Math.floor(r() * k);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="g" cx="50%" cy="35%"><stop offset="0" stop-color="hsl(${h} 70% 45%)"/><stop offset="1" stop-color="hsl(${h2} 60% 8%)"/></radialGradient></defs><rect width="100" height="100" fill="url(#g)"/>`;
  for (let i = 0; i < 9; i++) s += `<circle cx="${n(100)}" cy="${n(60)}" r="${(r() * 1.2 + .3).toFixed(1)}" fill="#fff" opacity=".7"/>`;
  const skin = `hsl(${(h + 150 + n(60)) % 360} ${30 + n(40)}% ${55 + n(25)}%)`, acc = r();
  if (acc < .25) s += `<circle cx="50" cy="46" r="38" fill="none" stroke="hsl(${h} 100% 75%)" stroke-width="1.5" opacity=".7"/>`;
  s += `<path d="M10 100Q50 60 90 100Z" fill="hsl(${h2} 50% 28%)"/>`;
  if (acc > .75) s += `<path d="M34 34L28 16M66 34L72 16" stroke="${skin}" stroke-width="3" stroke-linecap="round"/><circle cx="28" cy="15" r="3" fill="hsl(${h} 100% 75%)"/><circle cx="72" cy="15" r="3" fill="hsl(${h} 100% 75%)"/>`;
  s += `<ellipse cx="50" cy="52" rx="${22 + n(8)}" ry="${25 + n(7)}" fill="${skin}"/>`;
  const ey = 48 + n(4), gap = 9 + n(5), glow = `hsl(${h} 100% 72%)`;
  s += `<circle cx="${50 - gap}" cy="${ey}" r="${3 + n(3)}" fill="${glow}"/><circle cx="${50 + gap}" cy="${ey}" r="${3 + n(3)}" fill="${glow}"/>`;
  if (r() < .2) s += `<circle cx="50" cy="${ey - 10}" r="3" fill="${glow}"/>`;
  s += `<path d="M${42 + n(4)} ${64 + n(4)}Q50 ${68 + n(8)} ${58 - n(4)} ${64 + n(4)}" stroke="#2a1240" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(s);
}

function cardHTML(p) {
  return `<button type="button" class="card" data-id="${p.id}"><span class="top"><img loading="lazy" decoding="async" width="60" height="60" alt="" src="${avatar(p)}"><span><span class="nm">${p.name}</span><span class="id">#${p.id}</span></span></span><span class="meta">${cap(p.role.replace(/^an? /, ''))} &middot; ${p.origin}</span><span class="bio">${p.bio}</span><span class="chips">${p.traits.map(t => `<i>${t}</i>`).join('')}</span></button>`;
}
function buildHTML(start, n) {
  let id = start, html = '';
  for (let i = 0; i < n; i++) { html += cardHTML(generate(id)); id = incId(id); }
  return { html, next: id };
}

if (typeof document === 'undefined') {
  module.exports = { normId, incId, generate, buildHTML, avatar };
} else (function () {
  const $ = id => document.getElementById(id);
  const universe = $('universe'), feed = $('feed'), sentinel = $('sentinel');
  const results = $('results'), rgrid = $('rgrid'), rstatus = $('rstatus');
  const modal = $('modal'), sheet = $('sheet'), q = $('q'), clear = $('clear');

  /* ---------- infinite feed ---------- */
  const chunks = [], queue = [];
  let prepId = '1', cur = null;           // background batch under construction

  // Generates part of the next batch off the scroll path; keeps 2 finished batches ready.
  function prepSlice(k) {
    if (!cur) { cur = { start: prepId, n: BATCH, i: 0, parts: [] }; }
    const lim = Math.min(cur.i + k, cur.n);
    for (; cur.i < lim; cur.i++) { cur.parts.push(cardHTML(generate(prepId))); prepId = incId(prepId); }
    if (cur.i >= cur.n) { queue.push({ start: cur.start, n: cur.n, html: cur.parts.join('') }); cur = null; }
  }
  const ghostIO = new IntersectionObserver(es => {
    for (const e of es) {
      const c = e.target._c;
      if (!c) continue;
      if (e.isIntersecting && !c.live) { c.el.classList.remove('ghost'); c.el.innerHTML = buildHTML(c.start, c.n).html; c.live = true; }
      else if (!e.isIntersecting && c.live) { c.el.innerHTML = ''; c.el.classList.add('ghost'); c.live = false; } // CSS keeps the exact height
    }
  }, { root: universe, rootMargin: '500% 0px' });

  function appendChunk(b) {
    const el = document.createElement('section');
    el.className = 'chunk'; el.style.setProperty('--n', b.n); el.innerHTML = b.html;
    const c = { el, start: b.start, n: b.n, live: true };
    el._c = c; chunks.push(c); feed.appendChild(el); ghostIO.observe(el);
  }
  function room() { return universe.scrollHeight - universe.scrollTop - universe.clientHeight; }
  function check() { // appending below the viewport never moves scrollTop
    for (let g = 0; g < 3 && room() < universe.clientHeight * 4; g++) {
      while (!queue.length) prepSlice(1e9);
      appendChunk(queue.shift());
    }
  }
  function trim() { // drop far-away old chunks so the page height stays bounded; compensate exactly
    if (chunks.length <= 220 || chunks[0].live) return;
    const a = chunks[1].el, before = a.getBoundingClientRect().top, old = chunks.shift();
    ghostIO.unobserve(old.el); old.el.remove();
    universe.scrollTop += a.getBoundingClientRect().top - before;
  }

  const f = buildHTML('1', FIRST);
  prepId = f.next;
  appendChunk({ start: '1', n: FIRST, html: f.html });
  // three independent triggers: IntersectionObserver, scroll event, and a timer
  new IntersectionObserver(check, { root: universe, rootMargin: '0px 0px 300% 0px' }).observe(sentinel);
  universe.addEventListener('scroll', check, { passive: true });
  (function loop() {
    const busy = queue.length < 2 || cur;
    if (busy) prepSlice(40);
    check(); trim();
    setTimeout(loop, busy ? 30 : 250);
  })();

  /* ---------- profile detail ---------- */
  let lastFocus = null, opened = false;
  function openProfile(id) {
    const p = generate(id);
    lastFocus = document.activeElement;
    const row = (k, v) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
    sheet.innerHTML = `<button type="button" class="back">&larr; Back to universe</button>
      <div class="hero"><img alt="" src="${avatar(p)}"><div><h2>${p.name}</h2><div class="id">#${p.id}</div><div class="meta">@${p.handle}</div></div></div>
      <div class="chips">${p.traits.map(t => `<i>${t}</i>`).join('')}</div>
      <h3>Biography</h3><p>${p.bio}</p><h3>Personality</h3><p>${p.personality}</p><h3>Background</h3><p>${p.background}</p>
      <h3>Details</h3><dl>${row('Origin', p.origin)}${row('Age', p.age + ' cycles')}${row('Occupation', cap(p.role.replace(/^an? /, '')))}${row('Aura', p.aura)}${row('Favorite pastime', cap(p.hobby))}${row('Known for', 'Someone who ' + p.quirk)}${row('Motto', '&ldquo;' + p.motto + '&rdquo;')}</dl>`;
    modal.hidden = false; sheet.scrollTop = 0;
    if (!opened) { history.pushState({ p: 1 }, ''); opened = true; }
    sheet.querySelector('.back').focus();
  }
  function closeProfile() { if (opened) history.back(); else hideModal(); }
  function hideModal() { modal.hidden = true; opened = false; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  addEventListener('popstate', () => { if (!modal.hidden) hideModal(); });
  sheet.addEventListener('click', e => { if (e.target.closest('.back')) closeProfile(); });
  modal.addEventListener('click', e => { if (e.target === modal) closeProfile(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeProfile(); });
  const pick = e => { const c = e.target.closest('.card'); if (c) openProfile(c.dataset.id); };
  feed.addEventListener('click', pick); rgrid.addEventListener('click', pick);

  /* ---------- search ---------- */
  let token = 0, timer = 0;
  function runSearch() {
    const raw = q.value.trim(), t = ++token;
    clear.hidden = !q.value; rgrid.textContent = ''; rstatus.textContent = '';
    if (!raw) { results.hidden = true; return; }
    results.hidden = false; results.scrollTop = 0;
    const bare = raw.replace(/^#/, '');
    if (/^\d+$/.test(bare)) { // exact decimal ID: computed directly, any length
      const id = normId(bare);
      if (!id) { rstatus.textContent = 'Profile IDs are positive whole numbers.'; return; }
      rgrid.innerHTML = cardHTML(generate(id));
      rstatus.textContent = 'Exact match for ID ' + id;
      return;
    }
    const terms = raw.toLowerCase().replace(/^#/, '').split(/\s+/);
    let id = '1', found = 0;
    (function step() { // streams matches forever, pausing while enough are already queued below the fold
      if (t !== token) return;
      if (found && results.scrollHeight - results.scrollTop - results.clientHeight > results.clientHeight * 3) { setTimeout(step, 300); return; }
      const end = performance.now() + 10; let html = '';
      while (performance.now() < end) {
        const p = generate(id);
        if (terms.every(w => p.hay.includes(w))) { html += cardHTML(p); found++; }
        id = incId(id);
      }
      if (html) rgrid.insertAdjacentHTML('beforeend', html);
      rstatus.textContent = (found ? 'Showing matches' : 'Searching') + ' \u00b7 scanned up to ID ' + id;
      setTimeout(step, 0);
    })();
  }
  q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(runSearch, 220); });
  $('bar').addEventListener('submit', e => { e.preventDefault(); clearTimeout(timer); runSearch(); q.blur(); });
  clear.addEventListener('click', () => { q.value = ''; runSearch(); q.focus(); });
})();
