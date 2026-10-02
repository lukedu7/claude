// Teste do botão "Sobrou muito": com o registro real da semana 1 (CT e CX), ponte e panturrilha sobem de nível.
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = __dirname;
fs.writeFileSync(DIR + '/_page.html', '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + fs.readFileSync(DIR + '/projeto_verao_27_cld.html', 'utf8') + '</body></html>');
const S = (...r) => r.map(x => ({ kg: '', reps: String(x) }));
const data = { workouts: {
  'w01-CT': { week: 1, session: 'CT', date: '2026-09-29', done: true, ex: {
    ct1: { v: 'Búlgaro, pé de trás na cadeira', sets: S(10, 10) }, ct2: { v: 'Halter 5 kg, mão na parede', sets: S(12, 12) },
    ct3: { v: 'Halteres 5 kg, descida 3 s', sets: S(15, 15) }, ct4: { v: 'Unilateral, pé na cadeira', sets: S(10, 10) },
    ct5: { v: 'Unilateral, ponta do pé no livro, mão na parede', sets: S(12, 12) }, ct6: { v: '3 kg', sets: S(15, 15) } } },
  'w01-CX': { week: 1, session: 'CX', date: '2026-10-02', done: true, ex: {
    cx1: { v: 'Halteres 5 kg', lim: true, sets: S(10, 10) }, cx2: { v: 'Unilateral no chão, pausa 2 s no topo', sets: S(10, 10) },
    cx3: { v: 'Unilateral, pé na cadeira', easy: true, sets: S(11, 11) }, cx4: { v: 'Unilateral, ponta do pé no livro, mão na parede', easy: true, sets: S(13, 13) },
    cx5: { v: 'Halter 5 kg no peito', sets: S(16, 16) }, cx6: { v: 'Joelhos a 90°', sets: S(10, 10) } } } },
  weighins: {}, checks: {}, measures: {}, settings: {} };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await b.newContext({ timezoneId: 'America/Sao_Paulo', viewport: { width: 400, height: 900 } });
  const errs = []; let fails = 0;
  const check = (n, ok, i) => { if (!ok) fails++; console.log((ok ? 'OK   ' : 'FALHA') + ' ' + n + (i ? ' → ' + i : '')); };
  async function open(iso) {
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(iso + ': ' + e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.clock.setFixedTime(new Date(iso + 'T09:00:00-03:00'));
    await p.addInitScript(dd => { try { localStorage.clear(); localStorage.setItem('v27:data', JSON.stringify(dd)); localStorage.setItem('v27:tab', '"hoje"'); } catch (e) {} }, data);
    await p.goto('file://' + DIR + '/_page.html'); await p.waitForTimeout(150);
    return p;
  }
  const ex = (p, id) => p.$eval('[data-ex="' + id + '"]', el => el.closest('.ex').innerText.replace(/\s+/g, ' ')).catch(() => '—');
  const goal = (t) => (t.match(/Meta de hoje: (.*?)(Última|1ª vez)/) || [])[1] || t;
  let p = await open('2026-10-06');
  // em casa a S2 ainda tem 2 séries (a 3ª entra na S3)
  const want6 = { ct4: 'Unilateral, pé na cadeira, pausa 2 s no topo · 8 / 8', ct5: 'Unilateral + halter 5 kg na mão livre · 10 / 10' };
  for (const id in want6) { const t = await ex(p, id); check('ter ' + id + ' = ' + want6[id], goal(t).trim() === want6[id], goal(t)); check('ter ' + id + ' explica o "sobrou muito"', /marcou que sobrou muito: subiu de nível/.test(t), ''); }
  // marcar "Fui no limite" e depois "Sobrou muito": um desmarca o outro e grava
  await p.check('#lm-2-CT-ct1'); await p.check('#ez-2-CT-ct1'); await p.waitForTimeout(100);
  const lmOff = await p.$eval('#lm-2-CT-ct1', el => el.checked);
  const sv = await p.evaluate(() => JSON.parse(localStorage.getItem('v27:data')).workouts['w02-CT']);
  check('marcar "sobrou muito" desmarca o limite', !lmOff && sv && sv.ex.ct1.easy === true && sv.ex.ct1.lim === false && !!sv.ex.ct1.v, JSON.stringify(sv && sv.ex.ct1));
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('sem rolagem lateral', ov <= 0, ov + ' px');
  await p.close();
  p = await open('2026-10-09');
  const want9 = { cx1: 'Halteres 5 kg · 10 / 10', cx2: 'Unilateral no chão, pausa 2 s no topo · 11 / 11', cx5: 'Halter 5 kg no peito · 17 / 17', cx6: 'Joelhos a 90° · 11 / 11' };
  for (const id in want9) { const t = goal(await ex(p, id)).trim(); check('sex ' + id + ' = ' + want9[id], t === want9[id], t); }
  await p.close();
  check('sem erros de script', errs.length === 0, errs.join(' | '));
  await b.close(); fs.unlinkSync(DIR + '/_page.html');
  console.log(fails ? fails + ' falha(s)' : 'TUDO OK');
})();
