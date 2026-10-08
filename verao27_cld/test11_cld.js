// Teste: jejum de 24h (qui 15/10 20h → sex 16/10 20h) e o seguinte (sex 23/10 → sáb 24/10).
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = __dirname;
fs.writeFileSync(DIR + '/_page.html', '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + fs.readFileSync(DIR + '/projeto_verao_27_cld.html', 'utf8') + '</body></html>');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await b.newContext({ timezoneId: 'America/Sao_Paulo', viewport: { width: 400, height: 900 } });
  const errs = []; let fails = 0;
  const check = (n, ok, i) => { if (!ok) fails++; console.log((ok ? 'OK   ' : 'FALHA') + ' ' + n + (i ? ' → ' + i : '')); };
  async function day(iso) {
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(iso + ': ' + e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.clock.setFixedTime(new Date(iso + 'T07:00:00-03:00'));
    await p.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('v27:tab', '"hoje"'); } catch (e) {} });
    await p.goto('file://' + DIR + '/_page.html'); await p.waitForTimeout(150);
    const h3 = await p.$eval('#v-hoje .logger h3', el => el.innerText).catch(() => '');
    const rows = await p.$$eval('#v-hoje .meal', els => els.map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 40)));
    const txt = await p.$eval('#v-hoje', el => el.innerText);
    const plan = await p.evaluate(() => ({ skip: window.PLAN.weigh_skip, fasts: window.PLAN.fasts }));
    await p.close();
    return { h3, rows, txt, plan };
  }
  const want = { '2026-10-12': 'CASA 1', '2026-10-13': 'PERNAS A', '2026-10-14': 'SUPERIOR A', '2026-10-15': 'PERNAS B', '2026-10-17': 'SUPERIOR B',
                 '2026-10-23': 'SUPERIOR B', '2026-10-22': 'PERNAS B' };
  for (const iso in want) { const d = await day(iso); check(iso + ' = ' + want[iso], d.h3.includes(want[iso]), d.h3); }
  let d = await day('2026-10-15');
  check('qui 15: jantar 19h e ceia 19h45', d.rows.some(r => r.startsWith('19:00Jantar')) && d.rows.some(r => r.startsWith('19:45Ceia')), d.rows.join(' | '));
  check('qui 15: aviso do jejum', /Jejum começa às 20h/.test(d.txt), '');
  d = await day('2026-10-16');
  check('sex 16: sem treino', !d.h3, d.h3);
  const meals = d.rows.filter(r => !/Água/.test(r)), water = d.rows.filter(r => /Água/.test(r));
  check('sex 16: só quebra 20h e jantar 20h45', meals.length === 2 && meals[0].startsWith('20:00') && meals[1].startsWith('20:45'), meals.join(' | '));
  check('sex 16: 6 águas de 500 ml', water.length === 6 && water.every(r => /500 ml/.test(r)), water.join(' | '));
  d = await day('2026-10-17');
  check('sáb 17: shake extra no aviso', /shake extra às 15h/.test(d.txt), '');
  d = await day('2026-10-18');
  check('dom 18: sem shake extra', !/shake extra/.test(d.txt), '');
  d = await day('2026-10-24');
  check('sáb 24: jejum, sem treino', !d.h3 && /Jejum até as 20h/.test(d.txt), d.h3);
  check('pesagem do dia seguinte fora da média', d.plan.skip.indexOf('2026-10-17') >= 0 && d.plan.skip.indexOf('2026-10-25') >= 0, JSON.stringify(d.plan.skip.slice(0, 3)));
  check('jejuns a cada 8 dias', d.plan.fasts.slice(0, 4).join(',') === '2026-10-15,2026-10-23,2026-10-31,2026-11-08', d.plan.fasts.slice(0, 4).join(','));
  check('sem erros de script', errs.length === 0, errs.join(' | '));
  await b.close(); fs.unlinkSync(DIR + '/_page.html');
  console.log(fails ? fails + ' falha(s)' : 'TUDO OK');
})();
