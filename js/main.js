/* ═══════════════════════════════════════════════════════════════
   PRIME DCX — scroll-scrubbed market-city flythrough
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const M = window.FRAME_MANIFEST || { count: 0 };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.getElementById('film');
  const ctx = canvas.getContext('2d');
  const loaderEl = document.getElementById('loader');
  const loaderPct = document.getElementById('loaderPct');
  const loaderBody = document.getElementById('loaderBody');
  const hudFill = document.getElementById('hudFill');
  const hudAlt = document.getElementById('hudAlt');
  const hudSpread = document.getElementById('hudSpread');
  const hudPairs = document.getElementById('hudPairs');
  const zoneEls = [...document.querySelectorAll('#hudZones li')];
  const panels = [...document.querySelectorAll('.panel')];
  const cue = document.getElementById('cue');
  const track = document.getElementById('track');

  /* ── reduced motion: static page, native scroll ─────────────── */
  if (reduceMotion) {
    document.body.classList.add('rm');
    loaderEl.classList.add('is-done');
    return;
  }

  /* ── frame store ────────────────────────────────────────────── */
  const N = M.count;
  const frames = new Array(N).fill(null);
  const heroStill = new Image();
  heroStill.src = 'assets/stills/hero.png';
  heroStill.onload = () => { if (!N) draw(); };

  const src = i => M.path + M.prefix + String(i + 1).padStart(M.digits, '0') + M.ext;

  const COARSE_STEP = 5;
  let coarseTotal = 0, coarseLoaded = 0, booted = false;

  function boot() {
    if (booted) return;
    booted = true;
    loaderEl.classList.add('is-done');
    setTimeout(() => loaderEl.remove(), 900);
  }

  function loadFrame(i, coarse, cb) {
    if (frames[i]) return;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => { frames[i] = img; if (cb) cb(); needsDraw = true; };
    img.onerror = () => { if (cb) cb(); };
    img.src = src(i);
  }

  if (N > 0) {
    for (let i = 0; i < N; i += COARSE_STEP) coarseTotal++;
    for (let i = 0; i < N; i += COARSE_STEP) {
      loadFrame(i, true, () => {
        coarseLoaded++;
        const pct = Math.round(coarseLoaded / coarseTotal * 100);
        loaderPct.textContent = String(pct).padStart(2, '0');
        loaderBody.style.height = Math.max(4, pct) + '%';
        if (coarseLoaded >= coarseTotal) {
          boot();
          let j = 0;
          const fill = () => {
            let dispatched = 0;
            while (j < N && dispatched < 4) {
              if (!frames[j]) { loadFrame(j, false, null); dispatched++; }
              j++;
            }
            if (j < N) setTimeout(fill, 60);
          };
          fill();
        }
      });
    }
    // safety: never trap the user on the loader
    setTimeout(boot, 15000);
  } else {
    // no frames yet — boot straight to hero still
    setTimeout(boot, 600);
  }

  function nearestFrame(i) {
    if (frames[i]) return frames[i];
    for (let d = 1; d < N; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return heroStill.complete ? heroStill : null;
  }

  /* ── canvas ─────────────────────────────────────────────────── */
  let vw = 0, vh = 0, dpr = 1;
  let renderedIdx = -1;
  let needsDraw = true;
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    vw = innerWidth; vh = innerHeight;
    canvas.width = vw * dpr; canvas.height = vh * dpr;
    canvas.style.width = vw + 'px'; canvas.style.height = vh + 'px';
    needsDraw = true;
  }
  addEventListener('resize', resize);
  resize();

  function draw() {
    const idx = N ? Math.round(filmPos) : 0;
    const img = N ? nearestFrame(Math.max(0, Math.min(N - 1, idx))) : (heroStill.complete ? heroStill : null);
    if (!img) return;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw) return;
    const s = Math.max(vw * dpr / iw, vh * dpr / ih);
    const dw = iw * s, dh = ih * s;
    ctx.drawImage(img, (vw * dpr - dw) / 2, (vh * dpr - dh) / 2, dw, dh);
    renderedIdx = idx;
  }

  /* ── smooth scroll ──────────────────────────────────────────── */
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true });

  /* ── film position & zones ──────────────────────────────────── */
  let filmPos = 0;          // lerped frame index
  let progress = 0;         // 0..1 across the track
  let zone = -1;

  const fmt = n => n.toLocaleString('en-US');

  function setZone(z) {
    if (z === zone) return;
    zone = z;
    zoneEls.forEach((el, i) => el.classList.toggle('is-on', i === z));
    scramble(zoneEls[z]);
    if (z === 1) fireStats();
  }

  /* zone label scramble flicker */
  const GLYPHS = '▮▯01↑↓$¥€£%#';
  function scramble(el) {
    const label = el.dataset.label || (el.dataset.label = el.textContent);
    if (el.__scr) clearInterval(el.__scr);
    let t = 0;
    el.__scr = setInterval(() => {
      t++;
      if (t > label.length) {
        el.textContent = label;
        clearInterval(el.__scr); el.__scr = null;
        return;
      }
      el.textContent = label.split('').map((c, i) =>
        i < t ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join('');
    }, 40);
  }

  /* rising-zone stat count-ups */
  let statsFired = false;
  function fireStats() {
    if (statsFired) return;
    statsFired = true;
    document.querySelectorAll('.stat__num').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const from = parseFloat(el.dataset.from || 0);
      const dec = parseInt(el.dataset.decimals || 0, 10);
      const pre = el.dataset.prefix ? el.dataset.prefix.replace('&lt;', '<') : '';
      const suf = (el.dataset.suffix || '').toLowerCase();
      const o = { v: from };
      gsap.to(o, {
        v: target, duration: 1.6, ease: 'power3.out',
        onUpdate: () => { el.textContent = pre + o.v.toFixed(dec) + suf; }
      });
    });
  }

  /* panel opacity choreography — each owns a fifth of the track */
  const BAND = 1 / 5, FADE = 0.045;
  function panelAlpha(i, p) {
    const a = i * BAND, b = (i + 1) * BAND;
    if (p < a - FADE || p > b + FADE) return 0;
    let alpha = 1;
    if (i > 0) alpha = Math.min(alpha, (p - (a - FADE)) / (FADE * 2));
    if (i < 4) alpha = Math.min(alpha, ((b + FADE) - p) / (FADE * 2));
    else alpha = Math.min(alpha, 1); // last panel holds to the end
    return Math.max(0, Math.min(1, alpha));
  }

  function updatePanels(p) {
    panels.forEach((el, i) => {
      const a = panelAlpha(i, p);
      const live = a > 0.01;
      el.classList.toggle('is-live', live);
      if (!live) { el.style.opacity = 0; return; }
      el.style.opacity = a.toFixed(3);
      const dir = p < (i * BAND + BAND / 2) ? 1 : -1;
      el.style.transform = `translateY(${((1 - a) * 26 * dir).toFixed(1)}px)`;
    });
  }

  /* HUD readouts */
  function updateHud(p) {
    hudFill.style.height = (p * 100).toFixed(1) + '%';

    // altitude — exponential street→orbit
    const altM = 2 * Math.pow(10, p * 7);
    hudAlt.textContent = altM < 1000 ? Math.round(altM) + ' M'
      : altM < 1e6 ? (altM / 1000).toFixed(1) + ' KM'
      : fmt(Math.round(altM / 1000)) + ' KM';

    // spread compresses to 0.0 as you rise
    const spread = Math.max(0, 0.82 * (1 - p / 0.35));
    hudSpread.textContent = spread.toFixed(2);

    // instrument counter
    const pairs = Math.round(Math.min(1, p / 0.55) * 2148);
    hudPairs.textContent = String(pairs).padStart(4, '0');
  }

  /* ── live-ish asset quotes ──────────────────────────────────── */
  const feeds = [
    { sel: '[data-feed="fx"] [data-px]', v: 1.08423, step: 0.00012, fmt: v => v.toFixed(5) },
    { sel: '[data-feed="cx"] [data-px]', v: 67412.5, step: 42, fmt: v => fmt(Math.round(v * 10) / 10) },
    { sel: '[data-feed="ix"] [data-px]', v: 5318.2, step: 2.4, fmt: v => fmt(Math.round(v * 10) / 10) },
    { sel: '[data-feed="cm"] [data-px]', v: 2384.6, step: 1.7, fmt: v => fmt(Math.round(v * 100) / 100) },
  ].map(f => ({ ...f, el: document.querySelector(f.sel) }));

  setInterval(() => {
    feeds.forEach(f => {
      if (!f.el) return;
      const d = (Math.random() - 0.485) * f.step;
      f.v += d;
      f.el.textContent = f.fmt(f.v);
      f.el.classList.toggle('is-down', d < 0);
    });
  }, 1100);

  /* ── master loop ────────────────────────────────────────────── */
  function loop(time) {
    lenis.raf(time);

    const max = Math.max(1, track.offsetTop + track.offsetHeight - vh);
    const y = window.scrollY || 0;
    progress = Math.max(0, Math.min(1, y / max));
    if (typeof window.__forceP === 'number') progress = window.__forceP; // dev scrub override

    if (N) {
      const target = progress * (N - 1);
      filmPos += (target - filmPos) * 0.16;
      if (Math.abs(target - filmPos) < 0.02) filmPos = target;
      if (Math.round(filmPos) !== renderedIdx || needsDraw) { draw(); needsDraw = false; }
    } else if (needsDraw) { draw(); needsDraw = false; }

    setZone(Math.min(4, Math.floor(progress * 5)));
    updatePanels(progress);
    updateHud(progress);
    cue.classList.toggle('is-hidden', progress > 0.03);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
