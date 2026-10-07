// Teste: casa até liberar a academia (padrão) e modo academia ligado (gym_from injetado).
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = __dirname;
fs.writeFileSync(DIR + '/_page.html', '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + fs.readFileSync(DIR + '/projeto_verao_27_cld.html', 'utf8') + '</body></html>');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await b.newContext({ timezoneId: 'America/Sao_Paulo', viewport: { width: 400, height: 900 } });
  const errs = []; let fails = 0;
  const check = (n, ok, i) => { if (!ok) fails++; console.log((ok ? 'OK   ' : 'FALHA') + ' ' + n + (i ? ' → ' + i : '')); };
  async function open(iso, tab, gym) {
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(iso + ': ' + e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.clock.setFixedTime(new Date(iso + 'T09:00:00-03:00'));
    await p.addInitScript(([t, g]) => {
      try { localStorage.clear(); localStorage.setItem('v27:tab', JSON.stringify(t)); } catch (e) {}
      if (g) { let v; Object.defineProperty(window, 'PLAN', { configurable: true, get: () => v, set: x => { x.gym_from = g; v = x; } }); }
    }, [tab, gym || 0]);
    await p.goto('file://' + DIR + '/_page.html'); await p.waitForTimeout(150);
    return p;
  }
  // padrão: casa
  for (const [iso, name] of [['2026-10-02', 'PERNAS B'], ['2026-10-03', 'SUPERIOR B'], ['2026-10-08', 'PERNAS A'], ['2026-10-13', 'PERNAS A'], ['2026-10-15', 'SUPERIOR A']]) {
    const p = await open(iso, 'hoje');
    const h3 = await p.$eval('#v-hoje .logger h3', el => el.innerText);
    const tl = await p.$$eval('#v-hoje .meal.train', els => els.map(e => e.innerText.replace(/\s+/g, ' ')));
    const meta = await p.$eval('#v-hoje .ex-meta', el => el.innerText).catch(() => '');
    check(iso + ' em casa: ' + h3, h3.includes(name) && h3.includes('CASA'), '');
    check(iso + ' treino às 10h', tl.length === 1 && tl[0].startsWith('10:00'), tl.join(' | '));
    if (iso >= '2026-10-12') check(iso + ' S3 em casa com 3 séries', /^3 séries/.test(meta), meta);
    await p.close();
  }
  let p = await open('2026-10-06', 'treino');
  const segs = await p.$$eval('.seg[aria-label="Sessão"] button', els => els.map(e => e.innerText).join(' | '));
  check('registro S2 = casa', !/INFERIOR A|SUPERIOR A ?$/.test(segs) && /PERNAS A CASA/.test(segs), segs);
  await p.close();
  // modo academia ligado na semana 2
  p = await open('2026-10-06', 'hoje', 2);
  const g = await p.$eval('#v-hoje .logger h3', el => el.innerText);
  check('academia ligada (gym_from=2): ' + g, /INFERIOR A$/.test(g.trim()), '');
  const tl2 = await p.$$eval('#v-hoje .meal.train', els => els.map(e => e.innerText.replace(/\s+/g, ' ')));
  check('academia usa os horários do plano', tl2.length === 1 && tl2[0].startsWith('06:30'), tl2.join(' | '));
  await p.close();
  check('sem erros de script', errs.length === 0, errs.join(' | '));
  await b.close(); fs.unlinkSync(DIR + '/_page.html');
  console.log(fails ? fails + ' falha(s)' : 'TUDO OK');
})();
