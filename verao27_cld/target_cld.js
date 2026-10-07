/* histórico do exercício (mesma key), do mais recente para o mais antigo; semana leve não vira referência */
function prevHist(w, sid, ex, max){
  var hits = KEYMAP[ex.key] || [], out = [];
  for(var k=w; k>=1 && out.length<max; k--){
    if(k<w && isDeload(k)) continue;
    var ord = orderFor(k), pos = ord.indexOf(sid);
    for(var j = (k===w ? pos-1 : ord.length-1); j>=0 && out.length<max; j--){
      var s2 = ord[j], hit = null;
      for(var h=0; h<hits.length; h++) if(hits[h].sid===s2) hit = hits[h];
      if(!hit) continue;
      var d = Store.get('workouts', wid(k,s2)), e = d && d.ex && d.ex[hit.id];
      if(e && ex.lv && e.v && lvIdx(ex, e.v) < 0) continue; /* nível que não existe nesta escada = registro de outro exercício (ex.: pike antigo) */
      if(e && e.sets && e.sets.some(function(x){ return x && num(x.reps)>0; })) out.push({ week:k, sid:s2, sets:e.sets, v:e.v||'', lim:!!e.lim, easy:!!e.easy && !e.lim });
    }
  }
  return out;
}
function prevData(w, sid, ex){ return prevHist(w, sid, ex, 1)[0] || null; }

/* meta exata por série */
function exRange(ex, li){ var L = ex.lv; if(L && li>=0 && L[li] && L[li].r) return repRange(L[li].r); return repRange(ex.reps); }
function lvIdx(ex, v){ var L = ex.lv || []; for(var i=0;i<L.length;i++){ if(L[i].n===v) return i; } return -1; }
function clampLi(ex, i){ return Math.max(0, Math.min(ex.lv.length-1, i||0)); }
function rirExact(s){ s = String(s==null?'':s); var m = s.match(/^(\d+)\s*[–-]\s*(\d+)(.*)$/); return m ? String(Math.max(+m[1], +m[2]))+m[3] : s; }
/* lê um registro: carga (ou nível) de trabalho W = maior carga em que alguma série fez pelo menos fundo − 2 */
function recOf(ex, rec){
  var L = ex.lv, st = ex.start || {};
  var sets = rec.sets.map(function(x){ return (x && num(x.reps)>0) ? { kg:num(x.kg), r:num(x.reps) } : null; });
  var done = sets.filter(Boolean), o = { sets:sets, done:done, li:-1, W:NaN, fail:false };
  if(L){
    o.li = lvIdx(ex, rec.v); if(o.li<0) o.li = clampLi(ex, st.lv);
    var lo = exRange(ex, o.li)[0];
    o.fail = done.length>0 && done.every(function(x){ return x.r < lo-2; });
    o.W = o.li;
  } else {
    var lo2 = exRange(ex, -1)[0] - 2;
    var ok = done.filter(function(x){ return isFinite(x.kg) && x.r >= lo2; }).map(function(x){ return x.kg; });
    var all = done.map(function(x){ return x.kg; }).filter(isFinite);
    if(ok.length) o.W = Math.max.apply(null, ok);
    else if(all.length){ o.W = Math.max(0, Math.min.apply(null, all) - (ex.inc||2)); o.fail = true; }
    else o.W = isFinite(st.kg) ? st.kg : NaN;
  }
  o.atW = function(x){ return !!L || !isFinite(x.kg) || !isFinite(o.W) || x.kg === o.W; };
  var aw = done.filter(o.atW);
  o.avg = aw.length ? aw.reduce(function(s,x){ return s+x.r; },0)/aw.length : NaN;
  return o;
}
/* 3 registros (do mais recente) sem progresso: mesma carga/nível e média de reps sem subir */
function stallOf(ex, hs){
  if(hs.length < 3) return false;
  if(!hs[0].lim && hs[1].lim) return false; /* mesmas reps, mas saiu do limite: sobrou mais = progresso */
  var Rs = hs.map(function(h){ return recOf(ex, h); });
  if(ex.lv && !(Rs[0].li > 0)) return false;
  return !Rs.some(function(x){ return x.fail; }) && Rs[0].W===Rs[1].W && Rs[1].W===Rs[2].W && Rs[0].avg <= Rs[1].avg && Rs[1].avg <= Rs[2].avg;
}
function target(ex, hist, w, sub){
  var n = setsFor(ex, w), L = ex.lv, st = ex.start || {}, step = ex.unit==='s' ? 5 : 1, prev = hist[0];
  var t = { kg:NaN, li:-1, reps:[], kind:'first', lo:0, hi:0 }, i, rr;
  function setLv(li){ t.li = li; rr = exRange(ex, li); t.lo = rr[0]; t.hi = rr[1]; }
  function fill(r){ t.reps = []; for(var k=0;k<n;k++) t.reps.push(r); }
  if(!prev){
    if(L) setLv(clampLi(ex, st.lv)); else { setLv(-1); t.kg = (sub && isFinite(ex.alt_kg)) ? ex.alt_kg : (isFinite(st.kg) ? st.kg : NaN); }
    fill(st.reps || t.lo); return t;
  }
  var R = recOf(ex, prev);
  setLv(L ? R.li : -1); if(!L) t.kg = R.W;
  if(isDeload(w)){ t.kind = 'deload'; fill(t.lo); return t; }
  if(R.fail){ t.kind = 'down'; if(L) setLv(Math.max(0, R.li-1)); fill(t.lo); return t; }
  /* a última foi a sessão de destravar (um degrau abaixo): volta ao nível/carga de antes, com as reps de antes */
  if(hist.length >= 4 && stallOf(ex, hist.slice(1,4))){
    var R1 = recOf(ex, hist[1]);
    if(L ? R.li === R1.li - 1 : (isFinite(R.W) && isFinite(R1.W) && R.W < R1.W)){
      t.kind = 'back';
      if(L) setLv(R1.li); else t.kg = R1.W;
      var r1 = R1.done.filter(R1.atW).map(function(x){ return x.r; });
      fill(Math.max(t.lo, Math.min(t.hi, r1.length ? Math.min.apply(null, r1) : t.lo))); return t;
    }
  }
  var need = setsFor(ex, prev.week), lim = !!prev.lim, easy = !!prev.easy;
  var allTop = !lim && (easy ? R.done.length > 0 : R.done.length >= need && R.done.every(function(x){ return R.atW(x) && x.r >= t.hi; }));
  if(allTop){
    if(L && t.li < L.length-1){ setLv(t.li+1); t.kind = 'up'; }
    else if(L){ t.kind = 'max'; fill(t.hi); return t; }
    else { t.kg = (isFinite(t.kg) ? t.kg : 0) + (ex.inc||2); t.kind = 'up'; }
    fill(t.lo); return t;
  }
  if(stallOf(ex, hist.slice(0,3))){
    t.kind = 'stall';
    if(L) setLv(Math.max(0, R.li-1)); else t.kg = Math.max(0, R.W - (ex.inc||2));
    fill(Math.max(t.lo, t.hi-2)); return t;
  }
  t.kind = lim ? 'limit' : 'hold';
  var atWr = R.done.filter(R.atW).map(function(x){ return x.r; });
  var minW = atWr.length ? Math.max(t.lo, Math.min(t.hi, Math.min.apply(null, atWr))) : t.lo, last = t.lo;
  for(i=0;i<n;i++){
    var x = R.sets[i];
    if(x && R.atW(x)) last = Math.min(t.hi, Math.max(x.r + (lim ? 0 : step), t.lo));
    else if(x) last = minW;
    t.reps.push(last);
  }
  return t;
}
function loadText(ex, kg, li){ return ex.lv ? esc(ex.lv[li].n) : (isFinite(kg) ? fx(kg)+' kg' : ''); }
function tgtText(ex, t){
  var u = ex.unit==='s' ? ' s' : '', ld = loadText(ex, t.kg, t.li);
  return (ld ? ld+(ex.lv ? ' · ' : ' × ') : '') + t.reps.map(function(r){ return r+u; }).join(' / ');
}
function hintFor(ex, hist, t, w, sub){
  var st = ex.start || {}, u = ex.unit==='s' ? ' s' : '', g = '<strong class="goal">Meta de hoje: '+tgtText(ex, t)+'</strong>', prev = hist[0];
  if(t.kind==='first') return { tone:'', html: g+'1ª vez deste exercício.'+(st.adj && !sub ? ' '+esc(st.adj) : '')+(sub ? ' Carga de partida do substituto.' : '') };
  var R = recOf(ex, prev);
  var last = 'Última vez (S'+prev.week+' · '+esc(P.sessions[prev.sid].short)+'): '+(ex.lv ? esc(ex.lv[R.li].n)+' · ' : (isFinite(R.W) && !R.fail ? fx(R.W)+' kg × ' : ''))+R.done.map(function(x){ return (!ex.lv && isFinite(x.kg) && x.kg!==R.W ? fx(x.kg)+' kg × ' : '')+x.r+u; }).join(' / ')+'.';
  var more = (setsFor(ex, w) > setsFor(ex, prev.week) && !isDeload(w)) ? ' Esta semana tem <strong>'+setsFor(ex, w)+' séries</strong> (subiu 1).' : '';
  if(t.kind==='deload') return { tone:'down', html: g+'Semana leve: mesma carga, metade das séries.' };
  if(t.kind==='down') return { tone:'down', html: g+last+' Ficou abaixo de '+(t.lo-2)+u+' em todas: '+(ex.lv ? 'volte um nível.' : 'a carga desce um degrau.')+more };
  if(t.kind==='stall') return { tone:'down', html: g+last+' 3 sessões sem progresso: '+(ex.lv ? 'um nível abaixo' : 'um degrau de carga abaixo')+' por uma vez. Depois volta ao normal.'+more };
  if(t.kind==='back') return { tone:'up', html: g+last+' Sessão de destravar feita: volta '+(ex.lv ? 'para “'+esc(ex.lv[t.li].n)+'”' : 'para '+fx(t.kg)+' kg')+' com as reps de antes.'+more };
  if(t.kind==='up'){
    var why = prev.easy ? ' Você marcou que sobrou muito: ' : ' Bateu o topo em todas: ';
    var ladder = ex.lv ? ' Se uma série ficar abaixo de '+t.lo+u+', faça as seguintes em “'+esc(ex.lv[t.li-1].n)+'”.'
                       : ' Se uma série ficar abaixo de '+t.lo+', faça as seguintes com '+fx(t.kg-(ex.inc||2))+' kg.';
    return { tone:'up', html: g+last+why+(ex.lv ? 'subiu de nível.' : 'subiu a carga.')+ladder+more };
  }
  if(t.kind==='limit') return { tone:'hold', html: g+last+' Você foi no limite: repita as mesmas reps. Quando sair sem ser no limite, volta o +1.'+more };
  if(t.kind==='max') return { tone:'hold', html: g+last+' Você está no nível mais alto: mantenha.'+more };
  return { tone:'hold', html: g+last+' Mesma '+(ex.lv ? 'variação' : 'carga')+', +'+(u ? '5 s' : '1 rep')+' por série.'+more };
}
