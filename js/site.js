/* PRIME DCX — shared subpage behavior: ticker tape, reveals, quote drift */
(() => {
  'use strict';

  /* ── ticker tape (real market list from primedcx.com) ─────────── */
  const QUOTES = [
    ['EUR/USD', 1.0856, 4, 0.23], ['GBP/USD', 1.2640, 4, 0.15],
    ['USD/JPY', 148.20, 2, -0.05], ['AUD/USD', 0.6540, 4, 0.12],
    ['USD/CAD', 1.3450, 4, -0.08], ['USD/CHF', 0.8790, 4, 0.03],
    ['NZD/USD', 0.6120, 4, 0.18], ['BTC/USD', 45230, 0, 2.45],
    ['ETH/USD', 2450, 0, 1.20], ['XAU/USD', 2035, 2, -0.45],
  ];
  const tape = document.querySelector('.tape__inner');
  if (tape) {
    const row = QUOTES.map(([s, p, d, c]) =>
      `<b>${s}</b> ${p.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })} ` +
      `<span class="${c >= 0 ? 'up' : 'dn'}">${c >= 0 ? '▲' : '▼'} ${Math.abs(c).toFixed(2)}%</span>`
    ).join(' ');
    tape.innerHTML = row + ' ' + row;
  }

  /* ── reveal on scroll ─────────────────────────────────────────── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  /* ── gentle price drift on any [data-px-drift] mono numbers ───── */
  document.querySelectorAll('[data-px-drift]').forEach(el => {
    const base = parseFloat(el.textContent.replace(/,/g, ''));
    const dec = (el.textContent.split('.')[1] || '').length;
    if (isNaN(base)) return;
    let v = base;
    setInterval(() => {
      v += (Math.random() - 0.49) * base * 0.0004;
      el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    }, 1400 + Math.random() * 800);
  });
})();
