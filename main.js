/* PlayCortex + KRU site behaviour. Every block checks its elements exist, so one script serves every page. */
document.documentElement.classList.add('js');
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const onView = (els, fn, threshold = .25) => {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } }), { threshold });
  els.filter(Boolean).forEach(el => io.observe(el));
};

/* reveal on scroll */
onView($$('.rv'), el => el.classList.add('in'), .12);

/* chat sequences: play once visible; tabs replay them */
const play = el => { if (!el) return; el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); };
onView($$('.seq'), play, .3);

/* count-up numbers */
onView($$('[data-count]'), el => {
  const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), st = performance.now(), D = 1400;
  const f = n => { const k = Math.min(1, (n - st) / D), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN'); if (k < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}, .4);

/* bars / pipelines / stacks animate in */
onView($$('#gap, .pipe, #stack'), el => el.classList.add('on'), .3);

/* nav: hide on scroll down */
(() => {
  const nav = $('#nav'); if (!nav) return;
  let ly = 0;
  addEventListener('scroll', () => {
    const y = scrollY, dd = $('#dd');
    nav.classList.toggle('h', y > ly && y > 500 && !(dd && dd.classList.contains('op')) && !$('#mnav.op'));
    document.body.classList.toggle('scrolled', y > 10);
    ly = y;
  }, { passive: true });
})();

/* statement words light up on scroll */
(() => {
  const fill = $('#fill'); if (!fill) return;
  const out = [];
  fill.childNodes.forEach(n => {
    const em = n.nodeType !== 3;
    n.textContent.split(/(\s+)/).forEach(t => { if (t.trim()) out.push(em ? `<em class="wd">${t}</em>` : `<span class="wd">${t}</span>`); else if (t) out.push(' '); });
  });
  fill.innerHTML = out.join('');
  const wds = $$('.wd', fill);
  const f = () => { const r = fill.getBoundingClientRect(), vh = innerHeight; const q = Math.max(0, Math.min(1, (vh * .85 - r.top) / (r.height + vh * .3))); wds.forEach((w, i) => w.classList.toggle('lit', i < q * wds.length)); };
  addEventListener('scroll', f, { passive: true }); f();
})();

/* KRU product tour tabs (auto-advance while visible) */
(() => {
  const tbs = $$('#tabs .tb'), scrs = $$('#screens .scr'), tUrl = $('#tourUrl');
  if (!tbs.length || !scrs.length) return;
  let ti = 0, t0 = performance.now(), vis = false; const DUR = 6500;
  const setT = i => {
    ti = i; t0 = performance.now();
    tbs.forEach((b, j) => { b.classList.toggle('on', j === i); $('.bar', b).style.width = '0'; });
    scrs.forEach((s, j) => s.classList.toggle('on', j === i));
    if (tUrl) tUrl.textContent = 'playcortex.co.in/kru/' + scrs[i].dataset.url;
    play($('.seq', scrs[i]));
  };
  tbs.forEach((b, i) => b.addEventListener('click', () => setT(i)));
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) t0 = performance.now(); }, { threshold: .3 }).observe(tbs[0].closest('section'));
  (function loop(n) { requestAnimationFrame(loop); if (!vis) return; const p = Math.min(1, (n - t0) / DUR); $('.bar', tbs[ti]).style.width = p * 100 + '%'; if (p >= 1) setT((ti + 1) % tbs.length); })(0);
  setT(0);
})();

/* static feature screens: show them */
$$('.screens-static .scr').forEach(s => s.classList.add('on'));

/* academy coach demo: fixed-size MacBook scaled to fit, scripted like a screen recording */
(() => {
  const wrap = $('#mac'), dev = $('#kxDev'), stage = $('#macStage'), cur = $('#macCur');
  if (!wrap || !dev || !stage) return;
  const btns = $$('#seg button'), panes = $$('#cpanes .kx-pane');
  /* scale the whole laptop as one picture */
  const fit = () => { const s = Math.min(.92, wrap.clientWidth / 1140); dev.style.setProperty('--kx', s); wrap.style.height = Math.ceil(dev.offsetHeight * s) + 'px'; };
  fit(); new ResizeObserver(fit).observe(wrap); addEventListener('load', fit);
  const scale = () => parseFloat(getComputedStyle(dev).getPropertyValue('--kx')) || 1;
  let running = false, gen = 0, timer;
  const show = k => { btns.forEach((b, j) => b.classList.toggle('on', j === k)); panes.forEach((p, j) => p.classList.toggle('on', j === k)); };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !cur) { btns.forEach((b, j) => b.addEventListener('click', () => show(j))); return; }
  const wait = ms => new Promise((r, x) => { const g = gen; timer = setTimeout(() => g === gen ? r() : x('stop'), ms); });
  const pt = el => { const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = scale(); return [(r.left - s.left + r.width / 2) / k, (r.top - s.top + r.height / 2) / k]; };
  const moveTo = (el, ms = 520) => { const [x, y] = pt(el); cur.style.transition = `transform ${ms}ms cubic-bezier(.45,.05,.2,1)`; cur.style.transform = `translate(${x}px,${y}px)`; return wait(ms + 40); };
  const tap = async el => { cur.classList.remove('tap'); void cur.offsetWidth; cur.classList.add('tap'); if (el) { el.classList.add('pressed'); setTimeout(() => el.classList.remove('pressed'), 160); } await wait(220); };
  const field = p => $('.kx-field', p);
  const typeIn = async (p, text, cps = 34) => { const f = field(p); f.classList.add('typing'); f.textContent = ''; for (const ch of text) { f.textContent += ch; await wait(1000 / cps); } };
  const clear = p => { const f = field(p); f.classList.remove('typing'); f.textContent = f.dataset.ph; };
  const reveal = el => { el.classList.remove('dh'); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); };
  const dots = (th, before) => { const d = document.createElement('div'); d.className = 'tdots'; d.innerHTML = '<i></i><i></i><i></i>'; th.insertBefore(d, before); return d; };
  const reply = async (th, el, ms = 750) => { const d = dots(th, el); try { await wait(ms); } finally { d.remove(); } reveal(el); await wait(450); };
  const send = async (p, text, el) => { await moveTo(field(p)); await tap(); await typeIn(p, text); const b = $('.kx-send', p); await moveTo(b, 380); await tap(b); clear(p); reveal(el); await wait(350); };
  const reset = p => {
    $$('.tdots,.tload', p).forEach(x => x.remove());
    $$('.kx-thread>*,.kx-row', p).forEach(x => { x.classList.add('dh'); x.classList.remove('pop'); });
    $$('.kx-act', p).forEach(a => { a.textContent = a.dataset.t; a.classList.remove('done'); });
    const f = field(p); if (f) { f.dataset.ph = f.dataset.ph || f.textContent; clear(p); }
  };
  $$('.kx-act', stage).forEach(a => a.dataset.t = a.textContent);
  async function chat(p) {
    const th = $('.kx-thread', p), k = [...th.children];
    await send(p, k[0].textContent, k[0]);
    await reply(th, k[1], 900);
    reveal(k[2]); await wait(700);
    await reply(th, k[3], 650);
    await send(p, 'Send it.', k[4]);
    await reply(th, k[5], 750); await wait(1400);
  }
  async function sync(p) {
    const th = $('.kx-thread', p), k = [...th.children];
    await send(p, k[0].textContent, k[0]);
    const ld = document.createElement('div'); ld.className = 'tload'; ld.innerHTML = '<span class="spin"></span>Syncing scorecard…'; th.insertBefore(ld, k[1]);
    await wait(1200); ld.remove(); reveal(k[1]); await wait(800);
    await reply(th, k[2], 800); await reply(th, k[3], 550); await wait(1400);
  }
  async function review(p) {
    const rows = $$('.kx-row', p);
    for (const r of rows) { reveal(r); await wait(160); }
    await wait(400);
    for (const [ri, txt] of [[0, 'Sent to physio ✓'], [2, 'Approved ✓'], [3, 'Lighter week set ✓']]) { const b = $('.kx-act', rows[ri]); await moveTo(b); await tap(b); b.textContent = txt; b.classList.remove('pri'); b.classList.add('done'); await wait(450); }
    await wait(1400);
    rows.forEach(r => $$('.kx-act', r)[0].classList.toggle('pri', r !== rows[1]));
  }
  const scripts = [chat, sync, review];
  async function loop(g) {
    try { while (running && g === gen) for (let k = 0; k < btns.length && running && g === gen; k++) { reset(panes[k]); await moveTo(btns[k], 560); await tap(btns[k]); show(k); await wait(300); await scripts[k](panes[k]); } } catch (e) {}
  }
  const start = () => { if (running) return; running = true; gen++; stage.classList.add('dsk-on'); loop(gen); };
  const stop = () => { running = false; gen++; clearTimeout(timer); stage.classList.remove('dsk-on'); $$('.tdots,.tload', stage).forEach(x => x.remove()); };
  btns.forEach((b, j) => b.addEventListener('click', e => { if (!e.isTrusted) return; stop(); panes.forEach(p => { $$('.dh', p).forEach(x => x.classList.remove('dh')); $$('.tdots,.tload', p).forEach(x => x.remove()); }); show(j); }));
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: .3 }).observe(wrap);
  panes.forEach(reset); show(0);
})();

/* home KRU phone: looping chat (typing, dots, replies) */
(() => {
  const ph = $('#kp2'), th = $('#kp2th'); if (!ph || !th) return;
  const msgs = [...th.children], f = $('.kp2-f', ph), ph0 = f.textContent;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let run = false, gen = 0, t;
  const wait = ms => new Promise((r, x) => { const g = gen; t = setTimeout(() => g === gen ? r() : x(0), ms); });
  const show = el => { el.classList.remove('dh'); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); };
  const type = async s => { f.classList.add('typing'); f.textContent = ''; for (const c of s) { f.textContent += c; await wait(32); } await wait(250); f.classList.remove('typing'); f.textContent = ph0; };
  const dots = async (before, ms) => { const d = document.createElement('div'); d.className = 'tdots'; d.innerHTML = '<i></i><i></i><i></i>'; th.insertBefore(d, before); try { await wait(ms); } finally { d.remove(); } };
  async function loop(g) {
    try {
      while (run && g === gen) {
        $$('.tdots', th).forEach(x => x.remove()); msgs.forEach((m, i) => m.classList.toggle('dh', i > 2)); await wait(900);
        for (const m of msgs.slice(3)) {
          if (m.classList.contains('me')) { await type(m.textContent); show(m); await wait(500); }
          else { await dots(m, 900); show(m); await wait(900); }
        }
        await wait(2600);
      }
    } catch (e) {}
  }
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !run) { run = true; gen++; loop(gen); } else if (!e.isIntersecting && run) { run = false; gen++; clearTimeout(t); $$('.tdots', th).forEach(x => x.remove()); f.classList.remove('typing'); f.textContent = ph0; msgs.forEach(m => m.classList.remove('dh')); } }), { threshold: .3 }).observe(ph);
})();

/* scale fixed-layout cards as one picture (keeps their shape on small screens) */
$$('[data-fit]').forEach(w => {
  const base = +w.dataset.fit, inner = w.firstElementChild;
  const fit = () => { const s = Math.min(1, w.clientWidth / base); inner.style.transform = `scale(${s})`; w.style.height = Math.ceil(inner.offsetHeight * s) + 'px'; };
  fit(); new ResizeObserver(fit).observe(w); addEventListener('load', fit);
});

/* KRU how-it-works: one smooth walkthrough with step badge */
(() => {
  const box = $('#acc'), stage = $('#accr'), cur = $('#gcur'); if (!box || !stage) return;
  const items = $$('.acc-i', box), views = $$('.gv', stage), bn = $('#accn'), bt = $('#acct');
  let i = 0, gen = 0, run = false, t;
  const SP = .5; /* v74: whole walkthrough runs at half the time */
  const wait = ms => new Promise((r, x) => { const g = gen; t = setTimeout(() => g === gen ? r() : x(0), ms * SP); });
  const pt = el => { const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(); return [r.left - s.left + r.width / 2, r.top - s.top + r.height / 2]; };
  const move = (el, ms = 700) => { const [x, y] = pt(el); cur.style.transitionDuration = (ms * SP) + 'ms'; cur.style.transform = `translate(${x}px,${y}px)`; return wait(ms + 60); };
  const tap = async el => { cur.classList.remove('tap'); void cur.offsetWidth; cur.classList.add('tap'); if (el) { el.classList.add('pressed'); setTimeout(() => el.classList.remove('pressed'), 160); } await wait(260); };
  const show = el => el.classList.remove('dh');
  const hide = (...els) => els.forEach(e => e && e.classList.add('dh'));
  const typeIn = async (f, s, cps = 26) => { f.classList.add('typing'); f.classList.remove('end'); f.textContent = ''; for (const c of s) { f.textContent += c; if (f.scrollWidth > f.clientWidth) f.classList.add('end'); await wait(1000 / cps); } };
  const S = {
    talk: {
      reset(v) { const f = $('.gc-f', v); f.dataset.ph = f.dataset.ph || f.textContent; f.classList.remove('typing'); f.textContent = f.dataset.ph; $$('.tdots', v).forEach(x => x.remove()); hide(...$$('.gc-m', v), $('.gc-menu', v), $('.gc-rec', v)); $('.tm', v).textContent = '0:00'; },
      async run(v) {
        const f = $('.gc-f', v), th = $('.gc-th', v), menu = $('.gc-menu', v), rec = $('.gc-rec', v), tm = $('.tm', v), [txt, voice, ai] = $$('.gc-m', v);
        await move(f); await tap(f); await typeIn(f, txt.textContent.trim());
        const send = $('.gc-send', v); await move(send, 500); await tap(send); f.classList.remove('typing'); f.classList.remove('end'); f.textContent = f.dataset.ph; show(txt); await wait(700);
        const plus = $('.gc-plus', v); await move(plus); await tap(plus); show(menu); await wait(700);
        const row = $('[data-k=voice]', v); await move(row, 550); row.classList.add('hov'); await wait(350); await tap(row); row.classList.remove('hov'); hide(menu); await wait(350);
        show(rec); for (let k = 0; k <= 6; k++) { tm.textContent = '0:0' + k; await wait(450); }
        const stop = $('.stop', v); await move(stop, 500); await tap(stop); hide(rec); await wait(250); show(voice); await wait(600);
        const d = document.createElement('div'); d.className = 'tdots'; d.innerHTML = '<i></i><i></i><i></i>'; th.appendChild(d);
        try { await wait(1200); } finally { d.remove(); }
        show(ai); await wait(3600);
      }
    },
    plan: {
      reset(v) { $$('.gp-r', v).forEach(r => r.classList.add('sk')); hide($('.gp-ok', v)); },
      async run(v) {
        const rows = $$('.gp-r', v); await move(rows[0], 700); await wait(500);
        for (const r of rows) { await wait(500); r.classList.remove('sk'); }
        await wait(600); show($('.gp-ok', v)); await wait(300); await move($('.gp-ok', v), 600); await wait(3400);
      }
    },
    check: {
      reset(v) { const save = $('.gc-save', v); save.dataset.t = save.dataset.t || save.textContent; save.textContent = save.dataset.t; hide($('.gc-ok', v)); $$('.gc-r', v).forEach(r => { $('i', r).style.width = '0%'; $('em', r).style.left = '0%'; $('b', r).textContent = '–'; }); },
      async run(v) {
        const save = $('.gc-save', v), s0 = stage.getBoundingClientRect();
        for (const r of $$('.gc-r', v)) {
          const em = $('em', r); await move(em, 600); await tap();
          const to = r.dataset.to; $('i', r).style.width = to + '%'; em.style.left = to + '%';
          const rr = $('.gc-b', r).getBoundingClientRect(), [, y] = pt(em);
          cur.style.transitionDuration = (700 * SP) + 'ms'; cur.style.transform = `translate(${rr.left - stage.getBoundingClientRect().left + rr.width * to / 100}px,${y}px)`;
          await wait(780); $('b', r).textContent = r.dataset.lbl; await wait(150);
        }
        await move(save, 600); await tap(save); save.innerHTML = '<span class="spin"></span>'; await wait(1000);
        save.textContent = '✓'; show($('.gc-ok', v)); await wait(3600);
      }
    },
    share: {
      reset(v) { $$('.tg', v).forEach(x => x.classList.remove('on')); hide($('.gcoach', v)); },
      async run(v) {
        const tgs = $$('.tg', v);
        for (const k of [0, 1]) { await move(tgs[k], 650); await tap(tgs[k]); tgs[k].classList.add('on'); await wait(450); }
        await move(tgs[2], 600); await wait(700); show($('.gcoach', v)); await wait(3600);
      }
    }
  };
  const badge = k => { bn.textContent = k + 1; bt.textContent = $('.acc-t b', items[k]).textContent; const b = bn.parentNode; b.classList.remove('in'); void b.offsetWidth; b.classList.add('in'); };
  async function loop(g, start) {
    try {
      for (let k = start; run && g === gen; k = (k + 1) % items.length) {
        const v = views[k], name = v.dataset.v;
        views.forEach(x => x.classList.remove('on')); cur.classList.add('hid');
        await wait(450);
        S[name].reset(v); i = k;
        items.forEach((b, j) => b.classList.toggle('on', j === k)); badge(k);
        v.classList.add('on'); await wait(650); cur.classList.remove('hid');
        await S[name].run(v);
      }
    } catch (e) {}
  }
  const start = k => { gen++; run = true; clearTimeout(t); loop(gen, k); };
  items.forEach((b, j) => b.addEventListener('click', () => start(j)));
  views.forEach(v => S[v.dataset.v].reset(v));
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { if (!run) start(i); } else { run = false; gen++; clearTimeout(t); } }), { threshold: .3 }).observe(box);
})();

/* diagrams: scale to fit narrow screens instead of side-scrolling */
$$('.dg-scroll').forEach(sc => {
  const box = $('.dg-box', sc); if (!box) return;
  const base = parseFloat(getComputedStyle(box).minWidth) || 880;
  const fit = () => {
    const w = sc.clientWidth;
    if (w >= base) { box.style.transform = ''; box.style.width = ''; sc.style.height = ''; sc.classList.remove('fitted'); return; }
    const k = w / base; box.style.width = base + 'px'; box.style.transformOrigin = 'top left'; box.style.transform = `scale(${k})`;
    sc.style.height = Math.ceil(box.offsetHeight * k) + 'px'; sc.classList.add('fitted');
  };
  fit(); new ResizeObserver(fit).observe(sc);
});

/* mobile menu + product dropdown */
(() => {
  const b = $('#burger'), m = $('#mnav'), dd = $('#dd');
  if (b && m) {
    b.addEventListener('click', () => { m.classList.toggle('op'); b.classList.toggle('op'); });
    $$('a', m).forEach(a => a.addEventListener('click', () => { m.classList.remove('op'); b.classList.remove('op'); }));
  }
  if (dd) {
    $('button', dd).addEventListener('click', e => { e.stopPropagation(); dd.classList.toggle('op'); });
    document.addEventListener('click', e => { if (!dd.contains(e.target)) dd.classList.remove('op'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') dd.classList.remove('op'); });
  }
})();

/* faq accordion */
$$('.q').forEach(q => $('button', q).addEventListener('click', () => {
  const open = q.classList.contains('open');
  $$('.q').forEach(x => { x.classList.remove('open'); $('.a', x).style.maxHeight = 0; });
  if (!open) { q.classList.add('open'); const a = $('.a', q); a.style.maxHeight = a.scrollHeight + 'px'; }
}));

/* forms: no backend on a static host, so compose an email to the team */
const TO = 'uday@playcortex.in';
const mail = (subject, lines) => { location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.filter(Boolean).join('\n'))}`; };
/* v76: signups save to the same Google Sheet the previous playcortex.in used (approved by Uday) */
const PC_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxKrHTl3pDPZwBhFLbrFvARP-10PgIYSAayVOHdaK-twtHeCE047bX54yzx-e024g/exec';
const pcSave = d => { let pg = ''; try { pg = top.location.hostname + top.location.pathname + top.location.hash; } catch (e) { pg = location.pathname; } try { fetch(PC_SHEET_URL, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(Object.assign({}, d, { page: pg })) }).catch(() => {}); } catch (e) {} };
(() => {
  const f = $('#su'); if (!f) return;
  f.addEventListener('submit', e => {
    e.preventDefault();
    const i = $('input', f), b = $('button', f), v = i.value.trim();
    if (!/^[+\d][\d\s-]{6,}$/.test(v)) { i.focus(); f.classList.add('err'); return; }
    f.classList.remove('err');
    pcSave({ role: 'KRU early access', name: '', number: v, topic: 'KRU early access' });
    b.textContent = 'Joined ✓'; f.classList.add('done'); i.disabled = true; b.disabled = true;
  });
})();
$$('.cform').forEach(f => {
  const topic = $('#topic', f), p = new URLSearchParams(location.search).get('topic');
  if (topic && p && $(`option[value="${p}"]`, topic)) topic.value = p;
  f.addEventListener('submit', e => {
    e.preventDefault();
    const msg = $('.cf-msg', f);
    const bad = $$('[required]', f).find(x => !x.value.trim() || (x.type === 'email' && !/^\S+@\S+\.\S+$/.test(x.value)));
    if (bad) { bad.focus(); msg.textContent = 'Please fill in ' + $('span', bad.closest('label')).textContent.toLowerCase() + '.'; msg.className = 'cf-msg bad'; return; }
    const d = Object.fromEntries(new FormData(f));
    const subject = f.dataset.subject || ('PlayCortex enquiry · ' + (topic ? topic.options[topic.selectedIndex].text : ''));
    const LBL = { phone: 'WhatsApp', org: 'Organisation', size: 'Athletes', role: 'I am', interest: 'Interested in', sport: 'Sport', topic: 'Topic' };
    pcSave({ role: d.role || subject, name: (d.name || '').slice(0, 80), number: d.phone || '', topic: [subject, d.email || '', ...Object.keys(LBL).filter(k => d[k] && k !== 'phone' && k !== 'role').map(k => LBL[k] + ': ' + d[k]), d.message || ''].filter(Boolean).join(' | ').slice(0, 900) });
    msg.textContent = "Thanks, we've got it. We'll be in touch soon. You can also write to " + TO + '.'; msg.className = 'cf-msg ok';
    $$('input,textarea,select,button', f).forEach(x => x.disabled = true);
  });
});

/* ===== pilot cases: live chart stages ===== */
(() => {
  const cards = $$('.case[data-case]'); if (!cards.length) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const smooth = p => {
    let d = `M${p[0][0]},${p[0][1]}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return d;
  };
  const tip = (g, x, y, lines, anchor = 'start', maxX = 9999) => {
    const t = el('g', { class: 'tip' }, g);
    const w = Math.max(...lines.map(l => l.length)) * 6.3 + 22, h = lines.length * 16 + 12;
    let bx = anchor === 'end' ? x - w : x; bx = Math.max(4, Math.min(bx, maxX - w));
    el('rect', { x: bx, y, width: w, height: h, rx: 8 }, t);
    lines.forEach((l, i) => { el('text', { x: bx + 11, y: y + 20 + i * 16, class: i ? 's' : '' }, t).textContent = l; });
  };
  const CASES = {
    ak: {
      x: [-9, 5], y: [0, 10],
      xt: [[-9, '−9d'], [-6, '−6d'], [-3, '−3d'], [0, 'Flag'], [3, '+3d'], [5, '+5d']], yt: [0, 5, 10],
      zone: { y: [0, 3], label: 'NORMAL RANGE' },
      before: [[-9, 2], [-8, 2], [-7, 3], [-6, 3], [-5, 3], [-4, 4], [-3, 4], [-2, 5], [-1, 5], [0, 6]],
      after: [[0, 6], [1, 5], [2, 4], [3, 3], [4, 2], [5, 1]],
      flag: { at: [0, 6], text: ['Flagged', 'Hypomobile shoulder'] },
      review: { at: 0.5, top: true, text: ['Vetted by our physio', 'Load down, new routine'] },
      end: ['Better within 5 days'], ticks: [1, 2, 3, 4, 5],
      read: [{ v: 6, u: '/ 10', t: 'Rising for 9 days' }, { v: 6, u: '/ 10', t: 'Physio reviewed' }, { v: 1, u: '/ 10', t: 'Day 5 · better' }]
    },
    rs: {
      x: [0, 60], y: [30, 100],
      xt: [[0, '0'], [12, '12'], [24, '24'], [36, '36'], [48, '48'], [60, '60 balls']], yt: [40, 70, 100],
      zone: { x: [24, 60], label: 'ONCE SET' },
      before: [[0, 68], [6, 76], [12, 82], [18, 84], [24, 72], [30, 55], [36, 50], [42, 46]],
      after: [[0, 68], [6, 76], [12, 82], [18, 84], [24, 83], [30, 84], [36, 82], [42, 84], [48, 85], [54, 83], [60, 84]],
      flag: { at: [42, 46], text: ['Out', 'Focus fell once set'] },
      review: { at: 24, side: 'left', text: ['Vetted by our psychologist', 'Focus cue + power work'] },
      end: ['Holds through the innings'], ticks: [6, 12, 18, 24, 30, 36, 42, 48, 54, 60],
      read: [{ v: 55, u: 'focus after 30 balls', t: 'Drops once set' }, { v: 55, u: 'focus after 30 balls', t: 'Psychologist reviewed' }, { v: 84, u: 'focus after 30 balls', t: 'Cue every over' }]
    }
  };
  cards.forEach(card => {
    const c = CASES[card.dataset.case], svg = $('[data-chart]', card); if (!c || !svg) return;
    const W = Math.round(Math.max(340, Math.min(640, svg.getBoundingClientRect().width || 600)));
    const narrow = W < 520, H = narrow ? 280 : 300, L = 34, R = W - 12, T = 18, B = H - 34;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const xt = narrow ? c.xt.filter((_, i) => i % 2 === 0 || i === c.xt.length - 1) : c.xt;
    const sx = v => L + (v - c.x[0]) / (c.x[1] - c.x[0]) * (R - L), sy = v => B - (v - c.y[0]) / (c.y[1] - c.y[0]) * (B - T);
    const P = arr => arr.map(([x, y]) => [sx(x), sy(y)]);
    const gid = 'ga-' + card.dataset.case;
    const gr = el('linearGradient', { id: gid, x1: 0, x2: 0, y1: 0, y2: 1 }, el('defs', {}, svg));
    el('stop', { offset: 0, 'stop-color': '#EE5D26', 'stop-opacity': .35 }, gr); el('stop', { offset: 1, 'stop-color': '#EE5D26', 'stop-opacity': 0 }, gr);
    c.yt.forEach(v => { el('line', { x1: L, x2: R, y1: sy(v), y2: sy(v), class: 'gl' }, svg); el('text', { x: L - 10, y: sy(v) + 4, 'text-anchor': 'end' }, svg).textContent = v; });
    xt.forEach(([v, t]) => { el('text', { x: sx(v), y: B + 22, 'text-anchor': v === c.x[0] ? 'start' : v === c.x[1] ? 'end' : 'middle' }, svg).textContent = t; });
    if (c.zone.y) { el('rect', { x: L, y: sy(c.zone.y[1]), width: R - L, height: sy(c.zone.y[0]) - sy(c.zone.y[1]), class: 'zone' }, svg); el('text', { x: R - 6, y: sy(c.zone.y[0]) - 8, 'text-anchor': 'end', class: 'zone-t' }, svg).textContent = c.zone.label; }
    if (c.zone.x) { el('rect', { x: sx(c.zone.x[0]), y: T, width: sx(c.zone.x[1]) - sx(c.zone.x[0]), height: B - T, class: 'zone' }, svg); el('text', { x: R - 6, y: B - 12, 'text-anchor': 'end', class: 'zone-t' }, svg).textContent = c.zone.label; }
    const g0 = el('g', { class: 'g0' }, svg), pb = P(c.before);
    el('path', { d: smooth(pb) + ` L${pb[pb.length - 1][0]},${B} L${pb[0][0]},${B} Z`, fill: `url(#${gid})` }, g0);
    const lb = el('path', { d: smooth(pb), class: 'ln b' }, g0);
    pb.forEach(p => el('circle', { cx: p[0], cy: p[1], r: 3.5, class: 'pt b' }, g0));
    const fx = sx(c.flag.at[0]), fy = sy(c.flag.at[1]);
    el('circle', { cx: fx, cy: fy, r: 9, class: 'flag-r' }, g0); el('circle', { cx: fx, cy: fy, r: 5.5, class: 'flag' }, g0);
    tip(g0, fx < W / 2 ? fx + 14 : fx - 14, fy - 60, c.flag.text, fx < W / 2 ? 'start' : 'end', W);
    const g1 = el('g', { class: 'g1' }, svg), rx = sx(c.review.at);
    el('rect', { x: rx - 16, y: T, width: 32, height: B - T, class: 'rev' }, g1); el('line', { x1: rx, x2: rx, y1: T, y2: B, class: 'rev-l' }, g1);
    c.review.side === 'left' ? tip(g1, rx - 22, B - 50, c.review.text, 'end', W) : tip(g1, rx + 22, c.review.top ? T + 6 : B - 50, c.review.text, 'start', W);
    const g2 = el('g', { class: 'g2' }, svg), pa = P(c.after);
    const la = el('path', { d: smooth(pa), class: 'ln a' }, g2);
    pa.slice(1).forEach(p => el('circle', { cx: p[0], cy: p[1], r: 3.5, class: 'pt a' }, g2));
    c.ticks.forEach(v => el('rect', { x: sx(v) - 1.5, y: B - 7, width: 3, height: 7, rx: 1, class: 'tick' }, g2));
    const e = pa[pa.length - 1]; tip(g2, e[0], e[1] - 46, c.end, 'end', W);
    [lb, la].forEach(p => { const len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len; p.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)'; });
    const read = $('[data-read]', card), unit = $('[data-unit]', card), tag = $('[data-tag]', card), stg = $$('.stg', card);
    let cur = -1, auto = false, t0 = 0;
    const count = to => { const from = +read.textContent || 0, st = performance.now(); const f = n => { const k = Math.min(1, (n - st) / 900); read.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
    const set = s => {
      cur = s;
      ['s0', 's1', 's2'].forEach(k => { card.classList.toggle(k, k === 's' + s); svg.classList.toggle(k, k === 's' + s); });
      stg.forEach((b, i) => { b.classList.toggle('on', i === s); b.classList.toggle('done', i < s); $('em', b).style.width = i < s ? '100%' : '0'; });
      lb.style.strokeDashoffset = 0; la.style.strokeDashoffset = s === 2 ? 0 : la.getTotalLength();
      const r = c.read[s]; unit.textContent = r.u; tag.textContent = r.t; count(r.v); t0 = performance.now();
    };
    const DUR = [3200, 3200, 5200];
    const loop = n => { requestAnimationFrame(loop); if (!auto) return; const p = Math.min(1, (n - t0) / DUR[cur]); $('em', stg[cur]).style.width = p * 100 + '%'; if (p >= 1) set((cur + 1) % 3); };
    stg.forEach((b, i) => b.addEventListener('click', () => { auto = false; set(i); }));
    onView([card], () => { read.textContent = 0; set(0); auto = true; requestAnimationFrame(loop); }, .35);
  });
})();

/* platform pipeline: a highlight travels step by step */
$$('.pipe').forEach(p => {
  const steps = $$('.pp', p); let i = -1, timer;
  onView([p], () => { timer = setInterval(() => { steps.forEach(s => s.classList.remove('hit')); i = (i + 1) % (steps.length + 1); if (steps[i]) steps[i].classList.add('hit'); }, 900); }, .3);
});

/* Perk-style tabbed module */
(() => {
  const m = $('#mod'); if (!m) return;
  const tabs = $$('.mod-tabs button', m), ps = $$('.mod-copy p', m), panes = $$('.mod-pane', m);
  let i = 0, auto;
  const go = k => { i = k; [tabs, ps, panes].forEach(g => g.forEach((el, j) => el.classList.toggle('on', j === k))); };
  const start = () => { clearInterval(auto); auto = setInterval(() => go((i + 1) % tabs.length), 5000); };
  tabs.forEach((t, k) => t.addEventListener('click', () => { go(k); start(); }));
  onView([m], start, .3);
})();

/* carousel: arrows + dots */
(() => {
  const c = $('#car'); if (!c) return;
  const tr = $('.car-track', c), cards = $$('.cc', tr), dots = $('#cardots');
  dots.innerHTML = cards.map(() => '<i></i>').join('');
  const di = $$('i', dots);
  const step = () => cards[0].getBoundingClientRect().width + 14;
  $$('.car-b', c).forEach(b => b.addEventListener('click', () => tr.scrollBy({ left: step() * +b.dataset.d, behavior: 'smooth' })));
  const sync = () => { const k = Math.round(tr.scrollLeft / step()); di.forEach((d, j) => d.classList.toggle('on', j === Math.min(k, di.length - 1))); };
  tr.addEventListener('scroll', sync, { passive: true }); sync();
})();

/* instagram row arrows */
(() => {
  const tr = $('.ig-track'); if (!tr) return;
  $$('.ig-b').forEach(b => b.addEventListener('click', () => tr.scrollBy({ left: (tr.querySelector('.ig-t').getBoundingClientRect().width + 12) * 3 * +b.dataset.d, behavior: 'smooth' })));
})();

/* mobile nav: Verticals accordion */
(() => {
  const b = $('#macc'), s = $('#msub'); if (!b || !s) return;
  b.addEventListener('click', () => { const o = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', !o); s.style.maxHeight = o ? 0 : s.scrollHeight + 'px'; b.classList.toggle('op', !o); });
})();

/* language switch: same page in English or Hindi (works on any host, incl. file://) */
$$('select[data-lang]').forEach(sel => {
  sel.addEventListener('change', () => {
    /* v77: clean URLs (no .html) */
    const clean = p => { p = p.replace(/\.html$/, '').replace(/(^|\/)index$/, ''); return '/' + p.replace(/\/$/, ''); };
    location.href = clean((sel.value === 'hi' ? 'hi/' : '') + sel.dataset.path) + location.hash;
  });
});

/* mobile nav: nested Back-end systems list */
$$('.macc2').forEach(b => b.addEventListener('click', () => {
  const s = b.closest('.msys').nextElementSibling, o = b.getAttribute('aria-expanded') === 'true';
  b.setAttribute('aria-expanded', !o); b.classList.toggle('op', !o);
  s.style.maxHeight = o ? 0 : s.scrollHeight + 'px';
  const outer = $('#msub'); if (outer && outer.style.maxHeight) outer.style.maxHeight = outer.scrollHeight + (o ? 0 : s.scrollHeight) + 'px';
}));

/* diagrams: draw themselves when they scroll into view */
(() => {
  const dgs = $$('.dg-box'); if (!dgs.length) return;
  const NS = 'http://www.w3.org/2000/svg';
  dgs.forEach((box, bi) => {
    const svg = $('svg', box), paths = $$('path', svg), nodes = $$('.dn', box);
    const vertical = box.classList.contains('dg-v');
    /* v77: elbow diagram traces from each pill's real edge, so every line meets its node exactly */
    const elbow = !!box.closest('.dg-elbow') && $('.dn-hub', box) && $('.dn-core', box);
    const layout = () => {
      if (!elbow) return;
      const W = box.clientWidth, H = box.clientHeight; if (!W || !H) return;
      const sx = 1200 / W, sy = 330 / H;
      const g = n => ({ l: (n.offsetLeft - n.offsetWidth / 2) * sx, r: (n.offsetLeft + n.offsetWidth / 2) * sx, y: n.offsetTop * sy });
      const src = $$('.dn-src', box).map(g), mod = $$('.dn-mod', box).map(g), core = g($('.dn-core', box)), hub = g($('.dn-hub', box));
      const busL = (Math.max(...src.map(a => a.r)) + core.l) / 2, busR = (hub.r + Math.min(...mod.map(a => a.l))) / 2;
      const ds = [...src.map(a => `M${a.r},${a.y} H${busL} V${core.y} H${core.l}`), `M${core.r},${core.y} H${hub.l}`, ...mod.map(a => `M${hub.r},${hub.y} H${busR} V${a.y} H${a.l}`)];
      paths.forEach((p, i) => { if (!ds[i]) return; p.setAttribute('d', ds[i]); if (p._m) { p._m.setAttribute('d', ds[i]); const L = p.getTotalLength(); p._m.style.strokeDasharray = L; if (!box.classList.contains('go')) p._m.style.strokeDashoffset = L; } });
    };
    layout();
    if (elbow) { addEventListener('resize', layout); addEventListener('load', layout); if (document.fonts) document.fonts.ready.then(layout); }
    const pos = n => parseFloat(vertical ? n.style.top : n.style.left);
    const order = [...new Set(nodes.map(pos))].sort((a, b) => a - b);
    nodes.forEach(n => { n.style.setProperty('--d', order.indexOf(pos(n)) * 0.28 + 's'); });
    // each connector is revealed by an animated mask, so dotted lines also "draw"
    const defs = document.createElementNS(NS, 'defs'); svg.prepend(defs);
    paths.forEach((p, i) => {
      const len = p.getTotalLength(), id = `dgm${bi}_${i}`;
      const m = document.createElementNS(NS, 'mask'); m.setAttribute('id', id); m.setAttribute('maskUnits', 'userSpaceOnUse');
      const mp = p.cloneNode(); mp.removeAttribute('class');
      mp.setAttribute('style', `stroke:#fff;stroke-width:8;stroke-dasharray:${len};stroke-dashoffset:${len};fill:none;vector-effect:none`);
      m.appendChild(mp); defs.appendChild(m); p.setAttribute('mask', `url(#${id})`);
      p._m = mp;
      const start = pos({ style: { left: '0', top: '0' } });
      p._d = elbow ? (i < 4 ? 0.15 + i * 0.08 : i === 4 ? 1.05 : 1.6 + (i - 5) * 0.08) : 0.15 + i * 0.06; /* sources, then record to AI, then out to people */
    });
    const reset = () => {
      box.classList.remove('go');
      paths.forEach(p => { p._m.style.transition = 'none'; p._m.style.strokeDashoffset = p.getTotalLength(); });
    };
    const play = () => {
      reset(); void box.offsetWidth; box.classList.add('go');
      paths.forEach(p => { p._m.style.transition = `stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1) ${p._d}s`; p._m.style.strokeDashoffset = 0; });
    };
    let inView = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio >= .3 && !inView) { inView = true; play(); }
      else if (!e.isIntersecting) { inView = false; reset(); }
    }, { threshold: [0, .3] }).observe(box);
  });
})();

/* Try KRU demo chat (sample answers, no backend) */
(() => {
  const log = $('#trylog'); if (!log) return;
  const form = $('#tryform'), inp = $('#tryinput'), left = $('#tryleft'), sugg = $('#trysugg');
  const SP = {
    sara: ['P', 'k', 'Psychology', 'AI agent'], ananya: ['N', 'g', 'Nutrition', 'AI agent'],
    arjun: ['S', 'o', 'Strength & conditioning', 'AI agent'], meera: ['Ph', 'g2', 'Physiotherapy', 'AI agent'], kru: ['K', 'k', 'KRU', 'Your team']
  };
  const R = [
    [/distress|suicid|self.?harm|hopeless|can'?t go on|kill myself/i, [['kru', "I'm really glad you told me. This needs a real person, right now. Please call iCall on 9152987821 or the Vandrevala Foundation on 1860 2662 345. On KRU, I'd also connect you with a qualified counsellor straight away."]]],
    [/focus|set|concentrat|distract|runs|innings/i, [['sara', 'You don\'t need to solve the whole innings. Just the next ball. Pick one cue, like "watch the ball", and say it before every delivery.'], ['arjun', 'Pair it with a physical reset: two slow breaths and a tap of the bat between balls. Same routine every time.']]],
    [/eat|food|diet|dinner|breakfast|nutrition|carb|protein/i, [['ananya', 'The night before: a normal dinner with rice or roti, dal or chicken, and vegetables. Nothing new or heavy. Eat breakfast about 3 hours before the match.'], ['ananya', 'Keep a water bottle with you all day, and a banana in your kit for the innings break.']]],
    [/pain|sore|hurt|injur|shoulder|knee|ankle|back|hamstring|swell/i, [['meera', 'Thanks for flagging it early. How long has it been sore, and is it worse when you bowl or all the time? On KRU, I\'d log this and track it daily.'], ['arjun', 'Until a physio has looked at it, keep your bowling load light today and skip heavy upper-body work.'], ['kru', 'If the pain is sharp, getting worse, or there\'s swelling, KRU routes you to a real sports physio. I can\'t diagnose, but a practitioner can.']]],
    [/warm|stretch|before (the )?match|before nets/i, [['arjun', '10 minutes of dynamic warm-up: easy jog, leg swings, arm circles, then a few short sprints. Then 6 shadow drives. Nothing heavy, nothing static for long.']]],
    [/nerv|anxi|pressure|trial|selection|scared|fear/i, [['sara', 'Nerves mean it matters to you. That\'s useful. Before the trial, focus on what you control: your routine, your breathing, your next ball.'], ['ananya', 'Sleep and food help too: early dinner, no screens late, and breakfast you\'ve eaten before.']]],
    [/sleep|tired|fatigue|recover|rest/i, [['arjun', 'If you\'re tired, swap today\'s intensity for recovery: light mobility and a walk.'], ['ananya', 'Aim for 8 to 9 hours. A glass of milk or a banana before bed is fine.']]],
    [/strong|gym|power|speed|six|fitness|train/i, [['arjun', 'For more power, the base matters more than the bat. Two or three lower-body strength sessions a week, then rotational work like med-ball throws. On KRU, I\'d build you an 8-week block around your matches.']]],
  ];
  let n = 5;
  const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const add = (html, cls) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; };
  const ai = (who, text) => { const [i, c, name, role] = SP[who]; return add(`<i class="${c}">${i}</i><div><b>${name}</b><small>${role}</small><p>${esc(text)}</p></div>`, 'tr-ai'); };
  const typing = () => add('<i class="k">…</i><div><p class="tr-dots"><span></span><span></span><span></span></p></div>', 'tr-ai tr-typing');
  const send = text => {
    text = text.trim(); if (!text || n <= 0) return;
    add(`<p>${esc(text)}</p>`, 'tr-me'); n--; left.textContent = n ? `${n} message${n > 1 ? 's' : ''} left` : 'Demo complete';
    const hit = R.find(([re]) => re.test(text));
    const replies = hit ? hit[1] : [['kru', "Good question. In the full KRU, the right specialists would answer this using your record and expert-signed playbooks. Try asking about focus, food, a sore muscle, warm-ups or nerves before a match."]];
    let t = 500;
    replies.forEach(([who, msg], k) => {
      setTimeout(() => { const ty = typing(); setTimeout(() => { ty.remove(); ai(who, msg); if (k === replies.length - 1 && n === 0) end(); }, 700); }, t); t += 1300;
    });
  };
  const end = () => { form.classList.add('done'); sugg.style.display = 'none'; add('<div><p>That\'s the demo. Want KRU for real, with your own record and real experts behind it?</p><a href="#join" class="pill pill-or">Get early access <i>›</i></a></div>', 'tr-end'); };
  form.addEventListener('submit', e => { e.preventDefault(); send(inp.value); inp.value = ''; });
  $$('button', sugg).forEach(b => b.addEventListener('click', () => { send(b.textContent); b.remove(); }));
})();

/* instagram: 8-second muted preview on hover (or when centred on touch screens) */
(() => {
  const tiles = $$('.ig-t'); if (!tiles.length) return;
  const start = t => { const v = $('video', t); if (!v) return; if (!v.getAttribute('src')) { v.src = v.dataset.src; v.load(); } v.currentTime = 0; v.onended = () => { t.classList.remove('playing'); }; v.play().then(() => t.classList.add('playing')).catch(() => {}); };
  const stop = t => { const v = $('video', t); if (!v) return; v.pause(); t.classList.remove('playing'); };
  if (matchMedia('(hover:hover)').matches) {
    tiles.forEach(t => { t.addEventListener('mouseenter', () => start(t)); t.addEventListener('mouseleave', () => stop(t)); });
  } else {
    const io = new IntersectionObserver(es => es.forEach(e => e.intersectionRatio > .8 ? start(e.target) : stop(e.target)), { threshold: [0, .8] });
    tiles.forEach(t => io.observe(t));
  }
})();

/* v70 · hero cube: spin, unfold into the net, then reveal the one-liner */
(function(){
  var rig=document.getElementById('cxRig'), line=document.getElementById('cxLine');
  if(!rig||!line) return;
  var q=function(c){return rig.querySelector(c)};
  var T=q('.cx-top'),B=q('.cx-bot'),L=q('.cx-left'),R=q('.cx-right'),K=q('.cx-back');
  var spans=rig.querySelectorAll('.cx-f>span');
  var ease=function(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
  var out=function(x){return 1-Math.pow(1-x,3)};
  function set(f,spin){
    var s=rig.offsetWidth, a=90*(1-f);
    T.style.transform='rotateX('+a+'deg)';
    B.style.transform='rotateX('+(-a)+'deg)';
    L.style.transform='rotateY('+(-a)+'deg)';
    R.style.transform='rotateY('+a+'deg)';
    K.style.transform='rotateY('+a+'deg)';
    var rx=-26*(1-f), ry=(-40+spin)*(1-f);
    rig.style.transform='translateX('+(-s/2*f)+'px) rotateX('+rx+'deg) rotateY('+ry+'deg)';
    for(var i=0;i<spans.length;i++) spans[i].style.opacity=Math.max(0,(f-.55)/.45);
  }
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){set(1,0);line.classList.add('on');return}
  var t0=null, P1=1300, P2=1500, shown=false;
  set(0,-200);
  function tick(t){
    if(t0===null)t0=t; var e=t-t0;
    if(e<P1){ set(0,-200*(1-out(e/P1))); }
    else { var k=Math.min(1,(e-P1)/P2); set(ease(k),0); if(k>.7&&!shown){shown=true;line.classList.add('on')} if(k>=1)return; }
    requestAnimationFrame(tick);
  }
  setTimeout(function(){requestAnimationFrame(tick)},250);
  rig.parentNode.addEventListener('click',function(){t0=null;shown=false;line.classList.remove('on');requestAnimationFrame(tick)});
})();

/* v83 · landing page: a short, gentle auto-scroll so the KRU section peeks in on arrival.
   Only on the home page, only from the very top, never with a #link, skipped for reduced motion,
   and cancelled the moment the visitor scrolls, taps or presses a key themselves. */
(() => {
  const hero = document.querySelector('.gx-hero'), prod = document.getElementById('products');
  if (!hero || !prod || location.hash) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let cancelled = false;
  const stop = () => { cancelled = true; };
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(ev => addEventListener(ev, stop, { once: true, passive: true }));
  setTimeout(() => {
    if (cancelled || scrollY > 4) return;
    const sub = hero.querySelector('.gx-sub'), nav = document.getElementById('nav'), hh = nav ? nav.offsetHeight : 68;
    /* stop when the hero line is half tucked under the header, so the lead-in and "Introducing KRU" sit right below it */
    const target = sub ? sub.getBoundingClientRect().top + scrollY + sub.offsetHeight / 2 - hh : prod.getBoundingClientRect().top + scrollY - innerHeight * 0.16;
    const dist = Math.min(Math.max(target, 0), innerHeight * 0.6);
    if (dist < 24) return;
    const start = scrollY, t0 = performance.now(), dur = 900, ease = t => 1 - Math.pow(1 - t, 3);
    const step = now => { if (cancelled) return; const k = Math.min(1, (now - t0) / dur); scrollTo(0, start + dist * ease(k)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, 1100);
})();
