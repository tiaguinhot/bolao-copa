import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, writeBatch, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig, ADMIN_CODE } from "./firebase-config.js";

/* ===================== DADOS BASE =====================
   [id, rodada, casa, fora, kickoff ISO (horário de Brasília -03:00)] */
const GAMES_SEED = [
 [1,1,"México","África do Sul","2026-06-11T16:00:00-03:00"],
 [2,1,"Coreia do Sul","Rep. Tcheca","2026-06-11T23:00:00-03:00"],
 [3,1,"Canadá","Bósnia e Herzegovina","2026-06-12T16:00:00-03:00"],
 [4,1,"Estados Unidos","Paraguai","2026-06-12T22:00:00-03:00"],
 [5,1,"Austrália","Turquia","2026-06-14T01:00:00-03:00"],
 [6,1,"Catar","Suíça","2026-06-13T16:00:00-03:00"],
 [7,1,"Brasil","Marrocos","2026-06-13T19:00:00-03:00"],
 [8,1,"Haiti","Escócia","2026-06-13T22:00:00-03:00"],
 [9,1,"Alemanha","Curaçao","2026-06-14T14:00:00-03:00"],
 [10,1,"Holanda","Japão","2026-06-14T17:00:00-03:00"],
 [11,1,"Costa do Marfim","Equador","2026-06-14T20:00:00-03:00"],
 [12,1,"Suécia","Tunísia","2026-06-14T23:00:00-03:00"],
 [13,1,"Espanha","Cabo Verde","2026-06-15T13:00:00-03:00"],
 [14,1,"Bélgica","Egito","2026-06-15T16:00:00-03:00"],
 [15,1,"Arábia Saudita","Uruguai","2026-06-15T19:00:00-03:00"],
 [16,1,"Irã","Nova Zelândia","2026-06-15T22:00:00-03:00"],
 [17,1,"Argentina","Argélia","2026-06-16T14:00:00-03:00"],
 [18,1,"França","Senegal","2026-06-16T16:00:00-03:00"],
 [19,1,"Iraque","Noruega","2026-06-16T19:00:00-03:00"],
 [20,1,"Áustria","Jordânia","2026-06-18T01:00:00-03:00"],
 [21,1,"Portugal","RD Congo","2026-06-17T14:00:00-03:00"],
 [22,1,"Inglaterra","Croácia","2026-06-17T17:00:00-03:00"],
 [23,1,"Gana","Panamá","2026-06-17T20:00:00-03:00"],
 [24,1,"Uzbequistão","Colômbia","2026-06-17T23:00:00-03:00"],
 [25,2,"Rep. Tcheca","África do Sul","2026-06-18T13:00:00-03:00"],
 [26,2,"Suíça","Bósnia e Herzegovina","2026-06-18T16:00:00-03:00"],
 [27,2,"Canadá","Catar","2026-06-18T19:00:00-03:00"],
 [28,2,"México","Coreia do Sul","2026-06-18T22:00:00-03:00"],
 [29,2,"Turquia","Paraguai","2026-06-20T01:00:00-03:00"],
 [30,2,"Estados Unidos","Austrália","2026-06-19T16:00:00-03:00"],
 [31,2,"Escócia","Marrocos","2026-06-19T19:00:00-03:00"],
 [32,2,"Brasil","Haiti","2026-06-19T22:00:00-03:00"],
 [33,2,"Holanda","Suécia","2026-06-20T14:00:00-03:00"],
 [34,2,"Alemanha","Costa do Marfim","2026-06-20T17:00:00-03:00"],
 [35,2,"Equador","Curaçao","2026-06-20T21:00:00-03:00"],
 [36,2,"Tunísia","Japão","2026-06-22T01:00:00-03:00"],
 [37,2,"Espanha","Arábia Saudita","2026-06-21T13:00:00-03:00"],
 [38,2,"Bélgica","Irã","2026-06-21T16:00:00-03:00"],
 [39,2,"Uruguai","Cabo Verde","2026-06-21T19:00:00-03:00"],
 [40,2,"Nova Zelândia","Egito","2026-06-21T22:00:00-03:00"],
 [41,2,"Argentina","Áustria","2026-06-22T14:00:00-03:00"],
 [42,2,"França","Iraque","2026-06-22T18:00:00-03:00"],
 [43,2,"Noruega","Senegal","2026-06-22T21:00:00-03:00"],
 [44,2,"Jordânia","Argélia","2026-06-24T00:00:00-03:00"],
 [45,2,"Inglaterra","Gana","2026-06-23T17:00:00-03:00"],
 [46,2,"Portugal","Uzbequistão","2026-06-23T14:00:00-03:00"],
 [47,2,"Panamá","Croácia","2026-06-23T20:00:00-03:00"],
 [48,2,"Colômbia","RD Congo","2026-06-23T23:00:00-03:00"],
 [49,3,"Suíça","Canadá","2026-06-24T16:00:00-03:00"],
 [50,3,"Bósnia e Herzegovina","Catar","2026-06-24T16:00:00-03:00"],
 [51,3,"Escócia","Brasil","2026-06-24T19:00:00-03:00"],
 [52,3,"Marrocos","Haiti","2026-06-24T19:00:00-03:00"],
 [53,3,"Rep. Tcheca","México","2026-06-24T22:00:00-03:00"],
 [54,3,"África do Sul","Coreia do Sul","2026-06-24T22:00:00-03:00"],
 [55,3,"Equador","Alemanha","2026-06-25T17:00:00-03:00"],
 [56,3,"Curaçao","Costa do Marfim","2026-06-25T17:00:00-03:00"],
 [57,3,"Japão","Suécia","2026-06-25T20:00:00-03:00"],
 [58,3,"Tunísia","Holanda","2026-06-25T20:00:00-03:00"],
 [59,3,"Turquia","Estados Unidos","2026-06-25T23:00:00-03:00"],
 [60,3,"Paraguai","Austrália","2026-06-25T23:00:00-03:00"],
 [61,3,"Noruega","França","2026-06-26T16:00:00-03:00"],
 [62,3,"Senegal","Iraque","2026-06-26T16:00:00-03:00"],
 [63,3,"Cabo Verde","Arábia Saudita","2026-06-26T21:00:00-03:00"],
 [64,3,"Uruguai","Espanha","2026-06-26T21:00:00-03:00"],
 [65,3,"Egito","Irã","2026-06-28T00:00:00-03:00"],
 [66,3,"Nova Zelândia","Bélgica","2026-06-28T00:00:00-03:00"],
 [67,3,"Panamá","Inglaterra","2026-06-27T18:00:00-03:00"],
 [68,3,"Croácia","Gana","2026-06-27T18:00:00-03:00"],
 [69,3,"Colômbia","Portugal","2026-06-27T20:30:00-03:00"],
 [70,3,"RD Congo","Uzbequistão","2026-06-27T20:30:00-03:00"],
 [71,3,"Argélia","Áustria","2026-06-27T23:00:00-03:00"],
 [72,3,"Jordânia","Argentina","2026-06-27T23:00:00-03:00"],
];
const FLAG = {
 "México":"🇲🇽","África do Sul":"🇿🇦","Coreia do Sul":"🇰🇷","Rep. Tcheca":"🇨🇿","Canadá":"🇨🇦",
 "Bósnia e Herzegovina":"🇧🇦","Estados Unidos":"🇺🇸","Paraguai":"🇵🇾","Austrália":"🇦🇺","Turquia":"🇹🇷",
 "Catar":"🇶🇦","Suíça":"🇨🇭","Brasil":"🇧🇷","Marrocos":"🇲🇦","Haiti":"🇭🇹","Escócia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Alemanha":"🇩🇪",
 "Curaçao":"🇨🇼","Holanda":"🇳🇱","Japão":"🇯🇵","Costa do Marfim":"🇨🇮","Equador":"🇪🇨","Suécia":"🇸🇪",
 "Tunísia":"🇹🇳","Espanha":"🇪🇸","Cabo Verde":"🇨🇻","Bélgica":"🇧🇪","Egito":"🇪🇬","Arábia Saudita":"🇸🇦",
 "Uruguai":"🇺🇾","Irã":"🇮🇷","Nova Zelândia":"🇳🇿","Argentina":"🇦🇷","Argélia":"🇩🇿","França":"🇫🇷",
 "Senegal":"🇸🇳","Iraque":"🇮🇶","Noruega":"🇳🇴","Áustria":"🇦🇹","Jordânia":"🇯🇴","Portugal":"🇵🇹",
 "RD Congo":"🇨🇩","Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croácia":"🇭🇷","Gana":"🇬🇭","Panamá":"🇵🇦","Uzbequistão":"🇺🇿","Colômbia":"🇨🇴"
};
const PARTS_SEED = ["Igor","Taci","Lucas","Isa","Bruno","Ivo","Ione","Murilo","Tiago","Greice"];
const RESULTS_SEED = {1:[2,0],2:[2,1],3:[1,1],4:[4,1],5:[2,0],6:[1,1],7:[1,1],8:[0,1],9:[7,1]};
const PALP_SEED = {
 2:{Igor:[2,2],Taci:[3,0],Lucas:[1,0],Isa:[2,1],Bruno:[3,1],Ivo:[1,0],Murilo:[2,1],Tiago:[1,1],Ione:[1,1]},
 3:{Isa:[3,0],Bruno:[0,0],Igor:[2,2],Lucas:[2,0],Taci:[4,0],Murilo:[2,0],Ivo:[1,2],Ione:[1,0],Tiago:[2,0]},
 4:{Isa:[3,1],Bruno:[0,0],Igor:[2,2],Lucas:[2,1],Taci:[3,3],Murilo:[2,2],Ivo:[1,1],Ione:[2,1],Tiago:[3,1],Greice:[2,1]},
 5:{Isa:[1,2],Bruno:[1,0],Lucas:[1,1],Igor:[3,1],Taci:[2,2],Murilo:[0,2],Tiago:[0,2],Greice:[0,1]},
 6:{Isa:[1,2],Bruno:[2,1],Murilo:[0,3],Greice:[0,2],Tiago:[1,2],Igor:[1,3],Lucas:[0,1],Taci:[2,1],Ivo:[0,3],Ione:[0,2]},
 7:{Isa:[3,2],Bruno:[3,2],Murilo:[3,1],Greice:[2,1],Tiago:[2,1],Igor:[3,0],Lucas:[2,1],Taci:[1,0],Ivo:[2,1],Ione:[3,1]},
 8:{Isa:[0,1],Bruno:[0,2],Murilo:[1,2],Greice:[1,1],Tiago:[0,3],Igor:[1,2],Lucas:[0,1],Taci:[0,0],Ivo:[1,3],Ione:[1,0]},
 9:{Isa:[4,0],Bruno:[2,0],Tiago:[3,1],Murilo:[4,0],Lucas:[3,0],Igor:[4,0],Taci:[4,0],Greice:[4,0],Ivo:[5,0],Ione:[2,0]},
 10:{Isa:[3,1],Bruno:[2,1],Tiago:[2,1],Greice:[2,0],Murilo:[2,2],Lucas:[2,1],Igor:[4,1],Taci:[3,2],Ivo:[2,2],Ione:[2,3]},
 11:{Isa:[2,2],Bruno:[1,2],Tiago:[0,1],Greice:[0,0],Murilo:[0,1],Lucas:[1,2],Igor:[3,0],Taci:[1,2],Ivo:[0,2],Ione:[0,1]},
 12:{Isa:[2,2],Bruno:[0,0],Tiago:[2,0],Greice:[1,0],Murilo:[1,1],Lucas:[1,1],Igor:[2,0],Taci:[1,0],Ivo:[2,0],Ione:[1,0]},
 13:{Tiago:[3,0],Greice:[2,0],Murilo:[5,0],Lucas:[3,0],Igor:[3,0],Taci:[2,0]},
};
const SCORING = {exato:10, saldo:7, venc:5};
const SP = "America/Sao_Paulo";

/* ===================== FIREBASE ===================== */
let db, ready=false;
try{
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  const auth = getAuth(app);
  signInAnonymously(auth).catch(e=>banner("Não consegui conectar. Avise o organizador. ("+e.code+")"));
  onAuthStateChanged(auth, u=>{ if(u && !ready){ ready=true; startListeners(); } });
}catch(e){
  banner("App ainda não configurado (firebase-config.js).");
}

/* ===================== ESTADO ===================== */
const STATE = { games:{}, palpites:{}, config:{participants:PARTS_SEED.slice(), scoring:SCORING} };
let me = localStorage.getItem("bolao_nome") || "";
let isAdmin = false;
const pending = new Map();   // gid -> {c,f} edição em andamento

function startListeners(){
  onSnapshot(collection(db,"games"), s=>{ s.forEach(d=>STATE.games[d.id]=d.data()); renderAll(); });
  onSnapshot(collection(db,"palpites"), s=>{ STATE.palpites={}; s.forEach(d=>STATE.palpites[d.id]=d.data()); renderAll(); });
  onSnapshot(doc(db,"config","bolao"), d=>{ if(d.exists()) STATE.config=d.data(); renderAll(); });
}

/* ===================== HELPERS ===================== */
function pts(pc,pf,gc,gf){
  if(pc==null||pf==null||gc==null||gf==null) return null;
  if(pc===gc&&pf===gf) return SCORING.exato;
  const sg=x=>Math.sign(x);
  if(sg(pc-pf)===sg(gc-gf)) return (pc-pf)===(gc-gf)?SCORING.saldo:SCORING.venc;
  return 0;
}
const gamesArr = ()=>Object.values(STATE.games).sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff)||a.id-b.id);
const palpiteOf = (gid,name)=>STATE.palpites[`${gid}__${name}`];
const parts = ()=>STATE.config.participants||[];
const kdate = g=>new Date(g.kickoff);
function isLocked(g){ return (g.ga!=null&&g.gb!=null) || Date.now()>=kdate(g).getTime(); }

function fmtTime(d){ return new Intl.DateTimeFormat("pt-BR",{timeZone:SP,hour:"2-digit",minute:"2-digit",hour12:false}).format(d); }
function blockKey(g){ const b=new Date(kdate(g).getTime()-6*3600000);
  return new Intl.DateTimeFormat("en-CA",{timeZone:SP,year:"numeric",month:"2-digit",day:"2-digit"}).format(b); }
function blockLabel(g){ const b=new Date(kdate(g).getTime()-6*3600000);
  const s=new Intl.DateTimeFormat("pt-BR",{timeZone:SP,weekday:"long",day:"2-digit",month:"long"}).format(b);
  return s.charAt(0).toUpperCase()+s.slice(1); }
function isMadrugada(g){ // kickoff cai em dia diferente do bloco
  const dayK=new Intl.DateTimeFormat("en-CA",{timeZone:SP,year:"numeric",month:"2-digit",day:"2-digit"}).format(kdate(g));
  return dayK!==blockKey(g);
}
function countdown(g){
  const diff=kdate(g).getTime()-Date.now();
  if(g.ga!=null&&g.gb!=null) return {txt:`Encerrado · ${g.ga} × ${g.gb}`, cls:"done"};
  if(diff<=0) return {txt:"🔴 Em andamento — apostas fechadas", cls:"live"};
  const min=Math.floor(diff/60000), h=Math.floor(min/60), d=Math.floor(h/24);
  if(d>=1) return {txt:`Faltam ${d} dia${d>1?"s":""} ${h%24}h`, cls:"far"};
  if(h>=1) return {txt:`Começa em ${h}h ${min%60}min`, cls:"soon"};
  return {txt:`⏰ Começa em ${min} min — corre!`, cls:"urgent"};
}
function getVal(gid){
  if(pending.has(gid)) return pending.get(gid);
  const my=palpiteOf(gid,me); return my?{c:my.casa,f:my.fora}:{c:0,f:0};
}

/* ===================== RENDER ===================== */
function renderAll(){ renderName(); renderBlocks(); renderBoard(); renderConfer(); renderAdmin(); }

function renderName(){
  const sel=document.getElementById("nameSel");
  sel.innerHTML=`<option value="">— Toque e escolha seu nome —</option>`+
    parts().map(p=>`<option value="${p}" ${p===me?"selected":""}>${p}</option>`).join("");
  document.getElementById("hello").textContent = me ? `Você está apostando como ${me}` : "Primeiro, escolha seu nome acima 👆";
}

function renderBlocks(){
  const box=document.getElementById("blocks"); if(!box) return;
  if(!me){ box.innerHTML=`<p class="empty">👆 Escolha seu nome lá em cima para começar a apostar.</p>`; return; }
  const groups={};
  gamesArr().forEach(g=>{ const k=blockKey(g); (groups[k]=groups[k]||{key:k,label:blockLabel(g),games:[]}).games.push(g); });
  const todayKey=new Intl.DateTimeFormat("en-CA",{timeZone:SP,year:"numeric",month:"2-digit",day:"2-digit"})
    .format(new Date(Date.now()-6*3600000));
  const all=Object.values(groups);
  const today=all.filter(b=>b.key===todayKey);
  const future=all.filter(b=>b.key>todayKey).sort((a,b)=>a.key<b.key?-1:1);
  const past=all.filter(b=>b.key<todayKey).sort((a,b)=>a.key<b.key?1:-1);
  box.innerHTML="";
  today.forEach(b=>box.appendChild(blockEl(b,true,true)));
  future.forEach(b=>box.appendChild(blockEl(b,true,false)));
  if(past.length){
    const d=document.createElement("div"); d.className="pastdiv"; d.textContent="▾ Dias encerrados"; box.appendChild(d);
    past.forEach(b=>box.appendChild(blockEl(b,false,false)));
  }
}
function blockEl(b,expanded,isToday){
  const openCount=b.games.filter(g=>!isLocked(g)).length;
  const el=document.createElement("section"); el.className="day"+(isToday?" today":"")+(openCount>0?" hasopen":"");
  el.innerHTML=`
    <button class="dayhead" data-k="${b.key}">
      <span>${isToday?"📍 HOJE · ":""}${b.label}</span>
      <span class="daymeta">${openCount>0?`🟢 ${openCount} aberto${openCount>1?"s":""}`:"encerrado"} ${expanded?"▾":"▸"}</span>
    </button>
    <div class="daybody" style="${expanded?"":"display:none"}">
      ${b.games.map(g=>gameCard(g)).join("")}
      <button class="wa" data-share="${b.key}">📲 Enviar meus palpites deste dia no WhatsApp</button>
    </div>`;
  return el;
}

function gameCard(g){
  const locked=isLocked(g);
  const my=palpiteOf(g.id,me);
  const hasRes=g.ga!=null&&g.gb!=null;
  const pt=(my&&hasRes)?pts(my.casa,my.fora,g.ga,g.gb):null;
  if(locked){
    const badge = my
      ? `<span class="badge sm ${pt!=null?'b'+pt:''}">${pt!=null?pt+" pts":"—"}</span>`
      : `<span class="st-miss">não apostou</span>`;
    return `
     <div class="game locked compact" data-card="${g.id}">
       <div class="cteams">${FLAG[g.casa]||""} ${g.casa} <b>${hasRes?`${g.ga}×${g.gb}`:"–"}</b> ${g.fora} ${FLAG[g.fora]||""}</div>
       <div class="cmeta">${my?`<span class="myp">você: ${my.casa}×${my.fora}</span>`:""}${badge}</div>
     </div>`;
  }
  const v=getVal(g.id);
  const cd=countdown(g);
  const status = pending.has(g.id)
     ? `<button class="savebtn" data-save="${g.id}">Salvar</button>`
     : (my?`<span class="st-ok">✓ enviado (${my.casa}×${my.fora}) — pode alterar</span>`:`<span class="st-todo">toque − ou + e salve</span>`);
  return `
   <div class="game" data-card="${g.id}">
     <div class="cd ${cd.cls}" id="cd_${g.id}">${cd.txt}${isMadrugada(g)?' · 🌙 madrugada':''}</div>
     <div class="teams">
       <div class="team">${FLAG[g.casa]||"⚽"} <span>${g.casa}</span></div>
       <div class="stepper">
         <button class="step" data-g="${g.id}" data-fld="c" data-d="-1" aria-label="menos">−</button>
         <span class="score" id="sc_${g.id}">${v.c}</span>
         <button class="step" data-g="${g.id}" data-fld="c" data-d="1" aria-label="mais">+</button>
       </div>
       <div class="xsep">×</div>
       <div class="stepper">
         <button class="step" data-g="${g.id}" data-fld="f" data-d="-1" aria-label="menos">−</button>
         <span class="score" id="sf_${g.id}">${v.f}</span>
         <button class="step" data-g="${g.id}" data-fld="f" data-d="1" aria-label="mais">+</button>
       </div>
       <div class="team right"><span>${g.fora}</span> ${FLAG[g.fora]||"⚽"}</div>
     </div>
     <div class="cardfoot">${status}</div>
   </div>`;
}

function totals(){
  const t={}; parts().forEach(p=>t[p]={pts:0,e:0,s:0,v:0,n:0});
  gamesArr().forEach(g=>parts().forEach(p=>{
    const my=palpiteOf(g.id,p); if(!my)return; t[p].n++;
    if(g.ga!=null&&g.gb!=null){ const pt=pts(my.casa,my.fora,g.ga,g.gb);
      t[p].pts+=pt; if(pt===10)t[p].e++; else if(pt===7)t[p].s++; else if(pt===5)t[p].v++; }
  }));
  return t;
}
function renderBoard(){
  const box=document.getElementById("boardList"); if(!box)return;
  const t=totals();
  const arr=parts().map(p=>({p,...t[p]})).sort((a,b)=>b.pts-a.pts||b.e-a.e||b.s-a.s);
  box.innerHTML="";
  arr.forEach((o,i)=>{ const pos=i+1;
    const r=document.createElement("div"); r.className="row"+(pos<=3?" p"+pos:"")+(o.p===me?" meRow":"");
    r.innerHTML=`<div class="pos">${pos}º</div>
      <div><div class="who">${o.p}${o.p===me?' <span class="tag">você</span>':''}</div>
      <div class="break">${o.e} exatos · ${o.s} saldo · ${o.v} venc</div></div>
      <div class="ptsBig">${o.pts}<small>pts</small></div>`;
    box.appendChild(r);
  });
  const top=arr[0];
  document.getElementById("leaderline").textContent = top&&top.pts>0?`🏆 Líder: ${top.p} (${top.pts} pts)`:"Bom jogo!";
}

function renderConfer(){
  const box=document.getElementById("conferList"); if(!box)return;
  const ps=parts();
  const withPal=gamesArr().filter(g=>ps.some(p=>palpiteOf(g.id,p)))
    .sort((a,b)=>new Date(b.kickoff)-new Date(a.kickoff));   // mais recentes primeiro
  if(!withPal.length){ box.innerHTML=`<p class="empty">Ainda não há palpites lançados.</p>`; return; }
  box.innerHTML="";
  withPal.forEach(g=>{
    const hasRes=g.ga!=null&&g.gb!=null;
    let chips="";
    ps.forEach(p=>{ const my=palpiteOf(g.id,p); if(!my)return;
      const pt=hasRes?pts(my.casa,my.fora,g.ga,g.gb):null;
      const cls=pt===10?"c10":pt===7?"c7":pt===5?"c5":pt===0?"c0":"";
      chips+=`<span class="cf ${cls}${p===me?' meCf':''}">${p} <b>${my.casa}×${my.fora}</b></span>`;
    });
    const card=document.createElement("div"); card.className="cgame";
    card.innerHTML=`<div class="chead">${FLAG[g.casa]||""} ${g.casa} <b class="cr">${hasRes?`${g.ga} × ${g.gb}`:"× a definir"}</b> ${g.fora} ${FLAG[g.fora]||""}</div>
      <div class="chips">${chips}</div>`;
    box.appendChild(card);
  });
}

function renderAdmin(){
  if(!isAdmin)return;
  const box=document.getElementById("adminGames"); if(!box)return;
  box.innerHTML="";
  gamesArr().forEach(g=>{ const row=document.createElement("div"); row.className="arow";
    row.innerHTML=`<div class="agame">${g.casa} × ${g.fora} <small>${blockLabel(g).split(",")[0]} ${fmtTime(kdate(g))}</small></div>
      <input class="anum" id="ac_${g.id}" value="${g.ga??""}" inputmode="numeric">
      <span>×</span><input class="anum" id="af_${g.id}" value="${g.gb??""}" inputmode="numeric">
      <button class="savebtn" data-res="${g.id}">OK</button>`;
    box.appendChild(row); });
  // selects de "lançar/corrigir aposta" (preserva a seleção atual)
  const gsel=document.getElementById("adminGameSel"), psel=document.getElementById("adminPartSel");
  if(gsel){ const cur=gsel.value;
    gsel.innerHTML=gamesArr().map(g=>`<option value="${g.id}">${isLocked(g)?"🔒 ":""}${g.casa} × ${g.fora} — ${blockLabel(g).split(",")[0]} ${fmtTime(kdate(g))}</option>`).join("");
    if(cur) gsel.value=cur; }
  if(psel){ const cur=psel.value;
    psel.innerHTML=parts().map(p=>`<option value="${p}">${p}</option>`).join("");
    if(cur) psel.value=cur; }
  prefillAdminBet();
}
function prefillAdminBet(){
  const gsel=document.getElementById("adminGameSel"), psel=document.getElementById("adminPartSel");
  if(!gsel||!psel||!gsel.value)return;
  const my=palpiteOf(+gsel.value,psel.value);
  document.getElementById("apCasa").value=my?my.casa:"";
  document.getElementById("apFora").value=my?my.fora:"";
  const st=document.getElementById("adminBetStatus");
  if(st) st.textContent=my?`Aposta atual de ${psel.value}: ${my.casa} × ${my.fora}${my.byAdmin?" (lançada por você)":""}`:`${psel.value} ainda não tem aposta nesse jogo.`;
}
async function saveAdminBet(){
  const gid=+document.getElementById("adminGameSel").value;
  const name=document.getElementById("adminPartSel").value;
  const c=parseInt(document.getElementById("apCasa").value,10);
  const f=parseInt(document.getElementById("apFora").value,10);
  if(!Number.isFinite(c)||!Number.isFinite(f)){ banner("Preencha os dois placares.");return; }
  try{
    await setDoc(doc(db,"palpites",`${gid}__${name}`),
      {gameId:gid,name,casa:c,fora:f,ts:serverTimestamp(),byAdmin:true},{merge:true});
    const st=document.getElementById("adminBetStatus");
    if(st) st.textContent=`✅ Aposta de ${name} salva: ${c} × ${f}`;
  }catch(e){ banner("Não salvou: "+(e.code||e.message)); }
}

/* ===================== TICKER (contagem regressiva + trava) ===================== */
let prevLocked={};
setInterval(()=>{
  let changed=false;
  gamesArr().forEach(g=>{
    const cd=countdown(g); const el=document.getElementById("cd_"+g.id);
    if(el){ el.textContent=cd.txt+((isMadrugada(g)&&!(g.ga!=null&&g.gb!=null))?" · 🌙 madrugada":""); el.className="cd "+cd.cls; }
    const lk=isLocked(g);
    if(prevLocked[g.id]!==undefined && prevLocked[g.id]!==lk) changed=true;
    prevLocked[g.id]=lk;
  });
  if(changed) renderBlocks();   // re-renderiza quando um jogo trava no horário
},1000);

/* ===================== AÇÕES ===================== */
function step(gid,fld,d){
  const v=getVal(gid); v[fld]=Math.max(0,Math.min(20,(v[fld]||0)+d));
  pending.set(gid,{c:v.c,f:v.f});
  const el=document.getElementById((fld==="c"?"sc_":"sf_")+gid); if(el)el.textContent=v[fld];
  // atualiza rodapé do card para mostrar "Salvar"
  const card=document.querySelector(`[data-card="${gid}"] .cardfoot`);
  if(card) card.innerHTML=`<button class="savebtn" data-save="${gid}">Salvar</button>`;
}
async function savePalpite(gid){
  if(!me){banner("Escolha seu nome primeiro.");return;}
  const v=getVal(gid);
  try{
    await setDoc(doc(db,"palpites",`${gid}__${me}`),
      {gameId:gid,name:me,casa:v.c,fora:v.f,ts:serverTimestamp()},{merge:true});
    pending.delete(gid);
    const card=document.querySelector(`[data-card="${gid}"] .cardfoot`);
    if(card) card.innerHTML=`<span class="st-ok">✓ salvo!</span>`;
  }catch(e){ banner("Não salvou: "+(e.code||e.message)); }
}
async function saveResult(gid){
  const c=parseInt(document.getElementById("ac_"+gid).value,10);
  const f=parseInt(document.getElementById("af_"+gid).value,10);
  await setDoc(doc(db,"games",String(gid)),{ga:Number.isFinite(c)?c:null,gb:Number.isFinite(f)?f:null},{merge:true});
}
async function seedData(){
  if(!confirm("Gravar 72 jogos, participantes e os palpites/resultados já existentes?"))return;
  const b=writeBatch(db);
  GAMES_SEED.forEach(([id,rod,casa,fora,kickoff])=>{ const r=RESULTS_SEED[id];
    b.set(doc(db,"games",String(id)),{id,rod,casa,fora,kickoff,ga:r?r[0]:null,gb:r?r[1]:null},{merge:true}); });
  b.set(doc(db,"config","bolao"),{participants:PARTS_SEED,scoring:SCORING},{merge:true});
  Object.entries(PALP_SEED).forEach(([gid,o])=>Object.entries(o).forEach(([n,v])=>
    b.set(doc(db,"palpites",`${gid}__${n}`),{gameId:+gid,name:n,casa:v[0],fora:v[1]},{merge:true})));
  await b.commit(); banner("Dados gravados! ✅");
}
async function addParticipant(){
  const n=document.getElementById("newPart").value.trim(); if(!n)return;
  const s=new Set(parts()); s.add(n);
  await setDoc(doc(db,"config","bolao"),{participants:[...s]},{merge:true});
  document.getElementById("newPart").value="";
}

/* ---------- WhatsApp ---------- */
function share(text){
  if(navigator.share){ navigator.share({text}).catch(()=>{}); }
  else window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank");
}
function shareMyDay(k){
  if(!me){banner("Escolha seu nome primeiro.");return;}
  const gs=gamesArr().filter(g=>blockKey(g)===k);
  const lbl=gs.length?blockLabel(gs[0]):"";
  let lines=[`🎯 Palpites de ${me} — ${lbl}`,""];
  gs.forEach(g=>{ const my=palpiteOf(g.id,me);
    lines.push(`${FLAG[g.casa]||""} ${g.casa} ${my?`${my.casa} × ${my.fora}`:"—"} ${g.fora} ${FLAG[g.fora]||""}`); });
  share(lines.join("\n"));
}
function shareResults(){
  const ps=parts(), t=totals();
  const done=gamesArr().filter(g=>g.ga!=null&&g.gb!=null);
  // pega o último dia com resultado
  const lastKey=done.length?blockKey(done[done.length-1]):null;
  const dayGames=done.filter(g=>blockKey(g)===lastKey);
  let lines=[`📊 Resultados — ${dayGames.length?blockLabel(dayGames[0]):"Copa 2026"}`,""];
  dayGames.forEach(g=>lines.push(`${FLAG[g.casa]||""} ${g.casa} ${g.ga} × ${g.gb} ${g.fora} ${FLAG[g.fora]||""}`));
  const arr=ps.map(p=>({p,pts:t[p].pts,e:t[p].e,s:t[p].s})).sort((a,b)=>b.pts-a.pts||b.e-a.e||b.s-a.s);
  lines.push("","🏆 Classificação geral:");
  arr.forEach((o,i)=>lines.push(`${i+1}º ${o.p} — ${o.pts} pts`));
  share(lines.join("\n"));
}

/* ===================== UI / EVENTOS ===================== */
function banner(m){ const b=document.getElementById("banner"); b.textContent=m; b.style.display="block"; }

document.getElementById("nameSel").addEventListener("change",e=>{
  me=e.target.value; localStorage.setItem("bolao_nome",me); pending.clear(); renderAll();
});
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));
  t.classList.add("active"); document.getElementById(t.dataset.v).classList.add("active");
});
// tamanho do texto (acessibilidade)
const sizes=["s","m","l","xl"]; let szi=sizes.indexOf(localStorage.getItem("bolao_sz")||"m");
function applySize(){ document.documentElement.dataset.size=sizes[szi]; localStorage.setItem("bolao_sz",sizes[szi]); }
applySize();
document.getElementById("szUp").onclick=()=>{ szi=Math.min(sizes.length-1,szi+1); applySize(); };
document.getElementById("szDown").onclick=()=>{ szi=Math.max(0,szi-1); applySize(); };

document.getElementById("blocks").addEventListener("click",e=>{
  const head=e.target.closest(".dayhead");
  if(head){ const body=head.nextElementSibling; const open=body.style.display!=="none";
    body.style.display=open?"none":""; head.querySelector(".daymeta").innerHTML=head.querySelector(".daymeta").innerHTML.replace(open?"▾":"▸",open?"▸":"▾"); return; }
  const st=e.target.closest(".step"); if(st){ step(+st.dataset.g,st.dataset.fld,+st.dataset.d); return; }
  const sv=e.target.closest("[data-save]"); if(sv){ savePalpite(+sv.dataset.save); return; }
  const sh=e.target.closest("[data-share]"); if(sh){ shareMyDay(sh.dataset.share); return; }
});
document.getElementById("shareResults").onclick=shareResults;
document.getElementById("adminUnlock").onclick=()=>{
  if(document.getElementById("adminCode").value===ADMIN_CODE){
    isAdmin=true; document.getElementById("adminPanel").style.display="block";
    document.getElementById("adminGate").style.display="none"; renderAdmin();
  } else banner("Código incorreto.");
};
document.getElementById("adminGames").addEventListener("click",e=>{
  const b=e.target.closest("[data-res]"); if(b) saveResult(+b.dataset.res);
});
document.getElementById("adminGameSel").addEventListener("change",prefillAdminBet);
document.getElementById("adminPartSel").addEventListener("change",prefillAdminBet);
document.getElementById("saveAdminBet").onclick=saveAdminBet;
document.getElementById("seedBtn").onclick=seedData;
document.getElementById("addBtn").onclick=addParticipant;

renderAll();
