// Teste: semana 2 reorganizada (ter folga, qua Casa 1 às 15h30, qui Pernas A, sex Superior A, sáb Pernas B).
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = __dirname;
fs.writeFileSync(DIR + '/_page.html', '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + fs.readFileSync(DIR + '/projeto_verao_27_cld.html', 'utf8') + '</body></html>');
const S = (...r) => r.map(x => ({ kg: '', reps: String(x) }));
const data = { workouts: {
  'w01-C1': { week: 1, session: 'C1', date: '2026-09-28', done: true, ex: { c1a: { lim: true, sets: S(8, 8), v: 'No chão' }, c1b: { sets: S(15, 15), v: 'Serrote 5 kg, descida 3 s + pausa 1 s no topo' }, c1c: { sets: S(3), v: 'No chão (V invertido)' }, c1d: { lim: true, sets: S(15, 15), v: '3 kg' }, c1e: { lim: true, sets: S(12, 12), v: '5 kg' }, c1f: { sets: S(6), v: '5 kg unilateral' } } },
  'w01-CQ': { week: 1, session: 'CQ', date: '2026-10-01', done: true, ex: { cq1: { lim: true, sets: S(8, 8), v: 'No chão' }, cq4: { lim: true, sets: S(15, 15), v: '3 kg' }, cq6: { lim: true, sets: S(12, 12), v: '5 kg' }, cq7: { sets: S(12, 12), v: 'Testa no chão, 5 kg com as 2 mãos' } } } },
  weighins: {}, checks: {}, measures: {}, settings: {} };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await b.newContext({ timezoneId: 'America/Sao_Paulo', viewport: { width: 400, height: 900 } });
  const errs = []; let fails = 0;
  const check = (n, ok, i) => { if (!ok) fails++; console.log((ok ? 'OK   ' : 'FALHA') + ' ' + n + (i ? ' → ' + i : '')); };
  async function open(iso) {
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(iso + ': ' + e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.clock.setFixedTime(new Date(iso + 'T08:00:00-03:00'));
    await p.addInitScript(dd => { try { localStorage.clear(); localStorage.setItem('v27:data', JSON.stringify(dd)); localStorage.setItem('v27:tab', '"hoje"'); } catch (e) {} }, data);
    await p.goto('file://' + DIR + '/_page.html'); await p.waitForTimeout(150);
    return p;
  }
  const want = { '2026-10-06': null, '2026-10-07': 'CASA 1', '2026-10-08': 'PERNAS A', '2026-10-09': 'SUPERIOR A', '2026-10-10': 'PERNAS B' };
  for (const iso in want) {
    const p = await open(iso);
    const h3 = await p.$eval('#v-hoje .logger h3', el => el.innerText).catch(() => '');
    if (want[iso]) check(iso + ' = ' + want[iso], h3.includes(want[iso]), h3);
    else check(iso + ' sem treino', !h3, h3);
    if (iso === '2026-10-07') {
      const rows = await p.$$eval('#v-hoje .meal', els => els.map(e => e.innerText.replace(/\s+/g, ' ')));
      check('qua treino 15h30 e shake 16h15', rows.some(r => r.startsWith('15:30')) && rows.some(r => r.startsWith('16:15') && /shake/i.test(r)), rows.map(r => r.slice(0, 30)).join(' | '));
      const g = await p.$eval('[data-ex="c1c"]', el => el.closest('.ex').querySelector('.goal').innerText).catch(() => '—');
      check('qua desenvolvimento 12/12', g.endsWith('5 kg, descida 3 s · 12 / 12'), g);
    }
    await p.close();
  }
  check('sem erros de script', errs.length === 0, errs.join(' | '));
  await b.close(); fs.unlinkSync(DIR + '/_page.html');
  console.log(fails ? fails + ' falha(s)' : 'TUDO OK');
})();
