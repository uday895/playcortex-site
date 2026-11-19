/* PlayCortex v3 — shared behaviour */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* header: scrolled state, dropdowns, mobile menu */
const hd = $('.hd');
const onS = () => hd && hd.classList.toggle('sc', scrollY > 30);
addEventListener('scroll', onS, { passive: true }); onS();
$$('.dd').forEach(d => {
  const b = $('button', d);
  b.addEventListener('click', e => { e.stopPropagation(); const o = !d.classList.contains('open'); $$('.dd.open').forEach(x => x.classList.remove('open')); d.classList.toggle('open', o); b.setAttribute('aria-expanded', o); });
});
document.addEventListener('click', e => { if (!e.target.closest('.dd')) $$('.dd.open').forEach(x => x.classList.remove('open')); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { $$('.dd.open').forEach(x => x.classList.remove('open')); closeVid(); document.body.classList.remove('mopen'); } });
const bg = $('.burger');
if (bg) bg.addEventListener('click', () => { const o = document.body.classList.toggle('mopen'); bg.setAttribute('aria-expanded', o); });

/* reveal on scroll */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
$$('.rv').forEach(el => io.observe(el));

/* count-up numbers */
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; cio.unobserve(e.target);
  const el = e.target, to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0), t0 = performance.now(), D = RM ? 0 : 1400;
  const f = t => { const p = D ? Math.min(1, (t - t0) / D) : 1, v = to * (1 - Math.pow(1 - p, 3)); el.textContent = v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec }); if (p < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}), { threshold: .4 });
$$('[data-to]').forEach(el => cio.observe(el));

/* bars */
const bio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { $$('.bar i', e.target).forEach(i => i.style.setProperty('--s', 1)); } }), { threshold: .2 });
$$('.board').forEach(b => bio.observe(b));

/* tabs (generic): [data-tabs] container with buttons[data-i] and panels .tp[data-i] */
$$('[data-tabs]').forEach(w => {
  const bs = $$('[data-i]', $(w.dataset.tabs === 'self' ? '.tabs' : w.dataset.tabs, w) || w).filter(b => b.tagName === 'BUTTON');
  const ps = $$('.tp', w);
  bs.forEach(b => b.addEventListener('click', () => {
    bs.forEach(x => x.classList.toggle('on', x === b));
    ps.forEach(p => p.classList.toggle('on', p.dataset.i === b.dataset.i));
    $$('.bar i', w).forEach(i => { i.style.setProperty('--s', 0); requestAnimationFrame(() => requestAnimationFrame(() => i.style.setProperty('--s', 1))); });
  }));
});

/* carousel pager */
$$('[data-car]').forEach(w => {
  const c = $('.car', w), n = $('.pg-n', w), cards = $$('.lc', c);
  const step = () => cards[0].getBoundingClientRect().width + 20;
  const upd = () => { const i = Math.round(c.scrollLeft / step()); if (n) n.textContent = String(Math.min(cards.length, i + 1)).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0'); };
  $('.pg-p', w).addEventListener('click', () => c.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('.pg-x', w).addEventListener('click', () => c.scrollBy({ left: step(), behavior: 'smooth' }));
  c.addEventListener('scroll', upd, { passive: true }); upd();
});

/* video modal */
const vm = $('.vm');
function closeVid() { if (!vm) return; const v = $('video', vm); v.pause(); vm.classList.remove('on'); }
$$('[data-video]').forEach(b => b.addEventListener('click', () => {
  const v = $('video', vm), src = new URL(b.dataset.video, location.href).href;
  if (v.src !== src) { v.src = src; if (b.dataset.poster) v.poster = b.dataset.poster; }
  vm.classList.add('on'); v.play().catch(() => {});
}));
if (vm) { $('button', vm).addEventListener('click', closeVid); vm.addEventListener('click', e => { if (e.target === vm) closeVid(); }); }

/* story filters + load more */
const sg = $('#stories-grid');
if (sg) {
  const items = $$('.stc', sg); let lim = 12, f = 'all';
  const draw = () => { let n = 0; items.forEach(it => { const ok = f === 'all' || it.dataset.k === f; const show = ok && n < lim; if (ok) n++; it.hidden = !show; }); const m = $('#more'); if (m) m.hidden = n <= lim; };
  $$('.filt button').forEach(b => b.addEventListener('click', () => { $$('.filt button').forEach(x => x.classList.toggle('on', x === b)); f = b.dataset.f; lim = 12; draw(); }));
  const m = $('#more'); if (m) m.addEventListener('click', () => { lim += 12; draw(); });
  draw();
}

/* ---------- KRU scenario timeline (real app screens) ---------- */
const scn = $('.scn');
if (scn) {
  const S = JSON.parse($('#scn-data').textContent);
  const btns = $$('.tl button', scn), stage = $('.stage', scn), phones = $$('.scr-set .phone', scn), txt = $('.sc-txt', scn);
  let cur = 0, timer, vis = false, started = false;
  function show(i) {
    cur = i; clearTimeout(timer);
    btns.forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-selected', j === i); });
    phones.forEach((p, j) => p.classList.toggle('on', j === i));
    stage.dataset.c = S[i].c;
    txt.style.opacity = 0;
    setTimeout(() => { $('.chip b', txt).textContent = S[i].who; $('h3', txt).textContent = S[i].h; $('p', txt).innerHTML = S[i].p; txt.style.opacity = 1; }, RM ? 0 : 180);
    if (!RM) timer = setTimeout(() => { if (vis) show((cur + 1) % S.length); }, 6000);
  }
  new IntersectionObserver(es => es.forEach(e => { const was = vis; vis = e.isIntersecting; if (vis && !started) { started = true; show(0); } else if (vis && !was) show(cur); }), { threshold: .3 }).observe(scn);
  btns.forEach((b, j) => b.addEventListener('click', () => show(j)));
}

/* browser window tabs: [data-btabs] with .btabs buttons and .browser-v imgs */
$$('[data-btabs]').forEach(w => {
  const bs = $$('.btabs button', w), ims = $$('.browser-v img', w), cap = $('.browser-b span', w);
  const pick = i => {
    bs.forEach((b, j) => b.classList.toggle('on', j === i));
    ims.forEach((m, j) => { if (j === i && m.dataset.src) { m.src = m.dataset.src; m.removeAttribute('data-src'); } m.classList.toggle('on', j === i); });
    if (cap) cap.textContent = bs[i].dataset.cap || '';
  };
  bs.forEach((b, i) => b.addEventListener('click', () => pick(i)));
});

/* static KRU windows that play once when visible: .kw[data-chat] */
$$('.kw[data-chat]').forEach(w => {
  const msgs = $$('.msg', w);
  const run = () => msgs.forEach((m, i) => setTimeout(() => { m.classList.add('in'); $$('.sl .tr i', m).forEach(x => x.style.width = x.dataset.v); }, RM ? 0 : 350 + i * 750));
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { run(); o.disconnect(); } }), { threshold: .35 }).observe(w);
});

/* FAQ: one open at a time */
$$('.faq details').forEach(d => d.addEventListener('toggle', () => { if (d.open) $$('.faq details').forEach(x => { if (x !== d) x.open = false; }); }));

/* "Ask KRU" box → waitlist (message carried in sessionStorage, never the URL) */
const ask = $('.ask form');
if (ask) {
  const ta = $('textarea', ask);
  $$('.sugg button').forEach(b => b.addEventListener('click', () => { ta.value = b.textContent; ta.focus(); }));
  ask.addEventListener('submit', e => { e.preventDefault(); try { sessionStorage.setItem('kru_ask', ta.value.trim()); } catch (x) {} location.href = ask.getAttribute('action'); });
}

/* forms → same Google Sheet endpoint as the live site */
const PC_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxKrHTl3pDPZwBhFLbrFvARP-10PgIYSAayVOHdaK-twtHeCE047bX54yzx-e024g/exec';
$$('form.form').forEach(f => {
  const q = new URLSearchParams(location.search), sel = $('select[name=role]', f);
  if (sel && q.get('topic') === 'demo') sel.value = 'An academy, team or coach interested in KRU';
  if (sel && q.get('topic') === 'join') sel.value = "I'd like to join the team";
  if (sel && q.get('topic') === 'community') sel.value = "I'd like to join The Inner Game";
  if (sel && q.get('topic') === 'expert') sel.value = 'An expert or practitioner';
  const msg = $('textarea[name=message]', f); try { const a = sessionStorage.getItem('kru_ask'); if (msg && a) { msg.value = a; sessionStorage.removeItem('kru_ask'); } } catch (x) {}
  f.addEventListener('submit', e => {
    e.preventDefault();
    const bad = $$('[required]', f).find(x => !x.value.trim() || (x.type === 'email' && !/^\S+@\S+\.\S+$/.test(x.value)));
    if (bad) { bad.focus(); bad.style.borderColor = '#C2410C'; return; }
    const d = Object.fromEntries(new FormData(f)), subject = f.dataset.subject || 'PlayCortex enquiry';
    const LBL = { sport: 'Sport', org: 'Organisation', city: 'City' };
    // same columns the live site writes: role, name, number, topic, page
    const row = { role: d.role || subject, name: (d.name || '').slice(0, 80), number: d.phone || '', topic: [subject, d.email || '', ...Object.keys(LBL).filter(k => d[k]).map(k => LBL[k] + ': ' + d[k]), d.message || ''].filter(Boolean).join(' · '), page: location.hostname + location.pathname };
    try { fetch(PC_SHEET_URL, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(row) }).catch(() => {}); } catch (x) {}
    f.classList.add('done'); f.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

/* "How KRU works" diagram: plays only when scrolled into view, then loops every 12s while visible */
$$('.dg-wrap').forEach(w => {
  let vis = false, timer;
  const dots = () => $$('animateMotion', w).forEach((m, i) => { try { m.beginElement(); } catch (x) {} });
  const play = () => {
    clearTimeout(timer);
    w.classList.add('reset'); w.classList.remove('dg-on'); void w.offsetWidth; w.classList.remove('reset');
    setTimeout(() => { w.classList.add('dg-on'); setTimeout(dots, RM ? 0 : 2600); }, 40);
    if (!RM) timer = setTimeout(() => { timer = 0; if (vis) play(); }, 12000);
  };
  if (RM) { w.classList.add('dg-on'); dots(); return; }
  let started = false;
  new IntersectionObserver(es => es.forEach(e => {
    vis = e.isIntersecting && e.intersectionRatio > 0;
    if (vis && !started) { started = true; play(); }               // begins the first time it is scrolled to
    else if (vis && !timer) timer = setTimeout(() => { timer = 0; if (vis) play(); }, 1500);  // resume looping
  }), { threshold: [0, .35] }).observe(w);
});

/* ---------- KRU chat demos (same look as the real app): shared helpers ---------- */
const kdWait = ms => new Promise(r => setTimeout(r, ms));
const kdData = root => { const m = {}; if (root) $$('[data-k]', root).forEach(d => { const q = $('.q', d), a = $('.a', d); m[d.dataset.k] = { q: q ? q.textContent : '', a: a ? a.innerHTML : '', kw: (d.dataset.kw || '').split(',').filter(Boolean), steps: +(d.dataset.steps || 3) }; }); return m; };
/* coach: grey bubble, then "Worked for N s · N steps", a rule, then the plain-text answer. athlete: grey bubble, then plain text. */
async function kdReply(th, body, it, alive, coach, wk) {
  let u = null;
  if (it.q) { u = document.createElement('div'); u.className = 'kd-u'; u.textContent = it.q; th.appendChild(u); }
  const r = document.createElement('div'); r.className = coach ? 'kd-r cw-r' : 'kd-r ka-r';
  const w = coach && it.q ? document.createElement('div') : null;
  if (w) { w.className = 'cw-wk'; w.innerHTML = '<span class="kd-dots"><i></i><i></i><i></i></span>'; r.appendChild(w); }
  const a = document.createElement('div'); a.className = 'kd-ans';
  if (!w) a.innerHTML = '<span class="kd-dots"><i></i><i></i><i></i></span>';
  r.appendChild(a); th.appendChild(r);
  body.scrollTo({ top: (u || r).offsetTop - 12, behavior: RM ? 'auto' : 'smooth' });
  await kdWait(RM ? 0 : (coach ? 1300 : 950)); if (!alive()) return;
  if (w) w.textContent = (wk || 'Worked for {s} s · {n} steps').replace('{s}', 2 + it.steps).replace('{n}', it.steps) + ' ›';
  a.innerHTML = it.a; void a.offsetWidth; a.classList.add('in');
}

/* academies page: auto-playing coach demo. Plays only while on screen; chips and sidebar jump to a topic. */
$$('[data-kd=auto]').forEach(W => {
  const kd = $('.cw', W), th = $('.kd-th', kd), body = $('.kd-body', kd), tx = $('.kd-tx', kd), go = $('.kd-go', kd);
  const chips = $$('.kd-chips button', W), side = $$('.cw-si', kd), D = kdData($('.kd-data', W)), keys = chips.map(c => c.dataset.k);
  const wk = ($('.kd-wk', W) || {}).textContent;
  let cur = 0, tok = 0, vis = false, started = false, holdT, waiting = false;
  const HOLD = 3500;
  async function run(i) {
    const me = ++tok, alive = () => me === tok; clearTimeout(holdT); waiting = false;
    cur = i;
    chips.forEach((c, j) => { c.classList.toggle('on', j === i); c.classList.toggle('hold', false); c.setAttribute('aria-selected', j === i); });
    side.forEach((s, j) => s.classList.toggle('on', j === i));
    const cr = chips[i].parentNode; if (cr.scrollWidth > cr.clientWidth) cr.scrollTo({ left: chips[i].offsetLeft - (cr.clientWidth - chips[i].offsetWidth) / 2, behavior: RM ? 'auto' : 'smooth' });
    const it = D[keys[i]]; th.innerHTML = ''; kd.classList.toggle('asked', false); tx.textContent = ''; body.scrollTop = 0;
    if (RM) { kd.classList.add('asked'); await kdReply(th, body, it, alive, true, wk); return; }
    await kdWait(700); if (!alive()) return;
    for (let n = 1; n <= it.q.length; n++) { tx.textContent = it.q.slice(0, n); await kdWait(32); if (!alive()) return; }
    await kdWait(380); if (!alive()) return;
    go.classList.add('hit'); setTimeout(() => go.classList.toggle('hit', false), 160);
    tx.textContent = ''; kd.classList.add('asked');
    await kdReply(th, body, it, alive, true, wk); if (!alive()) return;
    chips[i].style.setProperty('--hold', HOLD + 'ms'); void chips[i].offsetWidth; chips[i].classList.add('hold');
    holdT = setTimeout(() => { if (!alive()) return; if (vis) run((cur + 1) % keys.length); else waiting = true; }, HOLD);
  }
  chips.forEach((c, j) => c.addEventListener('click', () => { started = true; run(j); }));
  side.forEach((s, j) => s.addEventListener('click', () => { started = true; run(j); }));
  new IntersectionObserver(es => es.forEach(e => {
    vis = e.isIntersecting;
    if (vis && !started) { started = true; run(0); }
    else if (vis && waiting) run((cur + 1) % keys.length);
  }), { threshold: .3 }).observe(kd);
});

/* Try KRU: a small free preview, opened by any [data-try]. Athlete = phone chat, coach = coach workspace. 3 questions in total. */
const kt = $('.kt');
if (kt) {
  const MSG = kdData($('.kt-msg', kt)), wk = ($('.kd-wk', kt) || {}).textContent;
  const P = {};
  ['athlete', 'coach'].forEach(m => {
    const root = $(`[data-m=${m}].ka, [data-m=${m}].kc`, kt);
    P[m] = { root, th: $('.kd-th', root), body: $('.kd-body', root), form: $('form', root), ta: $('textarea', root), D: kdData($('.kd-data', root)), coach: m === 'coach', shell: $('.cw', root) || root };
  });
  let mode = 'athlete', left = 3, busy = false, tok = 0, opener;
  const nEls = $$('.kt-n', kt);
  const setMode = m => {
    mode = m; tok++; busy = false;
    $$('.kt-mode button', kt).forEach(b => b.classList.toggle('on', b.dataset.m === m));
    Object.keys(P).forEach(k => { P[k].root.hidden = k !== m; });
    kt.classList.toggle('kt-coach', m === 'coach');
  };
  const open = e => {
    opener = e && e.currentTarget; kt.hidden = false; document.body.classList.add('kt-open');
    $$('.dd.open').forEach(x => x.classList.toggle('open', false)); document.body.classList.toggle('mopen', false);
    if (matchMedia('(hover:hover)').matches) setTimeout(() => P[mode].ta.focus({ preventScroll: true }), 60);
  };
  const close = () => { kt.hidden = true; document.body.classList.toggle('kt-open', false); if (opener) opener.focus({ preventScroll: true }); };
  $$('[data-try]').forEach(b => b.addEventListener('click', open));
  $$('.kt-x', kt).forEach(b => b.addEventListener('click', close));
  kt.addEventListener('click', e => { if (e.target === kt || e.target.classList.contains('kt-in')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !kt.hidden) close(); });
  $$('.kt-mode button', kt).forEach(b => b.addEventListener('click', () => setMode(b.dataset.m)));
  const newChat = $('.ka-new', kt);
  if (newChat) newChat.addEventListener('click', () => { if (left > 0) { tok++; busy = false; P.athlete.th.innerHTML = ''; P.athlete.shell.classList.toggle('asked', false); } });
  async function ask(q, key) {
    const S = P[mode];
    if (busy || left <= 0 || !q) return;
    busy = true; const me = ++tok, alive = () => me === tok;
    left--; nEls.forEach(n => { n.textContent = left; });
    S.shell.classList.add('asked');
    const it = key && S.D[key] ? S.D[key] : { a: MSG.none.a, steps: 2 };
    if (key) $$(`.kt-sug button[data-k=${key}]`, S.root).forEach(b => { b.hidden = true; });
    if (S.coach) S.root.querySelectorAll('.cw-si').forEach(s => s.classList.toggle('on', s.dataset.k === key));
    await kdReply(S.th, S.body, { q, a: it.a, steps: it.steps }, alive, S.coach, wk);
    if (left === 0 && alive()) {
      await kdWait(900);
      if (alive()) { await kdReply(S.th, S.body, { q: '', a: MSG.end.a }, alive, false); Object.values(P).forEach(x => { x.ta.disabled = true; x.root.classList.add('done'); }); }
    }
    if (alive()) busy = false;
  }
  const match = t => { t = t.toLowerCase(); let best = null, n = 0; Object.entries(P[mode].D).forEach(([k, v]) => { const c = v.kw.filter(w => t.includes(w)).length; if (c > n) { n = c; best = k; } }); return best; };
  $$('.kt-sug button', kt).forEach(b => b.addEventListener('click', () => ask(b.textContent, b.dataset.k)));
  Object.values(P).forEach(S => {
    S.form.addEventListener('submit', e => { e.preventDefault(); const q = S.ta.value.trim(); S.ta.value = ''; ask(q, match(q)); });
    S.ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); S.form.requestSubmit(); } });
  });
}

/* A4 sheets: scale the real report to the width available, so the whole page shows with no scrolling */
$$('[data-a4]').forEach(box => {
  const z = $('.a4z', box), W = +box.dataset.a4;
  const fit = () => { const k = box.clientWidth / W; z.style.transform = `scale(${k})`; box.style.height = z.offsetHeight * k + 'px'; };
  fit(); new ResizeObserver(fit).observe(box);
});

/* blog: sort A to Z and filter by sport */
const blg = $('.bl-g');
if (blg) {
  const cards = $$('.ba', blg), sp = $('[data-bl=sport]'), n = $('[data-bl=n]');
  sp.addEventListener('change', () => {
    let shown = 0;
    cards.forEach(c => { const ok = !sp.value || c.dataset.s === sp.value; c.hidden = !ok; if (ok) shown++; });
    if (n) n.textContent = shown;
  });
}
})();
