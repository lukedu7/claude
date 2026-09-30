// Teste do registro real de 28/09: metas de quinta (CQ) e sábado (CS) + botão "Fui no limite".
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = __dirname;
fs.writeFileSync(DIR + '/_page.html', '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + fs.readFileSync(DIR + '/projeto_verao_27_cld.html', 'utf8') + '</body></html>');
const LOG = JSON.parse(fs.readFileSync(DIR + '/log_w01_c1_cld.json', 'utf8'));
const data = { workouts: { 'w01-C1': LOG }, weighins: {}, checks: {}, measures: {}, settings: {} };
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await browser.newContext({ timezoneId: 'America/Sao_Paulo', viewport: { width: 400, height: 900 } });
  const errors = []; let fails = 0;
  const check = (n, ok, i) => { if (!ok) fails++; console.log((ok ? 'OK   ' : 'FALHA') + ' ' + n + (i ? ' → ' + i : '')); };
  async function open(iso, d) {
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push(iso + ': ' + e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.clock.setFixedTime(new Date(iso + 'T05:50:00-03:00'));
    await p.addInitScript(dd => { try { localStorage.clear(); localStorage.setItem('v27:data', JSON.stringify(dd)); localStorage.setItem('v27:tab', '"hoje"'); } catch (e) {} }, d);
    await p.goto('file://' + DIR + '/_page.html'); await p.waitForTimeout(150);
    return p;
  }
  const goal = (p, id) => p.$eval('[data-ex="' + id + '"]', el => el.closest('.ex').querySelector('.goal').innerText).catch(() => '—');
  let p = await open('2026-10-01', data);
  const q = { cq1: 'No chão · 8 / 8', cq4: '3 kg · 15 / 15', cq6: '5 kg · 12 / 12', cq7: 'Testa no chão, 5 kg com as 2 mãos · 12 / 12' };
  for (const id in q) { const g = await goal(p, id); check('qui ' + id + ' = ' + q[id], g.endsWith(q[id]), g); }
  // botão "Fui no limite" grava lim no registro
  await p.check('#lm-1-CQ-cq1'); await p.waitForTimeout(100);
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('v27:data')).workouts['w01-CQ']);
  check('botão grava lim + nível', saved && saved.ex.cq1 && saved.ex.cq1.lim === true && saved.ex.cq1.v === 'No chão', JSON.stringify(saved && saved.ex.cq1));
  await p.screenshot({ path: DIR + '/shot_qui_cld.png', fullPage: false });
  const wide = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('sem rolagem lateral no celular', wide <= 0, 'excesso ' + wide + ' px');
  await p.close();
  p = await open('2026-10-03', data);
  const s = { cs2: 'Serrote 5 kg, descida 3 s + pausa 1 s no topo · 16 / 16', cs3: 'Mãos no sofá, pés no chão · 6 / 6' };
  for (const id in s) { const g = await goal(p, id); check('sáb ' + id + ' = ' + s[id], g.endsWith(s[id]), g); }
  await p.close();
  check('sem erros de script', errors.length === 0, errors.join(' | '));
  await browser.close();
  console.log(fails ? fails + ' falha(s)' : 'TUDO OK');
})();
