import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, writeBatch, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig, ADMIN_CODE } from "./firebase-config.js";

/* ============ DADOS BASE (para semear o banco na 1ª vez) ============ */
const GAMES_SEED = [
 [1,1,"11/06 qui","México","África do Sul"],[2,1,"11/06 qui","Coreia do Sul","Rep. Tcheca"],
 [3,1,"12/06 sex","Canadá","Bósnia e Herzegovina"],[4,1,"12/06 sex","Estados Unidos","Paraguai"],
 [5,1,"14/06 dom","Austrália","Turquia"],[6,1,"13/06 sáb","Catar","Suíça"],
 [7,1,"13/06 sáb","Brasil","Marrocos"],[8,1,"13/06 sáb","Haiti","Escócia"],
 [9,1,"14/06 dom","Alemanha","Curaçao"],[10,1,"14/06 dom","Holanda","Japão"],
 [11,1,"14/06 dom","Costa do Marfim","Equador"],[12,1,"14/06 dom","Suécia","Tunísia"],
 [13,1,"15/06 seg","Espanha","Cabo Verde"],[14,1,"15/06 seg","Bélgica","Egito"],
 [15,1,"15/06 seg","Arábia Saudita","Uruguai"],[16,1,"15/06 seg","Irã","Nova Zelândia"],
 [17,1,"16/06 ter","Argentina","Argélia"],[18,1,"16/06 ter","França","Senegal"],
 [19,1,"16/06 ter","Iraque","Noruega"],[20,1,"17/06 qua","Áustria","Jordânia"],
 [21,1,"17/06 qua","Portugal","RD Congo"],[22,1,"17/06 qua","Inglaterra","Croácia"],
 [23,1,"17/06 qua","Gana","Panamá"],[24,1,"17/06 qua","Uzbequistão","Colômbia"],
 [25,2,"18/06 qui","Rep. Tcheca","África do Sul"],[26,2,"18/06 qui","Suíça","Bósnia e Herzegovina"],
 [27,2,"18/06 qui","Canadá","Catar"],[28,2,"18/06 qui","México","Coreia do Sul"],
 [29,2,"19/06 sex","Turquia","Paraguai"],[30,2,"19/06 sex","Estados Unidos","Austrália"],
 [31,2,"19/06 sex","Escócia","Marrocos"],[32,2,"19/06 sex","Brasil","Haiti"],
 [33,2,"20/06 sáb","Holanda","Suécia"],[34,2,"20/06 sáb","Alemanha","Costa do Marfim"],
 [35,2,"20/06 sáb","Equador","Curaçao"],[36,2,"21/06 dom","Tunísia","Japão"],
 [37,2,"21/06 dom","Espanha","Arábia Saudita"],[38,2,"21/06 dom","Bélgica","Irã"],
 [39,2,"21/06 dom","Uruguai","Cabo Verde"],[40,2,"21/06 dom","Nova Zelândia","Egito"],
 [41,2,"22/06 seg","Argentina","Áustria"],[42,2,"22/06 seg","França","Iraque"],
 [43,2,"22/06 seg","Noruega","Senegal"],[44,2,"23/06 ter","Jordânia","Argélia"],
 [45,2,"23/06 ter","Inglaterra","Gana"],[46,2,"23/06 ter","Portugal","Uzbequistão"],
 [47,2,"23/06 ter","Panamá","Croácia"],[48,2,"23/06 ter","Colômbia","RD Congo"],
 [49,3,"24/06 qua","Suíça","Canadá"],[50,3,"24/06 qua","Bósnia e Herzegovina","Catar"],
 [51,3,"24/06 qua","Escócia","Brasil"],[52,3,"24/06 qua","Marrocos","Haiti"],
 [53,3,"24/06 qua","Rep. Tcheca","México"],[54,3,"24/06 qua","África do Sul","Coreia do Sul"],
 [55,3,"25/06 qui","Equador","Alemanha"],[56,3,"25/06 qui","Curaçao","Costa do Marfim"],
 [57,3,"25/06 qui","Japão","Suécia"],[58,3,"25/06 qui","Tunísia","Holanda"],
 [59,3,"25/06 qui","Turquia","Estados Unidos"],[60,3,"25/06 qui","Paraguai","Austrália"],
 [61,3,"26/06 sex","Noruega","França"],[62,3,"26/06 sex","Senegal","Iraque"],
 [63,3,"26/06 sex","Cabo Verde","Arábia Saudita"],[64,3,"26/06 sex","Uruguai","Espanha"],
 [65,3,"27/06 sáb","Egito","Irã"],[66,3,"27/06 sáb","Nova Zelândia","Bélgica"],
 [67,3,"27/06 sáb","Panamá","Inglaterra"],[68,3,"27/06 sáb","Croácia","Gana"],
 [69,3,"27/06 sáb","Colômbia","Portugal"],[70,3,"27/06 sáb","RD Congo","Uzbequistão"],
 [71,3,"27/06 sáb","Argélia","Áustria"],[72,3,"27/06 sáb","Jordânia","Argentina"],
];
const PARTS_SEED = ["Igor","Taci","Lucas","Isa","Bruno","Ivo","Ione","Murilo","Tiago","Greice"];
const RESULTS_SEED = {1:[2,0],2:[2,1],3:[1,1],4:[4,1],6:[1,1],7:[1,1]};
const PALP_SEED = {
 2:{Igor:[2,2],Taci:[3,0],Lucas:[1,0],Isa:[2,1],Bruno:[3,1],Ivo:[1,0],Murilo:[2,1],Tiago:[1,1],Ione:[1,1]},
 3:{Isa:[3,0],Bruno:[0,0],Igor:[2,2],Lucas:[2,0],Taci:[4,0],Murilo:[2,0],Ivo:[1,2],Ione:[1,0],Tiago:[2,0]},
 4:{Isa:[3,1],Bruno:[0,0],Igor:[2,2],Lucas:[2,1],Taci:[3,3],Murilo:[2,2],Ivo:[1,1],Ione:[2,1],Tiago:[3,1],Greice:[2,1]},
 5:{Isa:[1,2],Bruno:[1,0],Lucas:[1,1],Igor:[3,1],Taci:[2,2],Murilo:[0,2],Tiago:[0,2],Greice:[0,1]},
 6:{Isa:[1,2],Bruno:[2,1],Murilo:[0,3],Greice:[0,2],Tiago:[1,2],Igor:[1,3],Lucas:[0,1],Taci:[2,1],Ivo:[0,3],Ione:[0,2]},
 7:{Isa:[3,2],Bruno:[3,2],Murilo:[3,1],Greice:[2,1],Tiago:[2,1],Igor:[3,0],Lucas:[2,1],Taci:[1,0],Ivo:[2,1],Ione:[3,1]},
 8:{Isa:[0,1],Bruno:[0,2],Murilo:[1,2],Greice:[1,1],Tiago:[0,3],Igor:[1,2],Lucas:[0,1],Taci:[0,0],Ivo:[1,3],Ione:[1,0]},
};
const SCORING = {exato:10, saldo:7, venc:5};

/* ============ FIREBASE ============ */
let db, ready=false;
try{
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  const auth = getAuth(app);
  signInAnonymously(auth).catch(e=>banner("Erro de login anônimo: "+e.message+" — habilite o provedor Anônimo no Firebase Auth."));
  onAuthStateChanged(auth, u=>{ if(u && !ready){ ready=true; startListeners(); } });
}catch(e){
  banner("Firebase não configurado. Edite firebase-config.js com os dados do seu projeto. ("+e.message+")");
}

/* ============ ESTADO LOCAL (espelho do banco) ============ */
const STATE = { games:{}, palpites:{}, config:{participants:PARTS_SEED.slice(), scoring:SCORING, lockedRounds:[]} };
let me = localStorage.getItem("bolao_nome") || "";
let isAdmin = false;

function startListeners(){
  onSnapshot(collection(db,"games"), s=>{ s.forEach(d=>STATE.games[d.id]=d.data()); renderAll(); });
  onSnapshot(collection(db,"palpites"), s=>{ STATE.palpites={}; s.forEach(d=>STATE.palpites[d.id]=d.data()); renderAll(); });
  onSnapshot(doc(db,"config","bolao"), d=>{ if(d.exists()) STATE.config=d.data(); renderAll(); });
}

/* ============ PONTUAÇÃO ============ */
function pts(pc,pf,gc,gf){
  if(pc==null||pf==null||gc==null||gf==null) return null;
  if(pc===gc&&pf===gf) return SCORING.exato;
  const sg=x=>Math.sign(x);
  if(sg(pc-pf)===sg(gc-gf)) return (pc-pf)===(gc-gf)?SCORING.saldo:SCORING.venc;
  return 0;
}
const gamesArr = ()=>Object.values(STATE.games).sort((a,b)=>a.id-b.id);
const palpiteOf = (gid,name)=>STATE.palpites[`${gid}__${name}`];
function isLocked(g){
  if(g.ga!=null&&g.gb!=null) return true;
  return (STATE.config.lockedRounds||[]).includes(g.rod);
}

/* ============ RENDER ============ */
function renderAll(){ renderName(); renderGames(); renderBoard(); renderConfer(); renderAdmin(); }

function renderName(){
  const sel=document.getElementById("nameSel");
  const parts=STATE.config.participants||[];
  sel.innerHTML=`<option value="">— escolha seu nome —</option>`+
    parts.map(p=>`<option value="${p}" ${p===me?"selected":""}>${p}</option>`).join("");
  document.getElementById("hello").textContent = me ? `Apostando como ${me}` : "Escolha seu nome para apostar";
}

let FILTER="all";
function renderGames(){
  const box=document.getElementById("gamesList"); if(!box) return;
  const arr=gamesArr().filter(g=> FILTER==="all"?true: FILTER==="abertas"? !isLocked(g): String(g.rod)===FILTER);
  if(!me){ box.innerHTML=`<p class="empty">Escolha seu nome no topo para lançar os palpites.</p>`; return; }
  box.innerHTML="";
  arr.forEach(g=>{
    const locked=isLocked(g);
    const my=palpiteOf(g.id,me);
    const hasRes=g.ga!=null&&g.gb!=null;
    const pt = (my&&hasRes)? pts(my.casa,my.fora,g.ga,g.gb): null;
    const card=document.createElement("div"); card.className="game"+(locked?" locked":"");
    card.innerHTML=`
      <div class="grow">
        <div class="match">${g.casa} <span class="vs">×</span> ${g.fora}</div>
        <div class="meta">${g.rod}ª rodada · ${g.data} ${hasRes?`· <b class="res">${g.ga}×${g.gb}</b>`:""} ${locked&&!hasRes?'· <span class="lk">🔒 travado</span>':""}</div>
      </div>
      <div class="entry">
        <input class="num" inputmode="numeric" id="c_${g.id}" value="${my?my.casa:""}" ${locked?"disabled":""}>
        <span class="x">×</span>
        <input class="num" inputmode="numeric" id="f_${g.id}" value="${my?my.fora:""}" ${locked?"disabled":""}>
        ${locked
          ? `<span class="badge ${pt!=null?'b'+pt:''}">${pt!=null?pt:(my?"—":"·")}</span>`
          : `<button class="save" data-g="${g.id}">Salvar</button>`}
      </div>`;
    box.appendChild(card);
  });
}

function totals(){
  const t={}; (STATE.config.participants||[]).forEach(p=>t[p]={pts:0,e:0,s:0,v:0,n:0});
  gamesArr().forEach(g=>{
    (STATE.config.participants||[]).forEach(p=>{
      const my=palpiteOf(g.id,p); if(!my) return;
      t[p].n++;
      if(g.ga!=null&&g.gb!=null){
        const pt=pts(my.casa,my.fora,g.ga,g.gb);
        t[p].pts+=pt; if(pt===10)t[p].e++; else if(pt===7)t[p].s++; else if(pt===5)t[p].v++;
      }
    });
  });
  return t;
}
function renderBoard(){
  const box=document.getElementById("boardList"); if(!box) return;
  const t=totals();
  const arr=(STATE.config.participants||[]).map(p=>({p,...t[p]})).sort((a,b)=>b.pts-a.pts||b.e-a.e||b.s-a.s);
  box.innerHTML="";
  arr.forEach((o,i)=>{
    const pos=i+1;
    const r=document.createElement("div"); r.className="row"+(pos<=3?" p"+pos:"")+(o.p===me?" meRow":"");
    r.innerHTML=`<div class="pos">${pos}</div>
      <div><div class="who">${o.p}${o.p===me?' <span class="tag">você</span>':''}</div>
      <div class="break"><b>${o.e}</b> exatos · <b>${o.s}</b> saldo · <b>${o.v}</b> venc · ${o.n} palpites</div></div>
      <div class="ptsBig">${o.pts}<small>pts</small></div>`;
    box.appendChild(r);
  });
  const top=arr[0];
  document.getElementById("leaderline").textContent = top&&top.pts>0 ? `Líder: ${top.p} (${top.pts} pts)` : "Bolão começando…";
}

function renderConfer(){
  const t=document.getElementById("conferTable"); if(!t) return;
  const parts=STATE.config.participants||[];
  const withPal=gamesArr().filter(g=>parts.some(p=>palpiteOf(g.id,p)));
  let html="<thead><tr><th>Jogo</th><th>Res.</th>"+parts.map(p=>`<th>${p}</th>`).join("")+"</tr></thead><tbody>";
  withPal.forEach(g=>{
    const hasRes=g.ga!=null&&g.gb!=null;
    html+=`<tr><td class="jogo">${g.casa} × ${g.fora}</td><td class="res">${hasRes?`${g.ga}×${g.gb}`:"—"}</td>`;
    parts.forEach(p=>{
      const my=palpiteOf(g.id,p);
      if(!my){ html+=`<td class="miss">·</td>`; return; }
      const pt=hasRes?pts(my.casa,my.fora,g.ga,g.gb):null;
      const cls=pt===10?"p10":pt===7?"p7":pt===5?"p5":"";
      html+=`<td class="${cls}">${my.casa}×${my.fora}</td>`;
    });
    html+="</tr>";
  });
  t.innerHTML=html+"</tbody>";
}

function renderAdmin(){
  const box=document.getElementById("adminGames"); if(!box||!isAdmin) return;
  box.innerHTML="";
  gamesArr().forEach(g=>{
    const row=document.createElement("div"); row.className="arow";
    row.innerHTML=`<div class="agame">${g.id}. ${g.casa} × ${g.fora} <small>(${g.rod}ª)</small></div>
      <input class="num" id="ac_${g.id}" value="${g.ga??""}">
      <span class="x">×</span>
      <input class="num" id="af_${g.id}" value="${g.gb??""}">
      <button class="save" data-res="${g.id}">OK</button>`;
    box.appendChild(row);
  });
  // travas de rodada
  const lr=STATE.config.lockedRounds||[];
  document.getElementById("lockRounds").innerHTML=[1,2,3].map(r=>
    `<button class="chip ${lr.includes(r)?'active':''}" data-lock="${r}">${lr.includes(r)?'🔒':'🔓'} ${r}ª rodada</button>`).join("");
}

/* ============ AÇÕES ============ */
async function savePalpite(gid){
  if(!me){ banner("Escolha seu nome primeiro."); return; }
  const c=parseInt(document.getElementById("c_"+gid).value,10);
  const f=parseInt(document.getElementById("f_"+gid).value,10);
  if(!Number.isFinite(c)||!Number.isFinite(f)){ banner("Preencha os dois placares."); return; }
  try{
    await setDoc(doc(db,"palpites",`${gid}__${me}`),
      {gameId:gid, name:me, casa:c, fora:f, ts:serverTimestamp()}, {merge:true});
    flash("c_"+gid);
  }catch(e){ banner("Erro ao salvar: "+e.message); }
}
async function saveResult(gid){
  const c=parseInt(document.getElementById("ac_"+gid).value,10);
  const f=parseInt(document.getElementById("af_"+gid).value,10);
  const ga=Number.isFinite(c)?c:null, gb=Number.isFinite(f)?f:null;
  await setDoc(doc(db,"games",String(gid)), {ga,gb}, {merge:true});
}
async function toggleLock(r){
  const lr=new Set(STATE.config.lockedRounds||[]);
  lr.has(r)?lr.delete(r):lr.add(r);
  await setDoc(doc(db,"config","bolao"), {lockedRounds:[...lr]}, {merge:true});
}
async function seedData(){
  if(!confirm("Isto grava os 72 jogos, participantes e os palpites/resultados já existentes no banco. Continuar?")) return;
  const batch=writeBatch(db);
  GAMES_SEED.forEach(([id,rod,data,casa,fora])=>{
    const r=RESULTS_SEED[id];
    batch.set(doc(db,"games",String(id)), {id,rod,data,casa,fora, ga:r?r[0]:null, gb:r?r[1]:null}, {merge:true});
  });
  batch.set(doc(db,"config","bolao"), {participants:PARTS_SEED, scoring:SCORING, lockedRounds:[]}, {merge:true});
  Object.entries(PALP_SEED).forEach(([gid,obj])=>Object.entries(obj).forEach(([nome,v])=>{
    batch.set(doc(db,"palpites",`${gid}__${nome}`), {gameId:+gid, name:nome, casa:v[0], fora:v[1]}, {merge:true});
  }));
  await batch.commit();
  banner("Dados base gravados! ✅");
}
async function addParticipant(){
  const n=document.getElementById("newPart").value.trim(); if(!n) return;
  const parts=new Set(STATE.config.participants||[]); parts.add(n);
  await setDoc(doc(db,"config","bolao"), {participants:[...parts]}, {merge:true});
  document.getElementById("newPart").value="";
}

/* ============ UI helpers ============ */
function banner(msg){ const b=document.getElementById("banner"); b.textContent=msg; b.style.display="block"; }
function flash(id){ const el=document.getElementById(id); if(!el)return; el.classList.add("ok"); setTimeout(()=>el.classList.remove("ok"),700); }

document.getElementById("nameSel").addEventListener("change",e=>{
  me=e.target.value; localStorage.setItem("bolao_nome",me); renderAll();
});
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));
  t.classList.add("active"); document.getElementById(t.dataset.v).classList.add("active");
});
document.getElementById("filters").addEventListener("click",e=>{
  const c=e.target.closest(".chip"); if(!c)return;
  document.querySelectorAll("#filters .chip").forEach(x=>x.classList.remove("active"));
  c.classList.add("active"); FILTER=c.dataset.r; renderGames();
});
document.getElementById("gamesList").addEventListener("click",e=>{
  const b=e.target.closest(".save"); if(b) savePalpite(+b.dataset.g);
});
document.getElementById("adminUnlock").onclick=()=>{
  if(document.getElementById("adminCode").value===ADMIN_CODE){ isAdmin=true; document.getElementById("adminPanel").style.display="block"; document.getElementById("adminGate").style.display="none"; renderAdmin(); }
  else banner("Código incorreto.");
};
document.getElementById("adminGames").addEventListener("click",e=>{
  const b=e.target.closest(".save"); if(b) saveResult(+b.dataset.res);
});
document.getElementById("lockRounds").addEventListener("click",e=>{
  const b=e.target.closest(".chip"); if(b) toggleLock(+b.dataset.lock);
});
document.getElementById("seedBtn").onclick=seedData;
document.getElementById("addBtn").onclick=addParticipant;

renderAll();
