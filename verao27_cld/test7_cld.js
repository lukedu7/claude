// Teste: domingo sem shake (e com a creatina no almoço); segunda e sábado continuam com shake.
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = __dirname;
fs.writeFileSync(DIR + '/_page.html', '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + fs.readFileSync(DIR + '/projeto_verao_27_cld.html', 'utf8') + '</body></html>');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await b.newContext({ timezoneId: 'America/Sao_Paulo', viewport: { width: 400, height: 900 } });
  const errs = []; let fails = 0;
  const check = (n, ok, i) => { if (!ok) fails++; console.log((ok ? 'OK   ' : 'FALHA') + ' ' + n + (i ? ' → ' + i : '')); };
  async function open(iso, tab) {
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(iso + ': ' + e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.clock.setFixedTime(new Date(iso + 'T10:00:00-03:00'));
    await p.addInitScript(t => { try { localStorage.clear(); localStorage.setItem('v27:tab', JSON.stringify(t)); } catch (e) {} }, tab);
    await p.goto('file://' + DIR + '/_page.html'); await p.waitForTimeout(150);
    return p;
  }
  for (const [iso, shake] of [['2026-10-04', false], ['2026-10-11', false], ['2026-10-03', true], ['2026-10-05', true]]) {
    const p = await open(iso, 'hoje');
    const txt = await p.$eval('#v-hoje', el => el.innerText);
    const meals = await p.$$eval('#v-hoje .meal:not(.water) .meal-name', els => els.map(e => e.innerText.replace(/\s+/g, ' ')));
    check(iso + (shake ? ' tem shake' : ' sem shake'), meals.some(m => /shake/i.test(m)) === shake, meals.join(' | '));
    if (!shake) check(iso + ' avisa da creatina no almoço', /Creatina 5 g com água ou suco no almoço/.test(txt), '');
    await p.close();
  }
  check('sem erros de script', errs.length === 0, errs.join(' | '));
  await b.close(); fs.unlinkSync(DIR + '/_page.html');
  console.log(fails ? fails + ' falha(s)' : 'TUDO OK');
})();
