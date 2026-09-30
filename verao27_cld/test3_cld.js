// Teste: água aparece na linha do dia, com total, e marcar grava no registro.
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = __dirname;
fs.writeFileSync(DIR + '/_page.html', '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + fs.readFileSync(DIR + '/projeto_verao_27_cld.html', 'utf8') + '</body></html>');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ timezoneId: 'America/Sao_Paulo', viewport: { width: 400, height: 900 } });
  const errors = []; let fails = 0;
  const check = (n, ok, i) => { if (!ok) fails++; console.log((ok ? 'OK   ' : 'FALHA') + ' ' + n + (i ? ' → ' + i : '')); };
  for (const iso of ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-06', '2026-10-10']) {
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push(iso + ': ' + e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.clock.setFixedTime(new Date(iso + 'T09:00:00-03:00'));
    await p.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('v27:tab', '"hoje"'); } catch (e) {} });
    await p.goto('file://' + DIR + '/_page.html'); await p.waitForTimeout(120);
    const rows = await p.$$eval('#v-hoje .meal', els => els.map(e => e.innerText.replace(/\s+/g, ' ').trim()));
    const water = rows.filter(r => /Água: \d+ ml/.test(r));
    const tot = await p.$eval('#v-hoje .panel p.small.muted', el => el.innerText).catch(() => '');
    const all = await p.$$eval('#v-hoje .panel p.small.muted', els => els.map(e => e.innerText).find(t => /Água nos horários/.test(t)) || '');
    console.log(iso + ' · ' + water.length + ' copos · ' + all + '\n   ' + rows.map(r => r.slice(0, 40)).join('\n   '));
    check(iso + ' tem água no dia', water.length >= 4);
    if (iso === '2026-09-30') {
      const id = await p.$eval('#v-hoje input[data-act="water"]', el => el.id);
      await p.check('#' + id); await p.waitForTimeout(100);
      const ck = await p.evaluate(() => JSON.parse(localStorage.getItem('v27:data')).checks['2026-09-30']);
      check('marcar água grava', ck && ck.agua && Object.values(ck.agua).some(Boolean), JSON.stringify(ck));
      const wide = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check('sem rolagem lateral', wide <= 0, wide + ' px');
      await p.screenshot({ path: DIR + '/shot_agua_cld.png', fullPage: true });
    }
    await p.close();
  }
  check('sem erros de script', errors.length === 0, errors.join(' | '));
  await b.close();
  console.log(fails ? fails + ' falha(s)' : 'TUDO OK');
})();
