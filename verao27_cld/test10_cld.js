// Teste: flexão travada 3x em 8 (limite) → sexta destrava no sofá 13/13 → segunda volta ao chão 8/8/8; desenvolvimento com 3 séries na S3.
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = __dirname;
fs.writeFileSync(DIR + '/_page.html', '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + fs.readFileSync(DIR + '/projeto_verao_27_cld.html', 'utf8') + '</body></html>');
const S = (...r) => r.map(x => ({ kg: '', reps: String(x) }));
const base = {
  'w01-C1': { week: 1, session: 'C1', done: true, ex: { c1a: { lim: true, sets: S(8, 8), v: 'No chão' }, c1c: { sets: S(3), v: 'No chão (V invertido)' } } },
  'w01-CQ': { week: 1, session: 'CQ', done: true, ex: { cq1: { lim: true, sets: S(8, 8), v: 'No chão' } } },
  'w02-C1': { week: 2, session: 'C1', done: true, ex: { c1a: { lim: true, sets: S(8, 8), v: 'No chão' }, c1c: { lim: true, sets: S(12, 12), v: '5 kg, descida 3 s' } } } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await b.newContext({ timezoneId: 'America/Sao_Paulo', viewport: { width: 400, height: 900 } });
  const errs = []; let fails = 0;
  const check = (n, ok, i) => { if (!ok) fails++; console.log((ok ? 'OK   ' : 'FALHA') + ' ' + n + (i ? ' → ' + i : '')); };
  async function open(iso, W) {
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(iso + ': ' + e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.clock.setFixedTime(new Date(iso + 'T08:00:00-03:00'));
    await p.addInitScript(dd => { try { localStorage.clear(); localStorage.setItem('v27:data', JSON.stringify(dd)); localStorage.setItem('v27:tab', '"hoje"'); } catch (e) {} }, { workouts: W, weighins: {}, checks: {}, measures: {}, settings: {} });
    await p.goto('file://' + DIR + '/_page.html'); await p.waitForTimeout(150);
    return p;
  }
  const ex = (p, id) => p.$eval('[data-ex="' + id + '"]', el => el.closest('.ex').querySelector('.hint, .goal').parentElement.innerText.replace(/\s+/g, ' ')).catch(() => '—');
  const goal = (p, id) => p.$eval('[data-ex="' + id + '"]', el => el.closest('.ex').querySelector('.goal').innerText).catch(() => '—');
  let p = await open('2026-10-09', base);
  let g = await goal(p, 'cq1');
  check('sex: destrava no sofá 13/13', g.endsWith('Mãos no assento do sofá encostado na parede · 13 / 13'), g);
  await p.close();
  const W2 = Object.assign({}, base, { 'w02-CQ': { week: 2, session: 'CQ', done: true, ex: { cq1: { sets: S(13, 13), v: 'Mãos no assento do sofá encostado na parede' } } } });
  p = await open('2026-10-12', W2);
  g = await goal(p, 'c1a');
  check('seg: volta ao chão 8/8/8', g.endsWith('No chão · 8 / 8 / 8'), g);
  const t = await ex(p, 'c1a');
  check('seg: dica explica a volta', /Sessão de destravar feita: volta para “No chão”/.test(t), t.slice(0, 200));
  g = await goal(p, 'c1c');
  check('seg: desenvolvimento com 3 séries', g.endsWith('5 kg, descida 3 s · 12 / 12 / 12'), g);
  await p.close();
  check('sem erros de script', errs.length === 0, errs.join(' | '));
  await b.close(); fs.unlinkSync(DIR + '/_page.html');
  console.log(fails ? fails + ' falha(s)' : 'TUDO OK');
})();
