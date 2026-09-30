// Semana 1 em casa: dados (treinador + nutricionista) e suporte no motor a agenda/horários por semana.
module.exports.data = function (P, fs, DIR, miss) {
  const rd = f => fs.existsSync(DIR + '/' + f) ? JSON.parse(fs.readFileSync(DIR + '/' + f, 'utf8')) : null;
  const wk1 = rd('semana1_cld.json'), food1 = rd('comida_s1_cld.json');
  const DOWMAP = { CT: '2', CQ: '4', CX: '5', CS: '6' };
  const W1 = ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'];
  const GYM_DAYS = ['2026-09-29', '2026-10-01', '2026-10-02', '2026-10-03'];
  function addAg(d, items, replace) {
    if (!items || !items.length) return;
    if (replace || !P.agenda[d]) P.agenda[d] = [];
    items.forEach(t => { if (P.agenda[d].indexOf(t) < 0) P.agenda[d].push(t); });
  }
  if (!wk1) { miss.push('semana1_cld.json ausente'); return; }
  P.week_sched = { '1': {} };
  Object.keys(DOWMAP).forEach(sid => {
    const s = wk1.sessions[sid];
    if (!s) { miss.push('sessão ' + sid + ' ausente'); return; }
    s.loc = 'casa'; s.main = true;
    if (wk1.durations && wk1.durations[sid]) s.dur = wk1.durations[sid];
    s.ex.forEach(x => { x.t = x.t || 'h'; if (!x.start) miss.push('sem meta inicial: ' + x.id); });
    P.sessions[sid] = s;
    P.week_sched['1'][DOWMAP[sid]] = sid;
  });
  GYM_DAYS.forEach(d => { P.agenda[d] = []; });
  // ---- correções do treinador no programa
  const IA = P.sessions.IA, IB = P.sessions.IB, SB = P.sessions.SB;
  const ib7 = IB.ex.find(x => x.id === 'ib7');
  if (ib7) {
    IB.ex = IB.ex.filter(x => x.id !== 'ib7');
    const k = IA.ex.findIndex(x => x.id === 'ia6');
    IA.ex.splice(k + 1, 0, ib7);
    IA.dur = 66; IB.dur = 50;
    IA.focus = 'Quadríceps, posteriores, panturrilha, ombro posterior e lateral, e abdômen';
  } else miss.push('ib7 não encontrado');
  const sb5 = SB.ex.find(x => x.id === 'sb5'); sb5.sets = [2, 3, 4, 4, 3];
  const ordSB = ['sb1', 'sb2', 'sb8', 'sb3', 'sb4', 'sb5', 'sb6', 'sb7'];
  SB.ex = ordSB.map(id => SB.ex.find(x => x.id === id)).filter(Boolean);
  if (SB.ex.length !== 8) miss.push('ordem SB');
  P.rir_week = { '3': { c: '3–4', i: '3–4' } };
  P.phases[1].rules.push('S3: na academia, pare com 4 no tanque em todos os exercícios (só houve 1 semana de adaptação lá). O RIR da fase vale a partir da S4 (19/10).');
  P.train.progression.increments += ' Se a carga da meta não existir na sua academia (halter ímpar, placa de 2,5 kg), use a menor carga que existir acima dela e faça o fundo da faixa em todas as séries.';
  addAg('2026-10-12', ['S3: na academia, pare com 4 no tanque em tudo (o RIR da Acumulação I começa na S4).'], false);

  Object.keys(wk1.agenda || {}).forEach(d => addAg(d, wk1.agenda[d], false));
  const a28 = P.agenda['2026-09-28'];
  a28.forEach((t, i) => { if (t.indexOf('Amanhã: Inferior A cedo') >= 0) a28[i] = 'Antes de dormir: deixe a roupa separada. Amanhã, 6h30: treino em casa (aba Hoje).'; });
  addAg('2026-10-04', ['Confira na aba Treino → Equipamentos o que a sua academia tem: a academia começa na terça, 06/10.'], false);
  // textos que falavam de academia na semana 1
  P.kickoff.steps = P.kickoff.steps.map(t => t.indexOf('Na semana 1, cada treino de academia') === 0
    ? 'Semana 1 toda em casa (calistenia), para pegar confiança. A academia começa na semana 2 (terça, 06/10); a 1ª vez de cada exercício lá pode levar até 85 min.' : t);
  P.phases[0].rules = P.phases[0].rules.map(t => t.replace('Na S1, a sessão pode levar até 85 min.', 'Na S2 (1ª semana de academia), a sessão pode levar até 85 min.'));
  P.phases[0].rules.unshift('S1: tudo em casa (calistenia). S2: 1ª semana de academia, com as cargas de partida do registro.');
  const cp2 = P.checkpoints.find(c => c.week === 2);
  cp2.criteria = cp2.criteria.map(t => t.replace('Pelo menos 7 de 8 treinos de academia feitos', 'Pelo menos 7 de 8 treinos principais feitos (4 em casa na S1, 4 na academia na S2)'));
  if (food1) {
    P.week_days = { '1': food1.days };
    Object.keys(DOWMAP).forEach(sid => {
      const D = food1.days[DOWMAP[sid]], s = P.sessions[sid];
      if (!D || !s) return;
      const [hh, mm] = D.train.split(':').map(Number), end = hh * 60 + mm + s.dur;
      D.train_end = String(Math.floor(end / 60)).padStart(2, '0') + ':' + String(end % 60).padStart(2, '0');
    });
    Object.keys(food1.agenda || {}).forEach(d => addAg(d, food1.agenda[d], false));
    // ---- correções do nutricionista (valem para todas as semanas)
    (food1.meal_changes || []).forEach(mc => { const m = P.meals.find(x => x.id === mc.meal); if (m && mc.items) m.items = mc.items; });
    const cafe = P.meals.find(x => x.id === 'cafe');
    if (cafe.notes.indexOf('e o outro até 8h30') < 0) miss.push('nota do café');
    cafe.notes = cafe.notes.replace('e o outro até 8h30', 'e o outro em até 1 h');
    const pao = 'o pão com mel do lanche (1 pão até a S2; 2 a partir da S3)';
    ['1', '3'].forEach(k => { P.days[k].note = P.days[k].note.replace('os 2 pães com mel', pao); });
    ['2', '4'].forEach(k => { P.days[k].note = P.days[k].note.replace('os 2 pães com mel (ou só 1, se não descer)', 'o pão com 20 g de mel (1 pão até a S2; 2 a partir da S3)'); });
    P.pre.options[0] = P.pre.options[0].replace('os 2 pães com 20 g de mel ao acordar, 30–40 min antes (se não descer, 1 pão)', 'pão com 20 g de mel ao acordar, 30 min antes (1 pão até a S2; 2 a partir da S3)');
    P.mealprep.forEach(mp => { mp.tasks = mp.tasks.map(t => t.replace('com os 2 pães com mel', 'com ' + pao)); });
    P.shopping.setup = P.shopping.setup.map(x => x[0].indexOf('Garrafa térmica') === 0 ? ['Garrafa térmica inox de 750 ml (shake de seg e qua)', x[1], x[2]] : x);
    P.shopping.first = P.shopping.first.map(x => x[0].indexOf('Pão francês') === 0 ? ['Pão francês 25 un (~1,25 kg): 3 para terça + 22 até quarta', 22.38]
      : x[0].indexOf('Banana') === 0 ? ['Banana 6 un (~900 g): a semana 1 não tem ceia', 5.84] : x);
    const chk = [P.days['1'].note, P.days['2'].note, P.days['3'].note, P.days['4'].note, P.pre.options[0]].join(' ');
    if (chk.indexOf('2 pães com mel') >= 0) miss.push('texto 2 pães com mel ficou');

  } else miss.push('comida_s1_cld.json ausente');


  // ---- tríceps: 1º nível estável (testa no chão), porque no unilateral sentado o tronco entorta
  const TRI0 = { n: 'Testa no chão, 5 kg com as 2 mãos', r: '12-20' };
  let triN = 0;
  Object.keys(P.sessions).forEach(sid => (P.sessions[sid].ex || []).forEach(x => {
    if (x.key !== 'triceps_frances_casa' || !x.lv) return;
    if (x.lv[0].n !== TRI0.n) x.lv.unshift(Object.assign({}, TRI0));
    x.start = { lv: 0, reps: 12 };
    x.name = 'Tríceps com halter de 5 kg (no seu nível)';
    x.cues = ['Nível 1: deitado no chão, joelhos dobrados, halter de 5 kg seguro com as 2 mãos acima do peito',
              'Desça o halter atrás da cabeça dobrando só os cotovelos, que apontam para o teto; estenda até esticar e desça em 2–3 s',
              'Unilateral (nível 2 em diante): sentado com as costas apoiadas; se o tronco entortar, volte ao nível anterior'];
    x.notes = 'Deitado, o chão segura o corpo e não tem como entortar. Com 20 reps nas 2 séries, passe para o unilateral sentado.';
    triN++;
  }));
  if (triN !== 3) miss.push('tríceps: ' + triN + ' exercícios ajustados (esperado 3)');
  // ---- agenda de 28/09 (reescrita) e acertos entre treinador e nutricionista
  P.agenda['2026-09-28'] = [
    'Dia 1. Almoço e jantar: comida de casa montada pelo prato-modelo (aba Alimentação).',
    'Agora ou amanhã cedo: fotos (frente, lado, costas, com o celular apoiado e o timer) e medir de novo peito e ombros dando a volta completa.',
    wk1.agenda['2026-09-28'][0],
    'Não começou a Casa 1 até 21h10? Hoje não treina: jante e durma. O treino de amanhã às 6h30 vale mais.',
  ].concat(food1 ? food1.agenda['2026-09-28'] : []).concat([wk1.agenda['2026-09-28'][1]]);
  P.agenda['2026-09-29'] = (P.agenda['2026-09-29'] || []).filter(t => t.indexOf('1 banana 20 min antes') < 0);
  P.agenda['2026-10-06'] = (P.agenda['2026-10-06'] || []).map(t => t.replace('Ainda é Adaptação: 2 séries, sobrando 3–4.', 'Ainda é Adaptação: 2 séries, sobrando 4. No fim, elevação lateral na polia 2,5 kg × 15 (ela saiu da sexta).'));
  P.agenda['2026-10-09'] = (P.agenda['2026-10-09'] || []).map(t => t.replace(', elevação lateral na polia 2,5 kg × 15', ''));
  W1.forEach(d => { if (P.agenda[d] && !P.agenda[d].length) delete P.agenda[d]; });
};

module.exports.engine = function (swap) {
  swap(`function dayCfg(dow){ return P.days[String(dow)] || P.days['1']; }`,
       `function dayCfg(dow){ return P.days[String(dow)] || P.days['1']; }
function dayCfgW(w, dow){ var o = P.week_days && P.week_days[String(clampW(w))]; return (o && o[String(dow)]) || dayCfg(dow); }
function schedFor(w, dow){ var o = P.week_sched && P.week_sched[String(clampW(w))]; return (o && o[String(dow)]) || P.schedule[String(dow)]; }
function orderFor(w){ var out = []; [1,2,3,4,5,6,0].forEach(function(d){ var s = schedFor(w, d); if(P.sessions[s] && P.sessions[s].loc!=='off' && out.indexOf(s)<0) out.push(s); }); return out; }
function isMain(s){ return !!s && (!!s.main || s.loc==='academia'); }
function mainLabel(w){ return orderFor(w).some(function(s){ return P.sessions[s].loc==='academia'; }) ? 'academia' : 'treinos'; }`);
  swap(`var k = kind || weekKind(w), D = dayCfg(dow), out = [];`, `var k = kind || weekKind(w), D = dayCfgW(w, dow), out = [];`);
  swap(`P.order.forEach(function(sid){ P.sessions[sid].ex.forEach(function(ex){ (KEYMAP[ex.key] = KEYMAP[ex.key] || []).push({ sid:sid, id:ex.id }); }); });`,
       `Object.keys(P.sessions).forEach(function(sid){ (P.sessions[sid].ex || []).forEach(function(ex){ (KEYMAP[ex.key] = KEYMAP[ex.key] || []).push({ sid:sid, id:ex.id }); }); });`);
  swap(`function sessionDow(sid){ for(var d=0; d<7; d++){ if(P.schedule[d]===sid) return d; } return 1; }`,
       `function sessionDow(sid){ var d, k; for(d=0; d<7; d++){ if(P.schedule[d]===sid) return d; } var ws = P.week_sched || {}; for(k in ws){ for(d=0; d<7; d++){ if(ws[k][d]===sid) return d; } } return 1; }`);
  swap(`var sid = P.schedule[d.getDay()], s = P.sessions[sid], D = dayCfg(d.getDay());
    if(s && s.loc==='academia'){`,
       `var sid = schedFor(k, d.getDay()), s = P.sessions[sid], D = dayCfgW(k, d.getDay());
    if(isMain(s)){`);
  swap(`P.order.forEach(function(sid){ if(P.sessions[sid].loc!=='academia') return; var wd = Store.get('workouts', wid(k,sid)); if(wd && wd.done) gymDone++; });`,
       `orderFor(k).forEach(function(sid){ if(!isMain(P.sessions[sid])) return; var wd = Store.get('workouts', wid(k,sid)); if(wd && wd.done) gymDone++; });`);
  swap(`ph = phaseOf(w), D = dayCfg(sessionDow(sid)), dl = isDeload(w);`, `ph = phaseOf(w), D = dayCfgW(w, sessionDow(sid)), dl = isDeload(w);`);
  swap(`D = dayCfg(d.getDay()), sid = P.schedule[d.getDay()], s = P.sessions[sid];`, `D = dayCfgW(w, d.getDay()), sid = schedFor(w, d.getDay()), s = P.sessions[sid];`);
  swap(`var sid = P.schedule[d.getDay()], ses = P.sessions[sid], D = dayCfg(d.getDay());`, `var sid = schedFor(wc, d.getDay()), ses = P.sessions[sid], D = dayCfgW(wc, d.getDay());`);
  swap(`'/'+tr.planned+' refeições · '+tr.gymDone+'/4 academia</span></div>';`, `'/'+tr.planned+' refeições · '+tr.gymDone+'/4 '+mainLabel(wc)+'</span></div>';`);
  swap(`'+tr.gymDone+' de 4 academias. Verde`, `'+tr.gymDone+' de 4 '+(mainLabel(wc)==='academia' ? 'academias' : 'treinos principais')+'. Verde`);
  swap(`var s = P.sessions[P.schedule[dow]], D = dayCfg(dow); h += '<div class="dcell`, `var s = P.sessions[schedFor(w, dow)], D = dayCfgW(w, dow); h += '<div class="dcell`);
  swap(`  var dl = isDeload(state.tw);\n`, `  var ordW = orderFor(state.tw); if(ordW.indexOf(state.ts)<0){ var sdw = schedFor(state.tw, sessionDow(state.ts)); state.ts = ordW.indexOf(sdw)>=0 ? sdw : ordW[0]; }\n  var dl = isDeload(state.tw);\n`);
  swap(`'<div class="seg" role="group" aria-label="Sessão">'+P.order.map(function(sid){`, `'<div class="seg" role="group" aria-label="Sessão">'+orderFor(state.tw).map(function(sid){`);
  swap(`var D = dayCfg(dow), s = P.sessions[P.schedule[dow]]; var cell`, `var D = dayCfgW(cw, dow), s = P.sessions[schedFor(cw, dow)]; var cell`);
  swap(`state.ts = (function(){ var s=P.schedule[today().getDay()]; return (P.sessions[s] && P.sessions[s].loc!=='off')? s : P.order[0]; })();`,
       `state.ts = (function(){ var tw = clampW(weekOf(today())), s = schedFor(tw, today().getDay()); return (P.sessions[s] && P.sessions[s].loc!=='off')? s : orderFor(tw)[0]; })();`);
};
