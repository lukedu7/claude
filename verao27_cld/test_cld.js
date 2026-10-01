// Teste (modo academia ligado na semana 2, via gym_from): renderiza as 6 abas em cada dia da semana e confere a lógica das metas exatas.
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = __dirname;
const page_html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + fs.readFileSync(DIR + '/projeto_verao_27_cld.html', 'utf8') + '</body></html>';
fs.writeFileSync(DIR + '/_page.html', page_html);
const URL = 'file://' + DIR + '/_page.html';
const TABS = ['hoje', 'treino', 'comida', 'compras', 'progresso', 'regras'];

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await browser.newContext({ timezoneId: 'America/Sao_Paulo', viewport: { width: 400, height: 900 } });
  const errors = [];
  let fails = 0;
  function check(name, ok, info) { if (!ok) fails++; console.log((ok ? 'OK   ' : 'FALHA') + ' ' + name + (info ? ' → ' + info : '')); }

  async function open(dateIso, data, tab) {
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(dateIso + ' ' + tab + ': ' + e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.clock.setFixedTime(new Date(dateIso + 'T20:00:00-03:00'));
    await page.addInitScript(([d, t]) => { try { localStorage.clear(); if (d) localStorage.setItem('v27:data', JSON.stringify(d)); localStorage.setItem('v27:tab', JSON.stringify(t)); } catch (e) {} let v; Object.defineProperty(window, 'PLAN', { configurable: true, get: () => v, set: x => { x.gym_from = 2; v = x; } }); }, [data, tab]);
    await page.goto(URL);
    await page.waitForTimeout(150);
    return page;
  }

  // 1) todas as abas, todos os dias da semana 1
  for (let d = 28; d <= 34; d++) {
    const iso = d <= 30 ? '2026-09-' + d : '2026-10-0' + (d - 30);
    for (const t of TABS) { const p = await open(iso, null, t); await p.close(); }
  }
  check('6 abas × 7 dias sem erro de script', errors.length === 0, errors.slice(0, 3).join(' | '));

  // 2) hoje (seg 28/09): Casa 1 com metas exatas
  let p = await open('2026-09-28', null, 'hoje');
  const hints = await p.$$eval('#v-hoje .hint', els => els.map(e => e.innerText.replace(/\s+/g, ' ').trim()));
  console.log(hints.join('\n'));
  check('Casa 1: toda série tem meta exata', hints.filter(h => h.startsWith('Meta de hoje:')).length >= 6);
  const ph = await p.$$eval('#v-hoje .set input', els => els.map(e => e.placeholder));
  check('placeholders numéricos', ph.length > 0 && ph.every(x => /^\d+([.,]\d+)?$/.test(x)), ph.join(','));
  await p.screenshot({ path: DIR + '/shot_hoje_cld.png', fullPage: true });
  // registra flexão (c1a) 8/8 digitando, confere que o nível padrão foi salvo
  const ids = await p.$$eval('#v-hoje .set input[data-ex="c1a"]', els => els.map(e => e.id));
  for (const id of ids) await p.fill('#' + id, '8');
  await p.waitForTimeout(100);
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('v27:data')).workouts['w01-C1']);
  check('nível salvo junto das reps', saved && saved.ex.c1a && saved.ex.c1a.v, JSON.stringify(saved && saved.ex.c1a));
  await p.close();

  // 3) semana 1 em casa: terça mostra sessão de casa com metas; flexão herda o registro de segunda
  const data = { workouts: {
    'w01-C1': { week: 1, session: 'C1', done: true, ex: { c1a: { v: saved.ex.c1a.v, sets: [{ kg: '', reps: '8' }, { kg: '', reps: '7' }] } } },
    'w02-SA': { week: 2, session: 'SA', done: true, ex: {
      sa1: { v: '', sets: [{ kg: '10', reps: '12' }, { kg: '10', reps: '12' }] },
      sa2: { v: '', sets: [{ kg: '30', reps: '10' }, { kg: '30', reps: '9' }] } } },
  }, weighins: {}, checks: {}, measures: {}, settings: {} };
  for (const iso of ['2026-09-29', '2026-10-01', '2026-10-02', '2026-10-03']) {
    p = await open(iso, data, 'hoje');
    const name = await p.$eval('#v-hoje .logger h3', el => el.innerText).catch(() => '?');
    const chip = await p.$eval('#v-hoje .logger .chip', el => el.innerText).catch(() => '?');
    const hs = await p.$$eval('#v-hoje .hint', els => els.map(e => e.innerText.replace(/\s+/g, ' ').trim()));
    const strip = await p.$eval('#v-hoje .strip', el => el.innerText.replace(/\s+/g, ' '));
    check(iso + ' em casa: ' + name, chip === 'Casa' && hs.filter(h => h.startsWith('Meta de hoje:')).length >= 4, chip + ' · ' + hs.length + ' metas');
    check(iso + ' semáforo conta treinos', /\/4 treinos/.test(strip), strip.slice(-60));
    const fx = await p.$$eval('#v-hoje [data-ex]', els => { const out = []; els.forEach(e => { const box = e.closest('.ex'); if (box && /Flexão/i.test(box.querySelector('.ex-name').innerText)) out.push(box.querySelector('.hint').innerText.replace(/\s+/g, ' ')); }); return [...new Set(out)]; });
    if (fx.length) console.log('   flexão: ' + fx[0]);
    console.log('   ' + hs.join('\n   '));
    await p.close();
  }
  // 4) semana 3: progressão a partir do registro da semana 2 (academia)
  p = await open('2026-10-12', data, 'treino');
  await p.click('button[data-act="ts"][data-sid="SA"]'); await p.waitForTimeout(80);
  let t = await p.$eval('[data-ex="sa1"]', el => el.closest('.ex').querySelector('.hint').innerText);
  check('S3 supino: topo → 12 kg × 8 / 8 / 8', /Meta de hoje: 12 kg × 8 \/ 8 \/ 8/.test(t), t.replace(/\s+/g, ' '));
  t = await p.$eval('[data-ex="sa2"]', el => el.closest('.ex').querySelector('.hint').innerText);
  check('S3 puxada: 30 kg × 11 / 10 / 10', /Meta de hoje: 30 kg × 11 \/ 10 \/ 10/.test(t), t.replace(/\s+/g, ' '));
  await p.click('button[data-act="ts"][data-sid="C1"]'); await p.waitForTimeout(80);
  t = await p.$eval('[data-ex="c1a"]', el => el.closest('.ex').querySelector('.hint').innerText);
  console.log('   C1 flexão S3: ' + t.replace(/\s+/g, ' '));
  await p.close();
  // 5) semana 2: registro lista as sessões de academia; semana 1 as de casa
  p = await open('2026-10-06', data, 'treino');
  const segs = await p.$$eval('.seg[aria-label="Sessão"] button', els => els.map(e => e.innerText));
  check('S2 registro = academia', /inferior a/i.test(segs.join('|')) && !segs.join('|').includes('CT'), segs.join(' | '));
  await p.click('button[data-act="tw"][data-delta="-1"]'); await p.waitForTimeout(80);
  const segs1 = await p.$$eval('.seg[aria-label="Sessão"] button', els => els.map(e => e.innerText));
  check('S1 registro = casa', !/inferior a/i.test(segs1.join('|')), segs1.join(' | '));
  await p.close();

  check('sem erros de script no total', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
  console.log(fails ? fails + ' falha(s)' : 'TUDO OK');
})();
