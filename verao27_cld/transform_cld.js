// Aplica: metas exatas por série (motor), dados do treinador (coach_cld.json) e correções de texto.
// Uso: node transform_cld.js  → gera projeto_verao_27_cld.html
const fs = require('fs');
const DIR = __dirname;
const src = fs.readFileSync(DIR + '/base_cld.html', 'utf8');
const coach = JSON.parse(fs.readFileSync(DIR + '/coach_cld.json', 'utf8'));

// 1) tira o esqueleto que o publish adiciona (a página começa no <title>)
let h = src.slice(src.indexOf('<title>'));
h = h.replace(/\n?<\/body><\/html>\s*$/, '\n');

// 2) PLAN
const s = h.indexOf('window.PLAN = ') + 14, e = h.indexOf('};\n</script>', s) + 1;
const P = JSON.parse(h.slice(s, e));
const miss = [];
function rep(obj, key, from, to) {
  if (typeof obj[key] !== 'string' || obj[key].indexOf(from) < 0) { miss.push(key + ': ' + from); return; }
  obj[key] = obj[key].replace(from, to);
}

// dados do treinador
const allEx = {};
P.order.forEach(sid => P.sessions[sid].ex.forEach(x => { allEx[x.id] = x; }));
Object.keys(coach.ex).forEach(id => {
  const x = allEx[id], c = coach.ex[id];
  if (!x) { miss.push('exercício desconhecido ' + id); return; }
  x.start = {};
  if (c.lv && c.lv.length) { x.lv = c.lv; x.start.lv = c.lv_start || 0; }
  else if (c.kg != null) x.start.kg = c.kg;
  if (c.reps != null) x.start.reps = c.reps;
  if (c.adj) x.start.adj = c.adj;
  if (c.alt_kg != null) x.alt_kg = c.alt_kg;
  if (c.rest) x.rest = c.rest;
});
Object.keys(coach.inc_changes || {}).forEach(id => { if (allEx[id]) allEx[id].inc = coach.inc_changes[id]; });
Object.values(allEx).forEach(x => { if (!x.nolog && !x.start) miss.push('sem meta inicial: ' + x.id); });

// correções de texto
const cp12 = P.checkpoints.find(c => c.week === 12);
cp12.criteria = cp12.criteria.map(t => t.replace('Cintura no máximo +2,0 cm', 'Cintura no máximo +1,5 cm'));
rep(P.after_jan, 1, 'dentro do teto (+2 cm)', 'dentro do teto (+1,5 cm)');
P.phases[2].rules = P.phases[2].rules.filter((r, i, a) => a.indexOf(r) === i);
rep(P.agenda['2026-10-15'], 0, ' (e da extensora na terça)', '');
P.agenda['2026-10-13'] = ['Calibração de RIR (S3): na última série da extensora, marque a rep em que você acha que ainda sobram 2 e continue até a falha técnica. Anote o total: a meta da próxima vez já sai dele.'];
rep(P.appetite, 0, 'coloque 6 alarmes no celular (07h00, 10h00, 12h30, 16h30, 20h00, 22h30)', 'coloque alarmes nos horários de cada dia (aba Alimentação → Horários por dia)');
rep(P.agenda['2026-09-28'], 3, 'Descubra o seu nível em cada exercício (8–12 reps sobrando 3).', 'Faça as metas exatas que aparecem no registro (aba Hoje).');
rep(P.agenda['2026-09-29'], 0, 'Inferior A com teste de carga (no máximo 3 tentativas por exercício).', 'Inferior A: 1ª vez de cada exercício, com carga e reps exatas no registro.');
P.phases[0].rules = P.phases[0].rules.map(r => r
  .replace('1ª vez de cada exercício: teste de carga (no máximo 3 tentativas).', '1ª vez de cada exercício: o registro mostra a carga (ou o nível) e as reps exatas, com uma regra de ajuste para a série 2.')
  .replace('Casa: ache o seu nível, aquele em que faz 8–12 reps sobrando 3.', 'Casa: o registro mostra o nível e as reps exatas de partida.'));
const pg = P.train.progression;
pg.model = 'Progressão dupla com meta exata: o registro calcula, a partir da última vez, a carga e as reps de cada série. Você só executa. Quando você bate o topo da faixa em TODAS as séries, a carga sobe (ou o nível, em casa) e as reps voltam ao fundo da faixa.';
pg.steps = [
  'Faça a META que aparece em cada série do registro. Ela vem da última vez que você fez aquele exercício.',
  'A meta já traz +1 rep por série sobre a última vez (+5 s na prancha), com a mesma carga.',
  'Não chegou na meta? Anote o que fez de verdade. A próxima meta parte daí.',
  'Bateu o topo em TODAS as séries? Na próxima vez, o registro já mostra a carga nova e as reps no fundo da faixa.',
  'Regra da escada: com a carga nova, se uma série ficar abaixo da meta, faça as seguintes com a carga anterior (o registro diz qual).',
  'Em casa, em vez de carga, sobe o NÍVEL (lista no campo “Nível de hoje”).'
];
pg.start_test = [
  'Na 1ª vez de cada exercício (S1), o registro mostra a carga (ou o nível) e as reps exatas. Faça exatamente isso na série 1.',
  'Logo abaixo da meta vem UMA regra de ajuste para a série 2. Siga só ela.',
  'Anote carga e reps de cada série. É disso que sai a meta da próxima vez.',
  'Achou leve ou pesado demais mesmo assim? Anote a carga que realmente usou: a próxima meta parte dela.'
];
pg.guesses = 'Cargas de partida: já estão no registro de cada exercício, na 1ª vez.';

P.habits = P.habits.filter(x => x.id !== 'agua');
const W1 = require(DIR + '/week1_cld.js');
W1.data(P, fs, DIR, miss);

// ---- casa até a academia (avaliação contínua, sem data fixa) · 01/10
P.gym_from = 99;   // semana em que a academia começa; 99 = ainda em casa
P.home_sched = { '2': 'CT', '4': 'CQ', '5': 'CX', '6': 'CS' };
const HOME_TIMES = { cafe: '08:20', shake: '10:45', almoco: '13:00', pre: '16:30', jantar: '19:30', ceia: '21:30' };
P.home_days = {};
['1', '2', '3', '4', '5', '6'].forEach(d => {
  P.home_days[d] = { title: 'Treino em casa às 10h', train: '10:00', train_end: '', times: Object.assign({}, HOME_TIMES),
    roles: { cafe: 'pré-treino', shake: 'pós-treino', pre: 'lanche' },
    note: 'Acorde 08h15 e pese-se antes de comer. O café das 08h20 é o pré-treino; o shake logo depois do treino é o pós-treino.' };
});
['CT', 'CQ', 'CX', 'CS'].forEach(sid => P.sessions[sid].ex.forEach(x => {
  if (!x.nolog && !Array.isArray(x.sets)) x.sets = P.train.priority_groups.indexOf(x.grp) >= 0 ? [2, 3, 3, 4, 3] : [2, 3, 3, 3, 3];
}));
['CT', 'CQ', 'CX', 'CS'].forEach(sid => { P.sessions[sid].notes = 'Treino em casa até a academia ser liberada (avaliação treino a treino). 10h00, depois do café.'; });
// agenda: tira as datas fixas de academia e põe o treino às 10h
const AG = P.agenda;
const keep = (d, f) => { if (AG[d]) AG[d] = AG[d].filter(f); };
keep('2026-10-04', t => !/ACADEMIA|academia começa/i.test(t));
keep('2026-10-05', t => t.indexOf('19h · Casa 1') !== 0);
keep('2026-10-12', t => t.indexOf('S3: na academia') !== 0);
delete AG['2026-10-13'];
keep('2026-10-15', t => t.indexOf('Calibração de RIR (S3)') !== 0);
AG['2026-10-02'] = ['10h00 · Pernas B em casa: afundo reverso, elevação pélvica unilateral, ponte, panturrilha, abdominal supra e reverso. Metas no registro.'];
AG['2026-10-03'] = ['10h00 · Superior B em casa: flexão + remada serrote, pike com as mãos no sofá, crucifixo no chão, elevação lateral, rosca + tríceps testa.'];
AG['2026-10-05'] = ['Semana 2 continua em casa. A academia entra quando o treino em casa ficar leve: a avaliação é treino a treino, sem data fixa.', '10h00 · Casa 1: metas do registro.'].concat(AG['2026-10-05'] || []);
AG['2026-10-06'] = ['10h00 · Pernas A em casa (metas do registro).'];
AG['2026-10-07'] = ['10h00 · Casa 2 (core e mobilidade). Prancha lateral: 30 s por lado.'];
AG['2026-10-08'] = ['10h00 · Superior A em casa.'];
AG['2026-10-09'] = ['10h00 · Pernas B em casa.'];
AG['2026-10-10'] = ['10h00 · Superior B em casa.'];
Object.keys(AG).forEach(d => { if (!AG[d].length) delete AG[d]; });
P.kickoff.steps = P.kickoff.steps.map(t => t.indexOf('Semana 1 toda em casa') === 0 ? 'Começo em casa (calistenia). A academia entra quando o treino em casa ficar leve: a avaliação é feita treino a treino, sem data fixa.' : t);
P.phases[0].rules = P.phases[0].rules.map(t => t
  .replace('S1: tudo em casa (calistenia). S2: 1ª semana de academia, com as cargas de partida do registro.', 'Começo em casa (calistenia). A academia entra quando o treino em casa ficar leve, com as cargas de partida do registro.')
  .replace('Na S2 (1ª semana de academia), a sessão pode levar até 85 min.', 'Na 1ª semana de academia, a sessão pode levar até 85 min.'));
const cp2b = P.checkpoints.find(c => c.week === 2);
cp2b.criteria = cp2b.criteria.map(t => t.replace('(4 em casa na S1, 4 na academia na S2)', '(em casa ou na academia)'));

h = h.slice(0, s) + JSON.stringify(P, null, 1) + h.slice(e);

// 3) motor
function swap(from, to) {
  const i = h.indexOf(from);
  if (i < 0 || h.indexOf(from, i + 1) >= 0) { miss.push('motor: ' + from.slice(0, 60)); return; }
  h = h.slice(0, i) + to + h.slice(i + from.length);
}
const a = h.indexOf('function prevData(w, sid, ex){'), b = h.indexOf('/* ---------- peso, semáforo, ajustes ---------- */');
if (a < 0 || b < 0) miss.push('motor: prevData()/suggest()');
h = h.slice(0, a) + fs.readFileSync(DIR + '/target_cld.js', 'utf8') + '\n' + h.slice(b);

swap(`var prev = prevData(w, sid, ex), sg = suggest(ex, prev, w), e = (doc.ex && doc.ex[ex.id]) || { sets:[], v:'' }, unit = ex.unit==='s' ? 's' : 'reps';`,
     `var hist = prevHist(w, sid, ex, 3), sub = !!r.sub, tg = target(ex, hist, w, sub), sg = hintFor(ex, hist, tg, w, sub), e = (doc.ex && doc.ex[ex.id]) || { sets:[], v:'' }, unit = ex.unit==='s' ? 's' : 'reps', vdef = ex.lv ? ex.lv[tg.li].n : '';`);
swap(`'</div><div class="ex-meta">'+n+' × '+esc(ex.reps)+(ex.unit==='s'?' s':'')+' · RIR '+esc(rirFor(ex,w))+' · '+esc(ex.rest)+'</div></div>';`,
     `'</div><div class="ex-meta">'+n+(n===1?' série':' séries')+' · sobrar '+esc(rirExact(rirFor(ex,w)))+' · máx. '+tg.hi+(ex.unit==='s'?' s':'')+' · descanso '+esc(ex.rest)+'</div></div>';`);
swap(`if(ex.bw){ var vid = 'in-'+w+'-'+sid+'-'+ex.id+'-v';`,
     `if(ex.lv){ var lid = 'in-'+w+'-'+sid+'-'+ex.id+'-v', lcur = e.v || vdef; h += '<label class="row small" for="'+lid+'"><span class="muted">Nível de hoje:</span><select id="'+lid+'" data-w="'+w+'" data-s="'+sid+'" data-ex="'+ex.id+'" data-f="v">'+ex.lv.map(function(l){ return '<option'+(l.n===lcur?' selected':'')+'>'+esc(l.n)+'</option>'; }).join('')+'</select></label>'; }
    else if(ex.bw){ var vid = 'in-'+w+'-'+sid+'-'+ex.id+'-v';`);
swap(`var v = e.sets[i] || {}, pv = (prev && prev.sets[i]) || {}, base = 'in-'+w+'-'+sid+'-'+ex.id+'-'+i;`,
     `var v = e.sets[i] || {}, base = 'in-'+w+'-'+sid+'-'+ex.id+'-'+i, vd = vdef? ' data-vdef="'+esc(vdef)+'"' : '';`);
swap(`if(!ex.bw) h += '<input type="number" inputmode="decimal" step="0.5" id="'+base+'-kg" aria-label="Série '+(i+1)+': carga em kg" data-w="'+w+'" data-s="'+sid+'" data-ex="'+ex.id+'" data-i="'+i+'" data-f="kg" value="'+esc(v.kg||'')+'" placeholder="'+esc(pv.kg||'kg')+'"><span>kg</span>';`,
     `if(!ex.bw && !ex.lv) h += '<input type="number" inputmode="decimal" step="0.5" id="'+base+'-kg" aria-label="Série '+(i+1)+': carga em kg (meta '+(isFinite(tg.kg)? fx(tg.kg) : '—')+')" data-w="'+w+'" data-s="'+sid+'" data-ex="'+ex.id+'" data-i="'+i+'" data-f="kg" value="'+esc(v.kg||'')+'" placeholder="'+(isFinite(tg.kg)? fx(tg.kg) : 'kg')+'"><span>kg</span>';`);
swap(`aria-label="Série '+(i+1)+': '+unit+'" data-w="'+w+'" data-s="'+sid+'" data-ex="'+ex.id+'" data-i="'+i+'" data-f="reps" value="'+esc(v.reps||'')+'" placeholder="'+esc(pv.reps||unit)+'"><span>'+unit+'</span></div>';`,
     `aria-label="Série '+(i+1)+': '+unit+' (meta '+tg.reps[i]+')" data-w="'+w+'" data-s="'+sid+'" data-ex="'+ex.id+'" data-i="'+i+'" data-f="reps"'+vd+' value="'+esc(v.reps||'')+'" placeholder="'+tg.reps[i]+'"><span>'+unit+'</span></div>';`);
swap(`'</strong> · RIR compostos '+esc(dl?'4':ph.rir.c)+' · isoladores '+esc(dl?'4':ph.rir.i)+(s.loc==='casa'? ' · casa '+esc(dl?'4':(sid==='C1'?ph.rir.h:ph.rir.h1)) : '')+'</div>';`,
     `'</strong> · O número cinza de cada série é a meta mínima. “Sobrar” = reps que ainda sairiam quando você para. Bateu a meta e ainda sobrariam 3 a mais que o “sobrar”? Continue até sobrar esse número, sem passar do “máx.”, e digite o total.</div>';`);
swap(`return '<td'+(j===phaseIdx(w)?' class="cur"':'')+'>'+esc(p.rir[r[0]])+'</td>';`,
     `return '<td'+(j===phaseIdx(w)?' class="cur"':'')+'>'+esc(rirExact(p.rir[r[0]]))+'</td>';`);
swap(`else { var i = +ds.i; while(x.sets.length<=i) x.sets.push({ kg:'', reps:'' }); x.sets[i][ds.f] = t.value; }`,
     `else { var i = +ds.i; while(x.sets.length<=i) x.sets.push({ kg:'', reps:'' }); x.sets[i][ds.f] = t.value; if(ds.vdef && !x.v) x.v = ds.vdef; }`);
swap(`function rirFor(ex, w){ if(isDeload(w)) return '4'; var r = phaseOf(w).rir; return r[ex.t] || r.c; }`,
     `function rirFor(ex, w){ if(isDeload(w)) return '4'; var r = phaseOf(w).rir, o = P.rir_week && P.rir_week[String(clampW(w))]; if(o && o[ex.t]) return o[ex.t]; return r[ex.t] || r.c; }`);
swap(`' · teto de +2,0 cm até 03/01 '`, `' · teto de +'+f1(P.adjust.waist_cap||2)+' cm até 20/12 '`);
swap(`.nolog{background:var(--surface-2);border-radius:8px;padding:8px 10px}`,
     `.nolog{background:var(--surface-2);border-radius:8px;padding:8px 10px}
select{font:inherit;color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:7px;padding:6px 8px;min-width:0;width:100%;max-width:100%;flex:1 1 12em}
.view > *{min-width:0}
.hint .goal{display:block;font-size:1rem;margin-bottom:2px}
.ex .ex-meta{white-space:normal;overflow-wrap:anywhere}`);

W1.engine(swap);
/* casa até a academia: agenda e horários */
swap(`function schedFor(w, dow){ var o = P.week_sched && P.week_sched[String(clampW(w))]; return (o && o[String(dow)]) || P.schedule[String(dow)]; }`,
     `function homeWeek(w){ return !!P.home_sched && clampW(w) < (P.gym_from || 99); }
function schedFor(w, dow){ if(homeWeek(w) && P.home_sched[String(dow)]) return P.home_sched[String(dow)]; var o = P.week_sched && P.week_sched[String(clampW(w))]; return (o && o[String(dow)]) || P.schedule[String(dow)]; }`);
swap(`function dayCfgW(w, dow){ var o = P.week_days && P.week_days[String(clampW(w))]; return (o && o[String(dow)]) || dayCfg(dow); }`,
     `function dayCfgW(w, dow){
  if(homeWeek(w) && P.home_days && P.home_days[String(dow)]){
    var H = P.home_days[String(dow)], hs = P.sessions[schedFor(w, dow)];
    if(H.train && hs && hs.dur && !H.train_end) H = Object.assign({}, H, { train_end: tm(hm(H.train) + hs.dur) });
    return H;
  }
  var o = P.week_days && P.week_days[String(clampW(w))]; return (o && o[String(dow)]) || dayCfg(dow); }`);

/* água com horário */
swap(`function mealLine(m){`,
     `function hm(t){ var a = String(t).split(':'); return (+a[0])*60 + (+a[1]||0); }
function tm(n){ n = Math.round(n/5)*5; return pad(Math.floor(n/60))+':'+pad(n%60); }
function waterSlots(ms, D, s){
  var out = [], T = ms.map(function(m){ return hm(m.time); }).sort(function(a,b){ return a-b; });
  var tr = (D.train && s && s.loc!=='off') ? [hm(D.train), hm(D.train_end || D.train)] : null;
  function inTrain(x){ return !!tr && x >= tr[0]-30 && x <= tr[1]+15; }
  if(!T.length) return out;
  out.push({ t: tm(T[0]-10), ml: 300, why: 'ao acordar' });
  for(var i=0; i<T.length-1; i++){
    var g = T[i+1]-T[i], mid = T[i] + g/2;
    if(inTrain(mid)) continue;
    if(g >= 150) out.push({ t: tm(mid), ml: 500, why: 'entre as refeições' });
    else if(g >= 90) out.push({ t: tm(mid), ml: 300, why: 'entre as refeições' });
  }
  if(tr) out.push({ t: tm(tr[0]), ml: 500, why: 'durante o treino' });
  var last = Math.min(T[T.length-1] + 60, hm('21:30'));
  if(last >= T[T.length-1] + 30) out.push({ t: tm(last), ml: 300, why: 'depois do jantar' });
  return out;
}
function mealLine(m){`);
swap(`  if(D.train && s && s.loc!=='off') rows.push({ t:D.train, train:true });`,
     `  if(D.train && s && s.loc!=='off') rows.push({ t:D.train, train:true });
  var wl = waterSlots(ms, D, s), wml = 0; wl.forEach(function(x){ wml += x.ml; rows.push({ t:x.t, water:x }); });`);
swap(`    if(r.train){`,
     `    if(r.water){ var won = !!(ck.agua && ck.agua[r.water.t]), wcid = 'ag-'+id+'-'+r.water.t.replace(':',''); h += '<div class="meal water"><input type="checkbox" class="check" id="'+wcid+'" data-act="water" data-date="'+id+'" data-t="'+r.water.t+'"'+(won?' checked':'')+'><div><div class="meal-top"><label for="'+wcid+'" class="meal-name"><span class="meal-time">'+r.water.t+'</span>Água: '+r.water.ml+' ml</label><span class="meal-k">'+esc(r.water.why)+'</span></div></div></div>'; return; }
    if(r.train){`);
swap(`  return { html:h, got:got, total:ms.length, kcal:kc };`, `  return { html:h, got:got, total:ms.length, kcal:kc, water:wml };`);
swap(`<div style="margin-top:6px">'+tl.html+'</div>'`,
     `<div style="margin-top:6px">'+tl.html+'</div><p class="small muted" style="margin-top:8px">Água nos horários acima: '+f1(tl.water/1000)+' L. Leite, shake e chá também contam. Nas refeições, só goles.</p>'`);
swap(`  else if(a==='meal'){`,
     `  else if(a==='water'){ var cwa = ensureCk(t.dataset.date); cwa.agua = cwa.agua || {}; cwa.agua[t.dataset.t] = t.checked; Store.put('checks', t.dataset.date, cwa); }
  else if(a==='meal'){`);
swap(`  h += '<div class="sec"><div class="sec-head"><h3>Cardápio da semana '`,
     `  h += '<div class="callout small"><strong>Água:</strong> 300 ml ao acordar, 300–500 ml no meio de cada intervalo entre refeições, 500 ml durante o treino e 300 ml 1 h depois do jantar (até 21h30). Os horários exatos de cada dia aparecem na aba Hoje, junto das refeições, para marcar. Leite, shake e chá também contam.</div>';
  h += '<div class="sec"><div class="sec-head"><h3>Cardápio da semana '`);
swap(`.ex .ex-meta{white-space:normal;overflow-wrap:anywhere}`,
     `.ex .ex-meta{white-space:normal;overflow-wrap:anywhere}
.meal.water{padding-block:7px}
.meal.water .meal-name{font-weight:600;color:var(--accent)}`);

swap(`h += '</div><details class="mini" id="cx-'+sid+'-'+ex.id+'"'`,
     `h += '</div><label class="row small" for="lm-'+w+'-'+sid+'-'+ex.id+'"><input type="checkbox" class="check" id="lm-'+w+'-'+sid+'-'+ex.id+'" data-act="lim" data-w="'+w+'" data-s="'+sid+'" data-ex="'+ex.id+'"'+(vdef? ' data-vdef="'+esc(vdef)+'"' : '')+(e.lim?' checked':'')+'><span>Fui no limite (sobrou 0–1 na última série)</span></label><details class="mini" id="cx-'+sid+'-'+ex.id+'"'`);
swap(`  else if(a==='meal'){`,
     `  else if(a==='lim'){ var dlm = ensureW(+t.dataset.w, t.dataset.s), xlm = dlm.ex[t.dataset.ex] || (dlm.ex[t.dataset.ex] = { sets:[], v:'' }); xlm.lim = t.checked; if(!xlm.v && t.dataset.vdef) xlm.v = t.dataset.vdef; Store.put('workouts', wid(+t.dataset.w, t.dataset.s), dlm); }
  else if(a==='meal'){`);


fs.writeFileSync(DIR + '/projeto_verao_27_cld.html', h);
console.log(miss.length ? 'PENDÊNCIAS:\n' + miss.join('\n') : 'ok, sem pendências', '\nbytes', h.length);
