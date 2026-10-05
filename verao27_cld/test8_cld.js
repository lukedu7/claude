// Teste: seg 05/10 presencial (treino 18h15, shake 21h30, sem ceia) + desenvolvimento no lugar do pike.
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
    await p.clock.setFixedTime(new Date(iso + 'T07:00:00-03:00'));
    await p.addInitScript(dd => { try { localStorage.clear(); localStorage.setItem('v27:data', JSON.stringify(dd)); localStorage.setItem('v27:tab', '"hoje"'); } catch (e) {} }, data);
    await p.goto('file://' + DIR + '/_page.html'); await p.waitForTimeout(150);
    return p;
  }
  const goal = (p, id) => p.$eval('[data-ex="' + id + '"]', el => el.closest('.ex').querySelector('.goal').innerText).catch(() => '—');
  let p = await open('2026-10-05');
  const rows = await p.$$eval('#v-hoje .meal', els => els.map(e => e.innerText.replace(/\s+/g, ' ')));
  const line = rows.join(' | ');
  check('seg 05/10 treino 18h15', rows.some(r => r.startsWith('18:15')), line);
  check('seg 05/10 shake 21h30 e sem ceia', rows.some(r => r.startsWith('21:30') && /shake/i.test(r)) && !rows.some(r => /Ceia/.test(r)), line);
  check('seg 05/10 almoço 12h15 e pré às 16h', rows.some(r => r.startsWith('12:15')) && rows.some(r => r.startsWith('16:00')), '');
  const want = { c1a: 'No chão · 8 / 8', c1b: 'Serrote 5 kg, descida 3 s + pausa 1 s no topo · 16 / 16', c1c: '5 kg, descida 3 s · 12 / 12', c1d: '3 kg · 15 / 15', c1e: '5 kg · 12 / 12', c1f: 'Testa no chão, 5 kg com as 2 mãos · 13 / 13' };
  for (const id in want) { const g = await goal(p, id); check('seg ' + id + ' = ' + want[id], g.endsWith(want[id]), g); }
  const nm = await p.$eval('[data-ex="c1c"]', el => el.closest('.ex').innerText).catch(() => '');
  check('c1c virou desenvolvimento', /Desenvolvimento sentado/.test(nm) && !/Pike/.test(nm), '');
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('sem rolagem lateral', ov <= 0, ov + ' px');
  await p.close();
  p = await open('2026-10-12');
  const r12 = await p.$$eval('#v-hoje .meal', els => els.map(e => e.innerText.replace(/\s+/g, ' ')));
  check('seg 12/10 volta ao padrão (treino 10h)', r12.some(r => r.startsWith('10:00')), r12.join(' | '));
  await p.close();
  check('sem erros de script', errs.length === 0, errs.join(' | '));
  await b.close(); fs.unlinkSync(DIR + '/_page.html');
  console.log(fails ? fails + ' falha(s)' : 'TUDO OK');
})();
