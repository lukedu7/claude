// Teste: 3 sessões no limite no nível mais baixo não disparam a estagnação (meta continua 15/15).
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = __dirname;
fs.writeFileSync(DIR + '/_page.html', '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + fs.readFileSync(DIR + '/projeto_verao_27_cld.html', 'utf8') + '</body></html>');
const L = (id, v, r) => ({ v, lim: true, sets: [{ kg: '', reps: r }, { kg: '', reps: r }] });
const data = { workouts: {
  'w01-C1': { week: 1, session: 'C1', done: true, ex: { c1d: L('c1d', '3 kg', '15') } },
  'w01-CQ': { week: 1, session: 'CQ', done: true, ex: { cq4: L('cq4', '3 kg', '15') } },
  'w01-CS': { week: 1, session: 'CS', done: true, ex: { cs5: L('cs5', '3 kg', '15') } } }, weighins: {}, checks: {}, measures: {}, settings: {} };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext({ timezoneId: 'America/Sao_Paulo' })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.clock.setFixedTime(new Date('2026-10-05T09:00:00-03:00'));
  await p.addInitScript(d => { localStorage.clear(); localStorage.setItem('v27:data', JSON.stringify(d)); localStorage.setItem('v27:tab', '"hoje"'); }, data);
  await p.goto('file://' + DIR + '/_page.html'); await p.waitForTimeout(150);
  const g = await p.$eval('[data-ex="c1d"]', el => el.closest('.ex').querySelector('.goal').innerText);
  const ok = /3 kg · 15 \/ 15/.test(g) && !errs.length;
  console.log((ok ? 'OK   ' : 'FALHA') + ' seg 05/10 elevação lateral → ' + g + (errs.length ? ' | ' + errs.join(' | ') : ''));
  await b.close(); fs.unlinkSync(DIR + '/_page.html');
})();
