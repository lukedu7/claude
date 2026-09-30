// Gera coach_cld.json e semana1_cld.json a partir das mesmas escadas (nomes "n" idênticos).
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(DIR, 'treino_dados.json'), 'utf8'));

// ---------- ESCADAS (compartilhadas entre os dois arquivos) ----------
const LV = {
  flexao: [
    { n: 'Mãos na mesa', r: '6-15' },
    { n: 'Mãos no assento do sofá encostado na parede', r: '6-15' },
    { n: 'No chão', r: '6-15' },
    { n: 'No chão, pausa 2 s embaixo', r: '6-15' },
    { n: 'Pés elevados na cadeira', r: '6-15' },
    { n: 'Pés na cadeira, descida 3 s + pausa 2 s embaixo', r: '6-15' },
    { n: 'Pés na cadeira + mochila 8 kg nas costas', r: '6-15' },
    { n: 'Pés na cadeira + mochila 12 kg nas costas', r: '6-15' },
  ],
  remada_casa: [
    { n: 'Serrote 5 kg, descida 3 s + pausa 1 s no topo', r: '12-20' },
    { n: 'Invertida na mesa, joelhos dobrados', r: '6-15' },
    { n: 'Invertida na mesa, pernas estendidas', r: '6-15' },
    { n: 'Invertida na mesa, pés na cadeira', r: '6-15' },
    { n: 'Invertida na mesa, pés na cadeira, pausa 2 s no topo', r: '6-15' },
  ],
  pike: [
    { n: 'Mãos no sofá, pés no chão', r: '6-12' },
    { n: 'No chão (V invertido)', r: '6-12' },
    { n: 'No chão, descida 3 s', r: '6-12' },
    { n: 'Pés na cadeira', r: '6-12' },
    { n: 'Pés na cadeira, pausa 2 s embaixo', r: '6-12' },
  ],
  elev_lat_casa: [
    { n: '3 kg', r: '15-20' },
    { n: '3 kg, descida 3 s + pausa 1 s no topo', r: '15-20' },
    { n: '5 kg', r: '8-15' },
    { n: '5 kg, descida 3 s', r: '8-15' },
    { n: '5 kg, descida 3 s + pausa 1 s no topo', r: '8-15' },
    { n: '5 kg unilateral, inclinado segurando na parede, descida 3 s', r: '8-15' },
  ],
  rosca_alt: [
    { n: '5 kg', r: '10-15' },
    { n: '5 kg, descida 3 s + pausa 1 s embaixo', r: '10-15' },
    { n: 'Concentrada sentado 5 kg, pausa 2 s no topo', r: '10-15' },
    { n: 'Concentrada sentado 5 kg, pausa 2 s no topo + descida 3 s', r: '10-15' },
  ],
  triceps_frances_casa: [
    { n: '5 kg unilateral', r: '10-15' },
    { n: '5 kg unilateral, descida 4 s', r: '10-15' },
    { n: 'Flexão diamante, mãos no sofá', r: '6-15' },
    { n: 'Flexão diamante no chão', r: '6-15' },
  ],
  abd_supra_casa: [
    { n: 'Sem peso, pausa 2 s no topo', r: '10-20' },
    { n: 'Halter 5 kg no peito', r: '10-20' },
    { n: 'Mochila 8 kg no peito', r: '10-20' },
    { n: 'Mochila 12 kg no peito', r: '10-20' },
  ],
  abd_reverso: [
    { n: 'Dead bug (reps por lado)', r: '8-12' },
    { n: 'Joelhos a 90°', r: '10-15' },
    { n: 'Pernas quase estendidas', r: '10-15' },
    { n: 'Pernas quase estendidas, descida 4 s + pausa no topo', r: '10-15' },
  ],
  prancha_lateral: [
    { n: 'Joelhos apoiados', r: '20-40' },
    { n: 'Pés empilhados', r: '20-40' },
    { n: 'Pé de cima elevado', r: '20-40' },
  ],
  // novas (semana 1 em casa)
  bulgaro: [
    { n: 'Afundo com a mão na parede', r: '8-15' },
    { n: 'Afundo sem apoio', r: '8-15' },
    { n: 'Búlgaro, pé de trás na cadeira', r: '8-15' },
    { n: 'Búlgaro com halteres de 5 kg', r: '8-15' },
    { n: 'Búlgaro com halteres de 5 kg, descida 3 s', r: '8-15' },
    { n: 'Búlgaro com halteres de 5 kg + mochila 8 kg nas costas', r: '8-15' },
  ],
  stiff_unilat_casa: [
    { n: 'Sem peso, mão na parede', r: '10-15' },
    { n: 'Halter 5 kg, mão na parede', r: '10-15' },
    { n: 'Halter 5 kg, mão na parede, descida 3 s', r: '10-15' },
    { n: 'Mochila 8 kg, mão na parede, descida 3 s', r: '10-15' },
    { n: 'Mochila 12 kg, mão na parede, descida 3 s', r: '10-15' },
  ],
  agach_calc_casa: [
    { n: 'Sem peso, descida 3 s', r: '12-20' },
    { n: 'Halteres 5 kg, descida 3 s', r: '12-20' },
    { n: 'Halteres 5 kg, descida 3 s + pausa 2 s embaixo', r: '12-20' },
    { n: 'Halteres 5 kg + mochila 8 kg nas costas, descida 3 s', r: '12-20' },
    { n: 'Halteres 5 kg + mochila 12 kg nas costas, descida 3 s', r: '12-20' },
  ],
  ponte_isquios_casa: [
    { n: 'Bilateral, pés na cadeira, pausa 2 s no topo', r: '8-15' },
    { n: 'Unilateral, pé na cadeira', r: '8-15' },
    { n: 'Unilateral, pé na cadeira, pausa 2 s no topo', r: '8-15' },
    { n: 'Unilateral, pé na cadeira, descida 3 s + pausa 2 s no topo', r: '8-15' },
  ],
  panturrilha_casa: [
    { n: 'Bilateral, ponta dos pés no livro, mão na parede', r: '10-20' },
    { n: 'Unilateral, ponta do pé no livro, mão na parede', r: '10-20' },
    { n: 'Unilateral + halter 5 kg na mão livre', r: '10-20' },
    { n: 'Unilateral + halter 5 kg, pausa 2 s embaixo', r: '10-20' },
    { n: 'Unilateral + mochila 8 kg nas costas + halter 5 kg, pausa 2 s embaixo', r: '10-20' },
  ],
  crucifixo_inv_casa: [
    { n: '3 kg', r: '12-20' },
    { n: '3 kg, descida 3 s + pausa 1 s no topo', r: '12-20' },
    { n: '5 kg', r: '8-15' },
    { n: '5 kg, descida 3 s + pausa 1 s no topo', r: '8-15' },
  ],
  afundo_reverso_casa: [
    { n: 'Sem peso', r: '8-15' },
    { n: 'Halteres 5 kg', r: '8-15' },
    { n: 'Halteres 5 kg, descida 3 s', r: '8-15' },
    { n: 'Halteres 5 kg + mochila 8 kg nas costas', r: '8-15' },
    { n: 'Halteres 5 kg + mochila 12 kg nas costas, descida 3 s', r: '8-15' },
  ],
  hip_thrust_unilat_casa: [
    { n: 'Bilateral, costas no sofá, pausa 2 s no topo', r: '12-20' },
    { n: 'Unilateral, costas no sofá', r: '8-15' },
    { n: 'Unilateral, pausa 2 s no topo', r: '8-15' },
    { n: 'Unilateral + halter 5 kg no quadril, pausa 2 s no topo', r: '8-15' },
    { n: 'Unilateral + mochila 8 kg no quadril, pausa 2 s no topo', r: '8-15' },
  ],
  remada_mochila: [
    { n: 'Mochila 8 kg, descida 3 s', r: '10-15' },
    { n: 'Mochila 8 kg, descida 3 s + pausa 1 s no topo', r: '10-15' },
    { n: 'Mochila 12 kg, descida 3 s', r: '10-15' },
    { n: 'Mochila 12 kg, descida 3 s + pausa 1 s no topo', r: '10-15' },
  ],
  crucifixo_chao: [
    { n: '5 kg, descida 3 s', r: '12-20' },
    { n: '5 kg, descida 3 s + pausa 2 s embaixo', r: '12-20' },
    { n: '5 kg, 1 e ½ (desce, sobe metade, desce, sobe tudo)', r: '10-15' },
  ],
};

// ---------- TAREFA 1: metas iniciais ----------
const E = {};
const home = (key, kg, lv_start, reps, adj, alt_kg, rest) => ({ kg, reps, adj, alt_kg, lv: LV[key], lv_start, rest });
const gym = (kg, reps, adj, alt_kg, rest) => ({ kg, reps, adj, alt_kg, lv: null, lv_start: null, rest });
const easy = (s) => `Se a série 1 saiu fácil (sobrariam 6+ reps)${s}`;

// C1 (valores já passados ao aluno — mantidos)
E.c1a = home('flexao', null, 2, 8, 'Se a série 1 não fechou 8 reps com o corpo reto, faça a série 2 com as mãos no assento do sofá × 10.', 5, '0 s: vá direto para a remada; 90 s depois do par');
E.c1b = home('remada_casa', 5, 0, 15, 'Se a série 1 saiu fácil (sobrariam 6+ reps por braço), faça a série 2 com 18 reps por braço, mesmo ritmo.', 8, '90 s depois do par (flexão → remada)');
E.c1c = home('pike', null, 1, 6, 'Se a série 1 não fechou 6 reps com a cabeça descendo até 5 cm do chão, faça a série 2 com as mãos no sofá × 8.', 5, '90 s');
E.c1d = home('elev_lat_casa', 3, 0, 15, easy(', faça a série 2 com 3 kg × 18.'), 3, '60 s');
E.c1e = home('rosca_alt', 5, 0, 12, 'Se a série 1 saiu fácil (sobrariam 6+ reps por braço), faça a série 2 com 15 reps por braço.', 5, '0 s: vá direto para o tríceps; 60 s depois do par');
E.c1f = home('triceps_frances_casa', 5, 0, 12, 'Se a série 1 saiu fácil (sobrariam 6+ reps por braço), faça a série 2 com 15 reps por braço.', null, '60 s depois do par (rosca → tríceps)');

// IA
const PANT = gym(30, 12, easy(' com 1 s de pausa embaixo, faça a série 2 com 40 kg × 12.'), 20, '75 s');
const PECK = gym(15, 15, easy(', faça a série 2 com 20 kg × 15.'), 2.5, '75 s');
const ABDP = gym(20, 12, easy(', faça a série 2 com 25 kg × 12.'), 20, '60 s');
const ELEV = gym(4, 15, easy(' sem balançar o tronco, faça a série 2 com 5 kg por halter × 12.'), 10, '60 s');
E.ia1 = gym(0, 10, 'Carga = anilhas somadas, sem o carrinho (0 = só o carrinho). ' + easy(' com a coxa chegando à paralela, faça a série 2 com 10 kg (5 de cada lado) × 10.'), 0, '2 min 30 s');
E.ia2 = gym(10, 10, easy(' sem a lombar arredondar, faça a série 2 com 14 kg por halter × 10.'), 20, '2 min');
E.ia3 = gym(20, 12, easy(', faça a série 2 com 25 kg × 12.'), 10, '90 s');
E.ia4 = gym(15, 12, easy(' sem o quadril subir, faça a série 2 com 20 kg × 12.'), 20, '90 s');
E.ia5 = { ...PANT };
E.ia6 = { ...PECK };
E.ia7 = { ...ABDP };

// C2
E.c2e = home('abd_supra_casa', 5, 1, 12, easy(', faça a série 2 com o halter de 5 kg × 15.'), null, '60 s');
E.c2b = home('abd_reverso', null, 1, 10, easy(', faça a série 2 × 13.'), null, '60 s');
E.c2c = home('prancha_lateral', null, 1, 25, null, null, '30 s entre os lados');

// SA
E.sa1 = gym(10, 10, easy(', faça a série 2 com 12 kg por halter × 10.'), 20, '2 min 30 s');
E.sa2 = gym(25, 10, easy(' sem jogar o tronco para trás, faça a série 2 com 30 kg × 10.'), 20, '2 min');
E.sa3 = gym(20, 10, easy(', faça a série 2 com 25 kg × 10.'), 10, '2 min');
E.sa4 = gym(25, 10, easy(' com a lombar neutra, faça a série 2 com 30 kg × 10.'), 20, '2 min');
E.sa5 = { ...ELEV };
E.sa6 = gym(12, 10, 'Carga = total (barra + anilhas). ' + easy(' sem balançar, faça a série 2 com 14 kg no total × 10.'), 15, '60 s depois do par (rosca → tríceps)');
E.sa7 = gym(15, 12, easy(' com os cotovelos colados no corpo, faça a série 2 com 17,5 kg × 12.'), 15, '60 s depois do par (rosca → tríceps)');

// IB
E.ib1 = gym(20, 12, 'Carga = anilhas somadas, sem o carrinho. ' + easy(' descendo até os joelhos perto do peito sem o quadril sair do encosto, faça a série 2 com 40 kg (20 de cada lado) × 12.'), 40, '2 min 30 s');
E.ib2 = gym(20, 12, easy(', faça a série 2 com 25 kg × 12.'), 15, '90 s');
E.ib3 = gym(20, 10, 'Carga = anilhas somadas, sem a barra. ' + easy(' sem sentir a lombar, faça a série 2 com 30 kg × 10.'), 20, '2 min');
E.ib7 = gym(2.5, 15, 'Se a série 1 do lado mais fraco saiu fácil (sobrariam 6+ reps), faça a série 2 com 5 kg × 12 nos 2 lados.', 10, '60 s depois dos 2 lados');
E.ib4 = { ...PANT };
E.ib5 = { ...PECK };
E.ib6 = { ...ABDP };

// SB
E.sb1 = gym(10, 8, 'Carga = anilhas somadas, sem a barra. ' + easy(', faça a série 2 com 14 kg (7 de cada lado) × 8.'), 20, '2 min 30 s');
E.sb8 = gym(8, 10, easy(' sem arquear a lombar, faça a série 2 com 10 kg por halter × 10.'), 15, '2 min');
E.sb2 = gym(25, 10, easy(', faça a série 2 com 30 kg × 10.'), 10, '2 min');
E.sb3 = gym(20, 10, easy(' com o peito colado no apoio, faça a série 2 com 25 kg × 10.'), 10, '2 min');
E.sb4 = gym(5, 12, easy(', faça a série 2 com 7,5 kg por lado × 12.'), 20, '90 s');
E.sb5 = { ...ELEV };
E.sb6 = gym(5, 12, easy(' sem tirar as costas do banco, faça a série 2 com 6 kg por halter × 12.'), 5, '60 s depois do par (rosca → tríceps)');
E.sb7 = gym(10, 12, easy(', faça a série 2 com 12,5 kg × 12.'), 8, '60 s depois do par (rosca → tríceps)');

// checagem: todo exercício nolog=false tem entrada; keys repetidas com o mesmo valor
const allEx = Object.values(data.sessions).flatMap((s) => s.ex);
const need = allEx.filter((e) => !e.nolog).map((e) => e.id);
const missing = need.filter((id) => !E[id]);
const extra = Object.keys(E).filter((id) => !need.includes(id));
if (missing.length || extra.length) throw new Error('ids: faltando ' + missing + ' / sobrando ' + extra);
const byKey = {};
for (const e of allEx.filter((e) => !e.nolog)) {
  const v = JSON.stringify({ kg: E[e.id].kg, reps: E[e.id].reps, lv_start: E[e.id].lv_start, rest: E[e.id].rest });
  if (byKey[e.key] && byKey[e.key] !== v) throw new Error('key com valores diferentes: ' + e.key);
  byKey[e.key] = v;
}
// reps inicial dentro da faixa (do nível, se houver escada)
for (const e of allEx.filter((e) => !e.nolog)) {
  const x = E[e.id];
  const rr = x.lv ? x.lv[x.lv_start].r : e.reps;
  const [lo, hi] = rr.split('-').map(Number);
  if (x.reps < lo || x.reps > hi) throw new Error('reps fora da faixa: ' + e.id);
}

const coach = {
  ex: E,
  rule_changes: [
    'Faixa: em exercício com escada (lv), "fundo" e "topo" são os do NÍVEL atual (lv[nível].r), não os de "reps" do exercício. Ex.: a remada de casa no nível 0 usa 12–20; o 15/15 de segunda NÃO sobe de nível (com a faixa 6–15 do exercício, subiria errado).',
    '(b) Carga de trabalho W = maior kg (em escada: maior nível) da última sessão em que pelo menos 1 série fez ≥ fundo − 2 reps. Se nenhuma série chegou a fundo − 2: W = menor kg usado − 1 incremento (em escada: nível − 1) e meta = fundo em todas as séries. Motivo: "maior kg" puro prende o aluno numa carga que ele testou e não aguentou.',
    '(b) Só sobe se TODAS as séries da última vez foram feitas em W e bateram o topo. Aí: W + incremento (em escada: próximo nível), todas as séries = fundo (em escada: fundo da faixa do NOVO nível).',
    '(c) Série feita em W: meta = máx(reps da última vez nessa série + 1; fundo), limitada ao topo. Série feita abaixo de W (regra da escada ou ajuste da série 2): meta = menor nº de reps feito em W na última vez, limitado entre fundo e topo (no lugar de "fundo"). Séries novas = meta da última série. Em segundos: +5 s no lugar de +1 rep.',
    'Nova — meta é piso: se ao completar a meta ainda sobrariam 3 reps a mais que o RIR máximo da fase (ex.: Adaptação 3–4 → sobrariam 7+), continue até ficar nesse RIR, no máximo até o topo, e anote o total real. Motivo: cada exercício de academia aparece 1×/semana; +1 rep por semana é lento para iniciante e o chute inicial é conservador de propósito.',
    '(d) Semana leve: séries = metade arredondada para cima (mínimo 1), mesma carga/nível, reps = fundo. A semana leve NÃO vira referência: a meta seguinte sai da última sessão ANTES dela (senão ele volta com metas no fundo da faixa e perde semanas).',
    'Nova (e) — estagnação: se nas 3 últimas sessões do exercício (sem contar semana leve) W foi a mesma e a média de reps por série em W não subiu em nenhuma das 2 últimas, a próxima = W − 1 incremento (em escada: nível − 1), todas as séries = topo − 2; depois volta à regra normal.',
    'Carga sugerida que não existe na academia (halter ímpar, placa de 2,5 kg): use a menor carga existente acima dela e meta = fundo em todas as séries.',
    'Incrementos: 2 kg por halter está certo para supino inclinado, stiff e desenvolvimento (halteres ≥ 10 kg vão de 2 em 2). Mantenha 1 kg em elevação lateral (sa5/sb5) e rosca inclinada (sb6): halteres até 10 kg costumam ir de 1 em 1, e 2 kg ali é +33–50% (4→6 kg). Máquinas 5, polias 2,5, leg press 10, Smith e barra W 2 no total: ok. Em casa (c1d, c1e, c1f, c2e) incremento_kg = 0: não existe halter de 4 ou 6 kg; progride só pela escada lv (a troca 3→5 kg da elevação lateral é um nível, com faixa 8–15).',
  ],
  inc_changes: { c1d: 0, c1e: 0, c1f: 0, c2e: 0 },
  flags: [
    'Ombro lateral em 3 dias seguidos (qui SA → sex IB → sáb SB): no bloco final são 4 + 4 + 5 = 13 séries em 72 h a RIR 0–1, e sb5 herda a meta de sa5 (mesma key) chegando ao sábado já cansado, então as metas de quinta e sábado ficam oscilando. Correção: mova a elevação lateral na polia (ib7) de IB (sex) para IA (ter), logo depois do crucifixo inverso no peck deck, e mude sb5 series_por_fase para [2,3,4,4,3].',
    'SB: Smith inclinado seguido do desenvolvimento (dois empurrões pesados em sequência, mesmo deltoide anterior e tríceps, sem ajudante); o desenvolvimento, que é prioridade de ombro, sempre sai cansado. Correção: ordem de SB = Smith inclinado → puxada neutra → desenvolvimento → remada com apoio no peito → crossover → elevação lateral → bi-set rosca/tríceps.',
    'Com a semana 1 toda em casa, a academia começa na S2 (06/10) com só 1 semana de adaptação: o teste de carga e a repetição da carga viram uma sessão só. Correção: na S3 (12–18/10) use as séries da Acumulação I, mas com RIR 3–4 em todos os exercícios de academia; o RIR da Acumulação I passa a valer na S4 (19/10).',
  ],
  today_changes: [],
};
fs.writeFileSync(path.join(DIR, 'coach_cld.json'), JSON.stringify(coach, null, 1));

// ---------- SEMANA 1 EM CASA ----------
const lvCheck = (key, start) => {
  if (!LV[key]) throw new Error('sem escada: ' + key);
  const [lo, hi] = LV[key][start.lv].r.split('-').map(Number);
  if (start.reps < lo || start.reps > hi) throw new Error('start fora da faixa: ' + key);
};
const X = (o) => {
  lvCheck(o.key, o.start);
  const out = {
    id: o.id, key: o.key, name: o.name, eq: o.eq, muscles: o.muscles, sets: 2,
    reps: LV[o.key][o.start.lv].r,
  };
  if (o.unit) out.unit = o.unit;
  Object.assign(out, { rest: o.rest, t: 'h', bw: o.bw, lv: LV[o.key], start: o.start, cues: o.cues, alts: o.alts, notes: o.notes, grp: o.grp });
  if (out.cues.length !== 3) throw new Error('cues != 3: ' + o.id);
  return out;
};

// blocos reutilizados (mesma key → mesmo início que no coach_cld)
const S = (key) => { const id = Object.keys(E).find((k) => E[k].lv === LV[key]); return { lv: E[id].lv_start, reps: E[id].reps }; };

const FLEX = (id, rest) => X({ id, key: 'flexao', name: 'Flexão de braço (no seu nível)', eq: '', muscles: 'peito, tríceps, deltoide anterior', rest, bw: true, start: S('flexao'),
  cues: ['Mãos um pouco mais abertas que os ombros; corpo reto da cabeça ao calcanhar', 'Desça até o peito ficar a 3 cm do chão, cotovelos a 45° do corpo', 'Suba empurrando o chão sem deixar o quadril cair'],
  alts: ['Supino com halteres de 5 kg deitado no chão, 2 × 15'], notes: 'Mesmo exercício de segunda: a meta vem do último registro, qualquer que tenha sido o dia.', grp: 'peito' });
const REMC = (id) => X({ id, key: 'remada_casa', name: 'Remada serrote com 5 kg (descida 3 s + pausa 1 s)', eq: 'halteres_casa', muscles: 'costas (dorsais), bíceps, deltoide posterior', rest: '90 s depois do par (flexão → remada)', bw: true, start: S('remada_casa'),
  cues: ['Mão e joelho do mesmo lado apoiados no sofá; costas retas, paralelas ao chão', 'Puxe o halter em direção ao quadril e segure 1 s no topo', 'Desça em 3 s até o braço esticar e o ombro alongar'],
  alts: ['Remada curvada com mochila de 8 kg, 2 × 12'], notes: 'Reps por braço. Mesmo exercício de segunda. Com 20 por braço nas 2 séries, o próximo nível é a remada invertida na mesa (teste a mesa antes).', grp: 'costas' });
const ELEVC = (id) => X({ id, key: 'elev_lat_casa', name: 'Elevação lateral com halteres', eq: 'halteres_casa', muscles: 'deltoide lateral', rest: '60 s', bw: false, start: S('elev_lat_casa'),
  cues: ['Tronco levemente inclinado à frente, cotovelos levemente dobrados', 'Suba até a altura dos ombros levando os cotovelos para fora, sem balançar', 'Desça em 2 s sem encostar os halteres na coxa entre as reps'],
  alts: ['Elevação lateral unilateral apoiado na parede, 3 kg'], notes: 'Prioridade nº 1 (largura). Mesmo exercício de segunda: a meta vem do último registro.', grp: 'ombro_lat' });
const ROSCA = (id) => X({ id, key: 'rosca_alt', name: 'Rosca alternada (halteres de 5 kg)', eq: 'halteres_casa', muscles: 'bíceps', rest: '0 s: vá direto para o tríceps; 60 s depois do par', bw: false, start: S('rosca_alt'),
  cues: ['Cotovelo colado ao lado do corpo, sem ir para a frente', 'Suba girando a palma para cima e aperte 1 s no topo', 'Desça em 2 s até esticar o braço, sem balançar o tronco'],
  alts: ['Rosca martelo com 5 kg, 2 × 12'], notes: 'Reps por braço. Bi-set com o tríceps francês.', grp: 'biceps' });
const TRI = (id) => X({ id, key: 'triceps_frances_casa', name: 'Tríceps francês unilateral (halter de 5 kg)', eq: 'halteres_casa', muscles: 'tríceps (cabeça longa)', rest: '60 s depois do par (rosca → tríceps)', bw: false, start: S('triceps_frances_casa'),
  cues: ['Sentado na cadeira, halter atrás da cabeça, cotovelo apontando para o teto', 'Desça até alongar o tríceps; o cotovelo não abre para o lado', 'Estique o braço por completo; a outra mão segura o cotovelo que trabalha'],
  alts: ['Flexão diamante com as mãos no sofá, 2 × 10'], notes: 'Reps por braço. Unilateral porque, com as 2 mãos, 5 kg é leve demais.', grp: 'triceps' });
const CRUZ = (id) => X({ id, key: 'crucifixo_chao', name: 'Crucifixo no chão com halteres de 5 kg', eq: 'halteres_casa', muscles: 'peito', rest: '60 s', bw: false, start: { lv: 0, reps: 15 },
  cues: ['Deitado no colchonete, joelhos dobrados, halteres acima do peito com as palmas frente a frente', 'Abra os braços em arco, cotovelos levemente dobrados, em 3 s até os tríceps encostarem no chão', 'Feche o arco apertando o peito e pare com os halteres sobre o peito, sem bater um no outro'],
  alts: ['Flexão com as mãos na mesa, descida 3 s, 2 × 15'], notes: 'O chão limita a descida e protege o ombro: encostou o tríceps, volta.', grp: 'peito' });
const CINV = (id) => X({ id, key: 'crucifixo_inv_casa', name: 'Crucifixo inverso com halteres de 3 kg', eq: 'halteres_casa', muscles: 'deltoide posterior, parte alta das costas', rest: '60 s', bw: false, start: { lv: 0, reps: 15 },
  cues: ['Sentado na ponta da cadeira, peito quase nas coxas, braços pendurados', 'Abra os braços para os lados, cotovelos levemente dobrados, até a altura dos ombros', 'Pense em levar as mãos para longe; desça em 2 s'],
  alts: ['Crucifixo inverso em pé, tronco inclinado a 45°, 3 kg, 2 × 15'], notes: 'Músculo pequeno: carga leve e controle. Deixa o ombro mais "redondo" visto de lado.', grp: 'ombro_post' });
const PONTE = (id) => X({ id, key: 'ponte_isquios_casa', name: 'Ponte unilateral com o pé na cadeira', eq: 'colchonete', muscles: 'posteriores da coxa, glúteos', rest: '20 s entre as pernas, 60 s entre as séries', bw: true, start: { lv: 1, reps: 10 },
  cues: ['Deitado no colchonete, calcanhar no assento da cadeira (cadeira encostada na parede), joelho levemente dobrado', 'Empurre o calcanhar para baixo e suba o quadril até alinhar ombro, quadril e joelho', 'A outra perna fica esticada no ar; desça em 2 s e só encoste o quadril de leve'],
  alts: ['Ponte bilateral com os pés na cadeira, pausa 2 s no topo, 2 × 15'], notes: 'Reps por perna, começando pela esquerda. Deu cãibra atrás da coxa? Pare, alongue 20 s e termine as reps que faltam.', grp: 'posteriores' });
const PANTC = (id) => X({ id, key: 'panturrilha_casa', name: 'Panturrilha unilateral em pé', eq: '', muscles: 'panturrilhas', rest: '0 s entre as pernas, 60 s entre as séries', bw: true, start: { lv: 1, reps: 12 },
  cues: ['Ponta do pé na borda de um livro grosso fechado (piso sem tapete), calcanhar no ar, mão na parede', 'Desça até o calcanhar ficar bem abaixo da ponta e segure 1 s embaixo', 'Suba o máximo possível e segure 1 s no topo, sem quicar'],
  alts: ['Panturrilha unilateral no chão, sem livro, pausa 2 s no topo'], notes: 'Reps por perna, começando pela esquerda. A mão na parede é só para equilíbrio: não empurre com ela.', grp: 'panturrilha' });
const ABDS = (id) => X({ id, key: 'abd_supra_casa', name: 'Abdominal supra com peso', eq: 'colchonete', muscles: 'reto do abdômen', rest: '60 s', bw: false, start: S('abd_supra_casa'),
  cues: ['Deitado no colchonete, joelhos dobrados, halter abraçado no peito', 'Enrole a coluna tirando as escápulas do chão; a lombar fica no chão', 'Solte o ar ao subir, segure 1 s no topo e desça em 2 s'],
  alts: ['Abdominal supra sem peso, pausa 2 s no topo'], notes: 'Mesmo exercício de quarta: a meta vem do último registro.', grp: 'abdomen' });
const ABDR = (id) => X({ id, key: 'abd_reverso', name: 'Abdominal reverso', eq: 'colchonete', muscles: 'reto do abdômen (parte baixa)', rest: '60 s', bw: true, start: S('abd_reverso'),
  cues: ['Deitado, mãos ao lado do quadril, joelhos a 90°', 'Enrole o quadril tirando o bumbum do chão e levando os joelhos ao peito', 'Desça em 2 s sem balançar as pernas nem bater o quadril no chão'],
  alts: ['Dead bug, 2 × 10 por lado'], notes: 'O que conta é enrolar o quadril, não balançar as pernas. Mesmo exercício de quarta.', grp: 'abdomen' });

const sessions = {
  CT: {
    name: 'Pernas A em casa', short: 'Pernas A casa', loc: 'casa', dur: 40,
    focus: 'Quadríceps e posteriores; deltoide posterior no fim. Sem abdômen (quarta é dia de core).',
    warmup: ['2 min: 30 polichinelos + 10 agachamentos livres + 10 balanços de perna por lado', 'Aproximação: 5 búlgaros por perna com a mão na parede', 'Aproximação: 5 stiffs unilaterais sem peso por perna'],
    notes: 'Só nesta semana, no lugar do Inferior A (ter 06h30). 2 séries por exercício, parando sobrando 3–4 reps. Nos unilaterais, comece pela perna esquerda e faça o mesmo número com a direita.',
    ex: [
      X({ id: 'ct1', key: 'bulgaro', name: 'Agachamento búlgaro (pé de trás na cadeira)', eq: '', muscles: 'quadríceps, glúteos', rest: '30 s entre as pernas, 90 s entre as séries', bw: true, start: { lv: 2, reps: 10 },
        cues: ['Cadeira encostada na parede; peito do pé de trás apoiado no assento', 'Desça em 2 s até o joelho de trás quase tocar o chão, tronco levemente inclinado à frente', 'Suba empurrando pelo calcanhar da frente; o joelho da frente segue a direção dos dedos'],
        alts: ['Afundo sem apoio (nível 1), 2 × 12 por perna'], notes: 'Reps por perna. Perdeu o equilíbrio? Toque 1 dedo na parede: conta como o mesmo nível.', grp: 'quadriceps' }),
      X({ id: 'ct2', key: 'stiff_unilat_casa', name: 'Stiff unilateral com halter de 5 kg', eq: 'halteres_casa', muscles: 'posteriores da coxa, glúteos', rest: '30 s entre as pernas, 75 s entre as séries', bw: false, start: { lv: 1, reps: 12 },
        cues: ['Em pé na perna esquerda, mão esquerda na parede, halter na mão direita (depois inverta)', 'Joelho de apoio levemente dobrado; leve o quadril para trás até alongar atrás da coxa, lombar reta', 'Suba contraindo o glúteo, sem girar o quadril'],
        alts: ['Stiff com os 2 halteres de 5 kg nas 2 pernas, descida 3 s, 2 × 15'], notes: 'Reps por perna. Halter na mão oposta à perna de apoio; a mão na parede é só para equilíbrio.', grp: 'posteriores' }),
      X({ id: 'ct3', key: 'agach_calc_casa', name: 'Agachamento com calcanhares elevados (halteres de 5 kg)', eq: 'halteres_casa', muscles: 'quadríceps', rest: '75 s', bw: false, start: { lv: 1, reps: 15 },
        cues: ['Calcanhares num livro grosso fechado, pés na largura do quadril, halteres ao lado do corpo', 'Desça em 3 s com o tronco em pé, deixando os joelhos passarem à frente dos pés', 'Suba sem travar os joelhos no topo'],
        alts: ['Agachamento livre com halteres de 5 kg, descida 3 s, 2 × 15'], notes: 'É a "cadeira extensora" de casa: o foco é a coxa da frente.', grp: 'quadriceps' }),
      PONTE('ct4'),
      PANTC('ct5'),
      CINV('ct6'),
    ],
  },
  CQ: {
    name: 'Superior A em casa', short: 'Sup. A casa', loc: 'casa', dur: 32,
    focus: 'Peito, costas, ombro lateral e posterior, braços.',
    warmup: ['2 min: 30 polichinelos + 10 círculos de braço para a frente e 10 para trás', '10 flexões com as mãos na mesa', '10 elevações laterais sem peso'],
    notes: 'Só nesta semana, no lugar do Superior A (qui 06h30). 2 séries, parando sobrando 3–4 reps. Pese a mochila na véspera: 8 kg de livros.',
    ex: [
      FLEX('cq1', '0 s: vá direto para a remada com mochila; 90 s depois do par'),
      X({ id: 'cq2', key: 'remada_mochila', name: 'Remada curvada com mochila (8 kg)', eq: '', muscles: 'costas (dorsais), bíceps, deltoide posterior', rest: '90 s depois do par (flexão → remada)', bw: false, start: { lv: 0, reps: 12 },
        cues: ['Uma alça da mochila em cada mão; tronco inclinado a 45°, joelhos dobrados, lombar reta', 'Puxe a mochila até a barriga levando os cotovelos para trás', 'Desça em 3 s até esticar os braços, sem arredondar as costas'],
        alts: ['Remada serrote com 5 kg, descida 3 s + pausa 1 s, 2 × 15 por braço'], notes: 'Mochila pesada na balança: 8 kg. Sem balança em casa, faça a alternativa (serrote).', grp: 'costas' }),
      CRUZ('cq3'),
      ELEVC('cq4'),
      CINV('cq5'),
      ROSCA('cq6'),
      TRI('cq7'),
    ],
  },
  CX: {
    name: 'Pernas B em casa', short: 'Pernas B casa', loc: 'casa', dur: 37,
    focus: 'Glúteos, quadríceps e posteriores + abdômen (48 h depois da quarta).',
    warmup: ['2 min: 30 polichinelos + 10 agachamentos livres + 10 pontes de glúteo', 'Aproximação: 5 afundos reversos por perna sem peso'],
    notes: 'Só nesta semana, no lugar do Inferior B (sex 08h00). 2 séries, parando sobrando 3–4 reps. Nos unilaterais, comece pela perna esquerda.',
    ex: [
      X({ id: 'cx1', key: 'afundo_reverso_casa', name: 'Afundo reverso com halteres de 5 kg', eq: 'halteres_casa', muscles: 'quadríceps, glúteos', rest: '0 s entre as pernas, 90 s entre as séries', bw: false, start: { lv: 1, reps: 10 },
        cues: ['Dê um passo grande para trás e desça até o joelho de trás quase tocar o chão', 'Peso no calcanhar da frente, tronco levemente inclinado à frente', 'Volte empurrando o chão com a perna da frente até ficar em pé'],
        alts: ['Afundo parado (sem passo) com halteres de 5 kg, 2 × 10 por perna'], notes: 'Reps por perna: todas com a esquerda na frente, depois todas com a direita.', grp: 'quadriceps' }),
      X({ id: 'cx2', key: 'hip_thrust_unilat_casa', name: 'Elevação pélvica unilateral com as costas no sofá', eq: '', muscles: 'glúteos, posteriores', rest: '20 s entre as pernas, 75 s entre as séries', bw: true, start: { lv: 1, reps: 10 },
        cues: ['Escápulas na borda do assento do sofá (encostado na parede), pé de apoio embaixo do joelho', 'Suba o quadril até a coxa ficar paralela ao chão, queixo para baixo e costelas fechadas', 'Aperte o glúteo 1 s no topo e desça até o quadril quase tocar o chão'],
        alts: ['Ponte de glúteo unilateral no chão, pausa 2 s no topo, 2 × 12 por perna'], notes: 'Reps por perna. Sentiu a lombar? As costelas estão subindo: segure o abdômen e suba só até a coxa ficar paralela.', grp: 'gluteos' }),
      PONTE('cx3'),
      PANTC('cx4'),
      ABDS('cx5'),
      ABDR('cx6'),
    ],
  },
  CS: {
    name: 'Superior B em casa', short: 'Sup. B casa', loc: 'casa', dur: 36,
    focus: 'Peito, ombros (pike + lateral), costas e braços.',
    warmup: ['2 min: 30 polichinelos + 10 círculos de braço para a frente e 10 para trás', '10 flexões com as mãos na mesa', '5 pikes com as mãos no sofá'],
    notes: 'Só nesta semana, no lugar do Superior B (sáb 15h00). 2 séries, parando sobrando 3–4 reps. Amanhã é descanso total.',
    ex: [
      FLEX('cs1', '0 s: vá direto para a remada; 90 s depois do par'),
      REMC('cs2'),
      X({ id: 'cs3', key: 'pike', name: 'Pike push-up', eq: '', muscles: 'deltoide anterior, tríceps', rest: '90 s', bw: true, start: S('pike'),
        cues: ['Quadril alto, corpo em V invertido, mãos na largura dos ombros', 'Desça a cabeça até um ponto 10 cm à frente das mãos, cotovelos a 45°', 'Empurre o chão até esticar os braços sem desfazer o V'],
        alts: ['Desenvolvimento com halteres de 5 kg sentado, 2 × 12'], notes: 'Mesmo exercício de segunda. Doeu o ombro? Troque pela alternativa.', grp: 'ombro_ant' }),
      CRUZ('cs4'),
      ELEVC('cs5'),
      ROSCA('cs6'),
      TRI('cs7'),
    ],
  },
};

// ids únicos, sets 2, dur ≤ 45
const ids = Object.values(sessions).flatMap((s) => s.ex.map((e) => e.id));
if (new Set(ids).size !== ids.length) throw new Error('ids repetidos');
for (const [k, s] of Object.entries(sessions)) { if (s.dur > 45) throw new Error('dur > 45: ' + k); if (s.short.length > 14) throw new Error('short > 14: ' + k); }

const semana1 = {
  sessions,
  durations: Object.fromEntries(Object.entries(sessions).map(([k, s]) => [k, s.dur])),
  agenda: {
    '2026-09-28': ['19h · Casa 1: flexão 2×8, remada serrote 5 kg 2×15/braço, pike 2×6, elevação lateral 3 kg 2×15, rosca 5 kg 2×12/braço, tríceps francês 5 kg 2×12/braço.', 'Semana 1 toda em casa: a academia começa na terça 06/10.'],
    '2026-09-29': ['06h30 · Pernas A em casa (no lugar do Inferior A): búlgaro 2×10/perna, stiff unilateral 5 kg 2×12/perna, agachamento com calcanhar elevado 2×15, ponte com pé na cadeira 2×10/perna, panturrilha 2×12/perna, crucifixo inverso 3 kg 2×15.', 'Treino cedo: 1 banana 20 min antes e o café da manhã completo depois.'],
    '2026-09-30': ['19h · Casa 2 (core): abdominal supra com 5 kg 2×12, abdominal reverso 2×10, prancha lateral 25 s por lado, mobilidade 5 min.', 'Hoje à noite: encha a mochila com livros até dar 8 kg na balança (remada de amanhã).'],
    '2026-10-01': ['06h30 · Superior A em casa (no lugar do Superior A): flexão + remada com mochila 8 kg 2×12, crucifixo no chão 5 kg 2×15, elevação lateral, crucifixo inverso 3 kg, rosca + tríceps.', 'Metas de flexão, elevação lateral, rosca e tríceps vêm do registro de segunda.'],
    '2026-10-02': ['08h00 · Pernas B em casa (no lugar do Inferior B): afundo reverso 5 kg 2×10/perna, elevação pélvica unilateral no sofá 2×10/perna, ponte com pé na cadeira, panturrilha, abdominal supra e reverso.', 'Abdômen de novo só 48 h depois da quarta: metas vêm do registro de quarta.'],
    '2026-10-03': ['15h00 · Superior B em casa (no lugar do Superior B): flexão + remada serrote, pike, crucifixo no chão, elevação lateral, rosca + tríceps.', 'Amanhã é descanso total.'],
    '2026-10-04': ['Descanso total.', 'Semana 2 = 1ª semana de ACADEMIA (ter, qui, sex, sáb). Separe roupa, garrafa e cadeado hoje.'],
    '2026-10-05': ['19h · Casa 1: as metas já saem do registro da semana 1 (flexão, remada, pike, elevação lateral, rosca, tríceps).'],
    '2026-10-06': ['06h30 · 1º treino na ACADEMIA (Inferior A). As cargas de partida já estão no registro (hack só com o carrinho × 10, stiff 10 kg/halter × 10…). Ainda é Adaptação: 2 séries, sobrando 3–4.', 'Série 1 fácil (sobrariam 6+)? Faça a série 2 com a carga do ajuste que aparece no app.'],
    '2026-10-07': ['19h · Casa 2 (core): metas do registro de sexta.'],
    '2026-10-08': ['06h30 · 1ª vez no Superior A: supino inclinado 10 kg/halter × 10, puxada 25 kg × 10, supino máquina 20 kg × 10, remada baixa 25 kg × 10, elevação lateral 4 kg × 15, rosca W 12 kg total × 10, tríceps corda 15 kg × 12.', 'Anote o furo do banco e a regulagem de cada máquina.'],
    '2026-10-09': ['08h00 · 1ª vez no Inferior B: leg press 20 kg de anilhas × 12, cadeira flexora 20 kg × 12, hip thrust 20 kg de anilhas × 10, elevação lateral na polia 2,5 kg × 15. Panturrilha, crucifixo inverso e abdominal na polia seguem o registro de terça.'],
    '2026-10-10': ['15h00 · 1ª vez no Superior B: Smith inclinado 10 kg de anilhas × 8, desenvolvimento 8 kg/halter × 10, puxada neutra 25 kg × 10, remada apoio no peito 20 kg × 10, crossover 5 kg/lado × 12, rosca inclinada 5 kg/halter × 12, francês na polia 10 kg × 12.', 'Elevação lateral segue o registro de quinta.'],
    '2026-10-11': ['Descanso total. Semana 3 (12/10) começa a Acumulação I: 3 séries na maioria dos exercícios.'],
  },
  notes: [
    'Semana 1 (28/09–04/10) 100% em casa; a academia começa na semana 2 com as cargas de partida do coach_cld.json, ainda na fase de Adaptação (2 séries, sobrando 3–4).',
    'Distribuição: superior seg/qui/sáb, pernas ter/sex, abdômen qua/sex. Nenhum músculo é treinado direto em dias seguidos; única sobreposição é o deltoide posterior (indireto na remada de seg, direto no crucifixo inverso de ter), com 2 séries leves.',
    'Keys compartilhadas com C1/C2 (mesma escada lv): flexao, remada_casa, pike, elev_lat_casa, rosca_alt, triceps_frances_casa (seg/qui/sáb) e abd_supra_casa, abd_reverso (qua/sex). A meta de cada sessão sai do último registro da key, qualquer que tenha sido o dia; na semana 2, C1 e C2 continuam dali.',
    'Keys novas (só semana 1): bulgaro, stiff_unilat_casa, agach_calc_casa, ponte_isquios_casa, panturrilha_casa, crucifixo_inv_casa, afundo_reverso_casa, hip_thrust_unilat_casa, remada_mochila, crucifixo_chao. Ficam no registro como plano B para dias sem academia.',
    'Mochila: só dois pesos em todas as escadas, 8 kg e 12 kg (pese na balança de banheiro). Sem balança, use a alternativa indicada no exercício.',
    'Unilaterais: reps por perna/braço, sempre começando pelo lado esquerdo; o lado direito faz o mesmo número.',
  ],
};
fs.writeFileSync(path.join(DIR, 'semana1_cld.json'), JSON.stringify(semana1, null, 1));
console.log('ok');
