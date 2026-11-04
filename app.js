import OBR, { buildShape } from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";
import { CONDICOES, ESTIGMAS, BESTIARIO } from "./dados.js?v=1.5.0";
import { EFEITOS, AMBIENTES, tocar as tocarLocal, tocarUrl as tocarUrlLocal, setVolume as setVolLocal } from "./sons.js?v=1.5.0";
import { gerarEquipe, outroMembro, outraHistoriaEquipe, equipeTexto, membroTexto, NEXS, TEMAS, COMPOSICOES } from "./equipe.js?v=1.5.0";
import { gerarNpc, VDS, TIPOS, PAPEIS, TRACOS, aplicarTraco, outrasHabilidades, outraHistoria, outroNome, loreTexto } from "./gerador.js?v=1.5.0";
import { gerarEncontro, cenaEncontro, outroGrupo, encontroTexto, TEMAS_ENC, DIFICULDADES, ELEMENTOS_ENC, PAPEL_NOME } from "./encontro.js?v=1.5.0";

/* =========================================================
   Escudo do Mestre — Hexatombe (Owlbear Rodeo)
   Só para o mestre. Lê e altera as fichas da extensão
   "Ficha Ordem Paranormal" e lê o estado do "Hexatombe".
   As três extensões precisam estar no mesmo site
   (pebarrosdenashor.github.io) para dividirem o navegador.
   ========================================================= */

const NS = "io.github.pebarrosdenashor.mestre-hx";
const CH = NS + "/msg";
const RING = NS + "/anel";
const MODAL_ID = NS + "/modal";
const IS_MODAL = new URLSearchParams(location.search).has("modal");
const FICHA_NS = "io.github.pebarrosdenashor.ficha-op";
const FICHA_CH = FICHA_NS + "/sync";
const LINK_KEY = FICHA_NS + "/link";
const OPEN_KEY = FICHA_NS + ":open";
const FICHA_URL = "https://pebarrosdenashor.github.io/fichas-ordem-paranormal/index.html";
const HX_NS = "io.github.pebarrosdenashor.hexatombe";
const PUB_KEY = NS + "/publico";   // na sala: relógios, cronômetro e ambiente que todos veem/ouvem
const CENA_KEY = NS + "/cena";     // na cena: só um identificador, para as notas por cena
const FILA = () => `${NS}:fila:${roomId}`; // tokens mandados ao combate pelo menu do token
const FICHA_CFG = FICHA_NS + "/cfg";  // na sala: efeitos visuais das fichas (animação de ritual, críticos na tela de todos)
const susKey = () => `${NS}:sus:${roomId}`; // quem leu / respondeu aos sussurros (o fundo grava)
const SUS_ESTILOS = [["sussurro", "🌫 Sussurro (letra por letra, tremendo)"], ["outro", "🩸 Voz do Outro Lado (vermelho, embaralhado)"], ["pensamento", "❄ Pensamento intrusivo (azul, palavra por palavra)"], ["bilhete", "📜 Bilhete (papel)"]];
const SUS_SONS = [["sussurros", "🗣 com sussurros"], ["respiracao", "😮‍💨 com respiração"], ["estatica", "📻 com estática"], ["coracao", "❤ com coração"], ["caixinha", "🎶 com caixinha"], ["", "🔇 sem som"]];

/* ---------- Regras (iguais às da ficha) ---------- */
const ATTRS = [["FOR", "Força"], ["AGI", "Agilidade"], ["INT", "Intelecto"], ["VIG", "Vigor"], ["PRE", "Presença"]];
const ATTR_KEYS = ATTRS.map(([a]) => a);
const PERICIAS = [
  ["Acrobacia", "AGI"], ["Adestramento", "PRE"], ["Artes", "PRE"], ["Atletismo", "FOR"], ["Atualidades", "INT"], ["Ciências", "INT"],
  ["Crime", "AGI"], ["Diplomacia", "PRE"], ["Enganação", "PRE"], ["Fortitude", "VIG"], ["Furtividade", "AGI"], ["Iniciativa", "AGI"],
  ["Intimidação", "PRE"], ["Intuição", "PRE"], ["Investigação", "INT"], ["Luta", "FOR"], ["Medicina", "INT"], ["Ocultismo", "INT"],
  ["Percepção", "PRE"], ["Pilotagem", "AGI"], ["Pontaria", "AGI"], ["Profissão", "INT"], ["Reflexos", "AGI"], ["Religião", "PRE"],
  ["Sobrevivência", "INT"], ["Tática", "INT"], ["Tecnologia", "INT"], ["Vontade", "PRE"],
];
const PER_ATTR = Object.fromEntries(PERICIAS);
const COND_MAP = Object.fromEntries(CONDICOES.map(([n, d, e]) => [n, { d, e }]));
const FASES = ["Preparação", "Execução", "Conclusão"];
const NOMES = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Glória", "Hugo", "Iara", "João", "Kátia", "Lucas", "Marta", "Nilo", "Olga", "Paulo", "Quitéria", "Rafael", "Sônia", "Túlio", "Úrsula", "Vítor", "Wanda", "Yara", "Zeca", "Benedita", "Caetano", "Dalva", "Ernesto", "Filomena", "Gervásio", "Heloísa", "Irineu", "Jussara", "Leopoldo", "Mirela", "Norberto", "Odete", "Raimundo", "Severina"];
const SOBRENOMES = ["Silva", "Souza", "Oliveira", "Pereira", "Costa", "Almeida", "Nogueira", "Barros", "Ferraz", "Teixeira", "Rocha", "Vasconcelos", "Moraes", "Cardoso", "Prado", "Siqueira", "Bittencourt", "Fonseca", "Lacerda", "Quintana"];
const APELIDOS = ["o Coveiro", "a Muda", "o Palhaço", "a Sem-Dente", "o Pastor", "a Costureira", "o Domador", "a Viúva", "o Sineiro", "a Equilibrista", "o Faquir", "a Cartomante"];

/* ---------- Utilidades ---------- */
const num = (v) => Number(v) || 0;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const fmt = (n) => (n >= 0 ? `+${n}` : `−${-n}`);
const die = (f) => 1 + Math.floor(Math.random() * f);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const hora = (t) => new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }
function readJSON(k, def) { try { return JSON.parse(lsGet(k) || "null") ?? def; } catch { return def; } }

function rollTest(n) {
  const k = n > 0 ? n : 2 - n; const dice = Array.from({ length: Math.min(k, 20) }, () => die(20));
  return { dice, pick: n > 0 ? Math.max(...dice) : Math.min(...dice), worst: n <= 0 };
}
function rollExpr(expr) {
  const str = String(expr || "").replace(/\s+/g, "").toLowerCase();
  const re = /([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/g; let m, total = 0; const parts = [];
  while ((m = re.exec(str))) {
    if (m[3]) {
      const sign = m[1] === "-" ? -1 : 1; const qty = Math.min(Number(m[2]) || 1, 100); const f = Number(m[3]);
      const rs = Array.from({ length: qty }, () => die(f)); total += sign * rs.reduce((a, b) => a + b, 0);
      parts.push(`${sign < 0 ? "−" : ""}${qty}d${f}[${rs.join(",")}]`);
    } else { const v = (m[4] === "-" ? -1 : 1) * Number(m[5]); total += v; parts.push(fmt(v)); }
  }
  return { total, txt: parts.join(" "), ok: parts.length > 0 };
}
// "3d20+10" → teste de criatura (fica com o maior d20)
function rollMonster(expr, extra = 0) {
  const m = /^(\d+)d20([+-]\d+)?$/.exec(String(expr || "1d20").replace(/\s+/g, ""));
  if (!m) { const r = rollExpr(expr); return { total: r.total + extra, pick: 0, txt: r.txt }; }
  const r = rollTest(Number(m[1])); const b = num(m[2]) + num(extra);
  return { total: r.pick + b, pick: r.pick, txt: `[${r.dice.join(", ")}] → ${r.pick}${b ? " " + fmt(b) : ""} = ${r.pick + b}` };
}

/* ---------- Estado ---------- */
let obrOk = false, sceneOk = false, role = "PLAYER", roomId = "local";
let me = { id: "local", name: "Mestre" };
let party = [];
let pub = null;      // parte pública (relógios, cronômetro, ambiente), guardada na sala
let cenaId = null;   // identificador da cena aberta, para as notas
let tab = lsGet(NS + ":tab") || "mesa";
const ui = { open: {}, cOpen: {}, logFiltro: "todas", secRes: null, grupo: {}, secSel: null, nome: "", alvo: {} };
const isGM = () => role === "GM";
const fichaKey = () => `${FICHA_NS}:${roomId}`;
const hxKey = () => `${HX_NS}:state:${roomId}`;
const mineKey = () => `${NS}:${roomId}`;
const logKey = () => `${NS}:log:${roomId}`;

function defMine() {
  return { combate: { lista: [], vez: 0, rodada: 1, ativo: false, anel: true, anunciar: true, seguir: false }, ocultas: [], notas: "", soOnline: false, undo: [],
    npcs: [], cenas: {}, relogios: [], timer: null, amb: { loops: [], url: "", urlVol: 0.6, vols: {} }, gen: { tipo: "Sangue", vd: 40, papel: "comum", traco: "nenhum" },
    sonsLink: [], cenasSom: [], susFav: [], sussurros: [] };
}
let mine = defMine();
function loadMine() {
  const m = readJSON(mineKey(), null); const d = defMine();
  mine = { ...d, ...(m || {}), combate: { ...d.combate, ...(m?.combate || {}) }, amb: { ...d.amb, ...(m?.amb || {}) }, gen: { ...d.gen, ...(m?.gen || {}) } };
  for (const k of ["sonsLink", "cenasSom", "susFav", "sussurros"]) if (!Array.isArray(mine[k])) mine[k] = [];
  mine.amb.vols ||= {};
}
function saveMine() { lsSet(mineKey(), JSON.stringify(mine)); }

/* ---------- Fichas ---------- */
function readFichas() {
  const st = readJSON(fichaKey(), null) || { own: {}, others: {}, currentId: null };
  st.own ||= {}; st.others ||= {}; return st;
}
function allSheets() {
  const st = readFichas();
  return [...Object.values(st.others), ...Object.values(st.own)].filter((s) => s?.id && s.header)
    .sort((a, b) => String(a.header.personagem).localeCompare(String(b.header.personagem), "pt-BR"));
}
function getSheet(id) { const st = readFichas(); return st.others[id] || st.own[id] || null; }
function panelSheets() {
  const online = new Set(party.map((p) => p.id));
  return allSheets().filter((s) => !mine.ocultas.includes(s.id) && (!mine.soOnline || online.has(s.owner?.id)));
}
const isDet = (s) => s?.regra !== "padrao";
const resSig = (s) => (isDet(s) ? "PD" : "PE");
const nomeS = (s) => s?.header?.personagem || "Sem nome";

const CHUNK = 5000;
async function fichaSend(msg) {
  if (!obrOk) return;
  const str = JSON.stringify(msg); const n = Math.max(1, Math.ceil(str.length / CHUNK)); const m = uid();
  for (let i = 0; i < n; i++) {
    try { await OBR.broadcast.sendMessage(FICHA_CH, { m, i, n, d: str.slice(i * CHUNK, (i + 1) * CHUNK) }); } catch { return; }
    if (n > 1) await sleep(70);
  }
}
function tokenData(s) {
  return {
    sheetId: s.id, ownerId: s.owner?.id || me.id, nome: s.header.personagem,
    pv: [num(s.pv.atual), num(s.pv.max)], pd: isDet(s) ? [num(s.pd.atual), num(s.pd.max)] : [num(s.san?.atual), num(s.san?.max)],
    cor2: isDet(s) ? "#7b5cff" : "#2f9ed1", todos: s.token?.barrasTodos !== false,
  };
}
async function syncToken(s) {
  if (!sceneOk) return;
  try {
    const items = await OBR.scene.items.getItems((it) => it.metadata?.[LINK_KEY]?.sheetId === s.id);
    if (items.length) await OBR.scene.items.updateItems(items.map((i) => i.id), (ds) => { for (const d of ds) d.metadata[LINK_KEY] = tokenData(s); });
  } catch { /* sem cena ou sem permissão */ }
}
// Altera uma ficha, guarda para desfazer e envia ao dono (e aos tokens)
function applySheet(id, fn, desc = "") {
  const st = readFichas(); const s = st.others[id] || st.own[id];
  if (!s) { toast("Essa ficha não está neste navegador."); return null; }
  mine.undo.unshift({ id, json: JSON.stringify(s), desc: desc || nomeS(s), at: Date.now() }); mine.undo = mine.undo.slice(0, 15); saveMine();
  s.pv ||= { atual: 0, max: 0 }; s.pd ||= { atual: 0, max: 0 }; s.condicoes ||= [];
  fn(s);
  s.updatedAt = Date.now();
  lsSet(fichaKey(), JSON.stringify(st));
  fichaSend({ t: "sheet", sheet: s }); syncToken(s);
  return s;
}
function undoLast() {
  const u = mine.undo.shift(); if (!u) return;
  const st = readFichas(); const where = st.others[u.id] ? "others" : st.own[u.id] ? "own" : null;
  if (!where) { saveMine(); return toast("A ficha não existe mais."); }
  const s = JSON.parse(u.json); s.updatedAt = Date.now(); st[where][u.id] = s;
  lsSet(fichaKey(), JSON.stringify(st)); saveMine();
  fichaSend({ t: "sheet", sheet: s }); syncToken(s);
  toast(`Desfeito: ${u.desc}`); render();
}

/* ---------- Cálculos ---------- */
const attrVal = (s, a) => clamp(num(s.attrs?.[a]), 0, 5);
function activeConds(s) { const set = new Set(s.condicoes || []); for (const e of s.efeitos || []) if (e.cond) set.add(e.cond); return [...set]; }
function condFx(s) {
  const fx = { dAll: 0, dFis: 0, dMen: 0, dAtk: 0, dMelee: 0, dPer: {}, dAttr: {}, defs: new Set(), mov: new Set() };
  for (const c of activeConds(s)) {
    const e = COND_MAP[c]?.e; if (!e) continue;
    for (const k of ["dAll", "dFis", "dMen", "dAtk", "dMelee"]) if (e[k]) fx[k] = Math.max(fx[k], e[k]);
    if (e.dAttr) for (const [a, v] of Object.entries(e.dAttr)) fx.dAttr[a] = Math.max(fx.dAttr[a] || 0, v);
    if (e.dPer) for (const [p, v] of Object.entries(e.dPer)) fx.dPer[p] = Math.max(fx.dPer[p] || 0, v);
    if (e.def) fx.defs.add(e.def); if (e.mov) fx.mov.add(e.mov);
  }
  return fx;
}
function dicePenalty(s, attr, pericia) {
  const fx = condFx(s); let pen = fx.dAll;
  if (["FOR", "AGI", "VIG"].includes(attr)) pen += fx.dFis;
  if (["INT", "PRE"].includes(attr)) pen += fx.dMen;
  if (pericia && fx.dAttr[attr]) pen += fx.dAttr[attr];
  if (pericia && fx.dPer[pericia]) pen += fx.dPer[pericia];
  if (s.hexa?.desertor) pen += 1;
  return pen;
}
const hexaPen = (s) => -clamp(num(s.hexa?.pen), 0, 6);
function defesa(s) {
  const d = condFx(s).defs; let p = 0;
  if (d.has("indefeso")) p -= 10; else if (d.has("desprevenido")) p -= 5;
  if (d.has("vulneravel")) p -= 2;
  const prot = (s.protecoes || []).reduce((a, x) => a + num(x.defesa), 0);
  return 10 + attrVal(s, "AGI") + prot + num(s.defesa?.equip) + num(s.defesa?.outros) + p;
}
function desloc(s) {
  const mov = condFx(s).mov; let d = num(s.desloc);
  if (mov.has("lento")) d /= 2; if (mov.has("caido")) d = Math.min(d, 1.5); if (mov.has("imovel")) d = 0;
  return d;
}
// Teste de perícia ou atributo usando a ficha
function rollFor(s, key, extra = 0) {
  const isAttr = ATTR_KEYS.includes(key);
  const p = isAttr ? null : (s.pericias?.[key] || { attr: PER_ATTR[key] || "AGI", treino: 0, outros: 0 });
  const attr = isAttr ? key : p.attr;
  const pen = dicePenalty(s, attr, isAttr ? null : key);
  const r = rollTest(attrVal(s, attr) - pen);
  const bonus = (p ? num(p.treino) + num(p.outros) : 0) + hexaPen(s) + num(extra);
  return { ...r, bonus, total: r.pick + bonus, txt: `[${r.dice.join(", ")}]${r.worst ? " (pior)" : ""} → ${r.pick} ${fmt(bonus)} = ${r.pick + bonus}${pen ? ` (−${pen}d)` : ""}` };
}
function danoNaFicha(s, v) {
  const t = Math.min(num(s.pvTemp), v); s.pvTemp = num(s.pvTemp) - t;
  s.pv.atual = Math.max(0, num(s.pv.atual) - (v - t));
}
function curaNaFicha(s, v) { s.pv.atual = Math.min(num(s.pv.max), num(s.pv.atual) + v); if (num(s.pv.atual) > 0) s.morrendo = 0; }

/* ---------- Hexatombe ---------- */
function hx() { const s = readJSON(hxKey(), null); return s?.equipes ? s : null; }
function hxMember(sheetId, h = hx()) {
  if (!h) return null;
  for (const t of h.equipes) for (const m of t.membros || []) if (m.sheetId === sheetId) return { t, m };
  return null;
}
function hxMemberName(m, h) {
  if (m.npcId) { const n = (h.bestiario || []).find((c) => c.id === m.npcId); if (n) return n.nome; }
  const s = m.sheetId && getSheet(m.sheetId); return s ? nomeS(s) : m.nome || "?";
}
function bestiarioTodo() { const h = hx(); return [...BESTIARIO.map((c) => ({ ...c, _src: "livro" })), ...((h?.bestiario) || []).map((c) => ({ ...c, _src: "hexa" })), ...(mine.npcs || []).map((c) => ({ ...c, _src: "meus" }))]; }

/* ---------- Registro de rolagens do mestre ---------- */
function readLog() { return readJSON(logKey(), []); }
function addLog(text, who = "Mestre", secret = true) {
  const log = readLog(); log.unshift({ at: Date.now(), who, text, secret, src: "mestre" });
  lsSet(logKey(), JSON.stringify(log.slice(0, 250)));
}
function anunciar(text) {
  if (obrOk) OBR.broadcast.sendMessage(CH, { kind: "anuncio", text }).catch(() => {});
}

/* ---------- Visual ---------- */
const $app = document.getElementById("app");
let toastTimer;
function toast(text) {
  document.querySelector(".toast")?.remove();
  const t = document.createElement("div"); t.className = "toast"; t.textContent = text; document.body.appendChild(t);
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), 4000);
}
function bar(cls, a, m, label) {
  const f = num(m) > 0 ? clamp(num(a) / num(m), 0, 1) : 0;
  return `<div class="mbar ${cls}" title="${label} ${num(a)}/${num(m)}"><i style="width:${(f * 100).toFixed(1)}%"></i><span>${label} ${num(a)}/${num(m)}</span></div>`;
}
function ownerDot(s) {
  const on = party.some((p) => p.id === s.owner?.id) || s.owner?.id === me.id;
  return `<span class="dot ${on ? "on" : ""}" title="${on ? "Na sala" : "Fora da sala"}"></span>`;
}
function avatar(s) {
  return s.header?.img ? `<img class="av" src="${esc(s.header.img)}" alt="">` : `<span class="av">${esc(nomeS(s).slice(0, 1).toUpperCase())}</span>`;
}
function testeOptions(sel) {
  return `<optgroup label="Perícias">${PERICIAS.map(([n]) => `<option ${n === sel ? "selected" : ""}>${n}</option>`).join("")}</optgroup>
    <optgroup label="Atributos">${ATTRS.map(([a, n]) => `<option value="${a}" ${a === sel ? "selected" : ""}>${n}</option>`).join("")}</optgroup>`;
}
const testeNome = (k) => (ATTR_KEYS.includes(k) ? Object.fromEntries(ATTRS)[k] : k);

function viewLocked() {
  const p = pub || {}; const rel = p.relogios || [];
  return `<div class="locked"><div class="lockicon">🔒</div><h2>Privado para o mestre</h2>
    <p>Esta extensão é o escudo do mestre: só quem está como mestre na sala pode abri-la.</p>
    <p class="muted">Suas fichas e as regras do Hexatombe ficam nas outras extensões.</p></div>
    ${p.timer || rel.length ? `<section class="card mesa-pub"><h3>Na mesa agora</h3>
      ${p.timer ? `<div class="timer"><span>⏳ ${esc(p.timer.nome || "Cronômetro")}</span><b class="countdown" data-fim="${num(p.timer.fim)}">${restante(p.timer.fim)}</b></div>` : ""}
      <div class="clocks">${rel.map((r) => relogioSVG(r)).join("")}</div></section>` : ""}
    <section class="card"><h3>Sons do mestre</h3>
      <div class="row"><span>🔈</span><input type="range" min="0" max="100" step="5" id="volJog" value="${Math.round(volJogador() * 100)}"><span class="small muted" id="volTxt">${Math.round(volJogador() * 100)}%</span></div>
      <p class="muted small">Volume dos efeitos e da ambientação que o mestre tocar. Os sons saem pelo botão 🔊 no canto de baixo, à esquerda; se ele estiver 🔇 vermelho, clique nele uma vez para liberar o som.</p></section>`;
}
function volJogador() { const v = lsGet(`${NS}:vol`); return v === null ? 0.8 : clamp(Number(v) || 0, 0, 1); }

function render() {
  if (!isGM()) { $app.innerHTML = viewLocked(); return; }
  const tabs = [["mesa", "👥 Mesa"], ["secretas", "🙈 Secretas"], ["combate", "⚔ Combate"], ["cena", "🎭 Cena"], ["ferramentas", "🧰 Ferramentas"]];
  const body = { mesa: viewMesa, secretas: viewSecretas, combate: viewCombate, cena: viewCena, ferramentas: viewFerramentas }[tab] || viewMesa;
  $app.innerHTML = `<header class="top"><h2>Escudo do Mestre</h2><span class="row">
      ${mine.undo.length ? `<button class="icon" data-a="undo" title="Desfazer: ${esc(mine.undo[0].desc)}">↶</button>` : ""}
      <button class="icon" data-a="pedir" title="Pedir as fichas atualizadas aos jogadores">⟳</button>
      ${obrOk ? `<button class="icon" data-a="modal" title="${IS_MODAL ? "Fechar tela grande" : "Abrir em tela grande"}">${IS_MODAL ? "✕" : "⤢"}</button>` : ""}</span></header>
    <nav class="tabs">${tabs.map(([k, n]) => `<button class="${tab === k ? "on" : ""}" data-tab="${k}">${n}</button>`).join("")}</nav>
    <main>${body()}</main>`;
}
let pending = false;
function softRender() {
  const a = document.activeElement;
  if (a && $app.contains(a) && ["INPUT", "TEXTAREA", "SELECT"].includes(a.tagName)) { pending = true; return; }
  render();
}
$app.addEventListener("focusout", () => { if (pending) { pending = false; setTimeout(softRender, 50); } });
// lembra quais <details data-keep> estão abertos entre um desenho e outro
$app.addEventListener("toggle", (e) => { const k = e.target?.dataset?.keep; if (k) ui[k] = e.target.open; }, true);

/* ---------- Aba: Mesa ---------- */
function hxResumo() {
  const h = hx();
  if (!h) return `<section class="card muted small">Hexatombe não encontrado neste navegador. Abra a extensão do Hexatombe uma vez nesta sala.</section>`;
  const vivos = h.equipes.reduce((a, t) => a + (t.membros || []).filter((m) => m.vivo).length, 0);
  const hoje = (h.sacrificios || []).filter((s) => s.dia === h.dia).length;
  return `<section class="card hxr"><div class="hxline"><b>Dia ${num(h.dia)}</b> · ${FASES[num(h.fase)] || "?"} · ${vivos} vivos · sacrifícios ${(h.sacrificios || []).length}/6${hoje ? ` (${hoje} hoje)` : ""}${h.fracassou ? " · <span class=bad>ritual fracassado</span>" : ""}</div>
    <div class="teams">${h.equipes.filter((t) => (t.membros || []).length).map((t) => `<span class="team" style="--c:${esc(t.cor || "#888")}"><b>${esc(t.nome)}</b> 💧${num(t.agua)} 🍖${num(t.comida)} ⚙${num(t.sucata)}</span>`).join("")}</div></section>`;
}
function pcCard(s, h) {
  const open = !!ui.open[s.id]; const x = hxMember(s.id, h);
  const conds = activeConds(s);
  const morr = num(s.pv?.atual) <= 0;
  const tags = [
    x ? `<span class="tag" style="--c:${esc(x.t.cor || "#888")}">${esc(x.t.nome)}</span>` : "",
    x?.m.sac ? `<span class="tag sac" title="Sacrifício (só o mestre vê)">✠ ${esc(x.m.sac)}</span>` : "",
    x && !x.m.vivo ? `<span class="tag bad">morto</span>` : "",
    s.hexa?.desertor ? `<span class="tag bad">desertor</span>` : "",
    morr ? `<span class="tag bad">0 PV${num(s.morrendo) ? ` · morrendo ${num(s.morrendo)}` : ""}</span>` : "",
  ].join("");
  const head = `<div class="pchead" data-a="toggle" data-id="${s.id}">${avatar(s)}
      <div class="pcname"><b>${esc(nomeS(s))}</b><small>${ownerDot(s)}${esc(s.owner?.name || s.header.jogador || "?")} · ${esc(s.header.classe || "")} ${num(s.nex)}%</small><div class="tags">${tags}</div></div>
      <div class="pcbars">${bar("pv", s.pv?.atual, s.pv?.max, "PV")}${bar(isDet(s) ? "pd" : "pe", s.pd?.atual, s.pd?.max, resSig(s))}${isDet(s) ? "" : bar("san", s.san?.atual, s.san?.max, "SAN")}</div>
      <div class="pcdef" title="Defesa">🛡${defesa(s)}</div></div>
    ${conds.length ? `<div class="chips">${conds.map((c) => `<button class="chip on" data-a="condDel" data-id="${s.id}" data-c="${esc(c)}" title="${esc(COND_MAP[c]?.d || "")} — clique para tirar">${esc(c)} ✕</button>`).join("")}</div>` : ""}`;
  if (!open) return `<article class="pc">${head}</article>`;
  const hexa = s.hexa || {};
  const hexaLinhas = [
    num(hexa.pen) ? `−${num(hexa.pen)} em testes (sinos)` : "", num(hexa.semAgua) ? `${num(hexa.semAgua)} dia(s) sem água` : "",
    num(hexa.semComida) ? `${num(hexa.semComida)} dia(s) sem comida` : "", hexa.batalha ? `batalha de intenções contra ${esc(hexa.batalha)}` : "",
    (hexa.rewards || []).length ? `intenções cumpridas: ${(hexa.rewards || []).map(esc).join(", ")}` : "",
  ].filter(Boolean);
  return `<article class="pc open">${head}
    <div class="pcbody">
      <div class="grid5">${ATTRS.map(([a]) => `<div class="att"><small>${a}</small><b>${attrVal(s, a)}</b></div>`).join("")}</div>
      <div class="stats"><span>Defesa <b>${defesa(s)}</b></span><span>Desloc. <b>${desloc(s)}m</b></span>${num(s.rdGeral) ? `<span>RD <b>${num(s.rdGeral)}</b></span>` : ""}${num(s.pvTemp) ? `<span>PV temp. <b>${num(s.pvTemp)}</b></span>` : ""}<span>Morrendo <b>${num(s.morrendo)}</b></span>${isDet(s) ? "" : `<span>Enlouq. <b>${num(s.enlouquecendo)}</b></span>`}</div>
      <div class="row wrap act"><input type="number" min="0" class="n4" id="v-${s.id}" placeholder="valor">
        <button data-a="dano" data-id="${s.id}" class="danger">Dano</button><button data-a="cura" data-id="${s.id}">Cura</button>
        <button data-a="pd" data-d="-1" data-id="${s.id}">${resSig(s)}−</button><button data-a="pd" data-d="1" data-id="${s.id}">${resSig(s)}+</button>
        ${isDet(s) ? "" : `<button data-a="san" data-d="-1" data-id="${s.id}">SAN−</button><button data-a="san" data-d="1" data-id="${s.id}">SAN+</button>`}</div>
      <div class="row wrap act"><select id="c-${s.id}"><option value="">＋ condição…</option>${CONDICOES.map(([n]) => `<option>${esc(n)}</option>`).join("")}</select><button data-a="condAdd" data-id="${s.id}">Aplicar</button></div>
      <div class="row wrap act"><select id="t-${s.id}">${testeOptions(ui.lastTeste || "Percepção")}</select><button data-a="testeUm" data-id="${s.id}">🙈 Rolar em segredo</button></div>
      ${ui.res1?.id === s.id ? `<div class="res">${esc(ui.res1.txt)}</div>` : ""}
      ${hexaLinhas.length ? `<ul class="hexa">${hexaLinhas.map((l) => `<li>${l}</li>`).join("")}</ul>` : ""}
      <div class="row wrap foot"><button class="ghost" data-a="abrirFicha" data-id="${s.id}">📄 Abrir ficha</button><button class="ghost" data-a="selToken" data-id="${s.id}">📍 Token</button><button class="ghost" data-a="ocultar" data-id="${s.id}">👁 Tirar do painel</button>${s.owner?.id && s.owner.id !== me.id ? `<button class="ghost" data-a="susDe" data-pid="${esc(s.owner.id)}" title="Mandar um sussurro só para este jogador">🗣 Sussurrar</button>` : ""}</div>
    </div></article>`;
}
function viewMesa() {
  const h = hx(); const list = panelSheets(); const total = allSheets().length;
  return `${hxResumo()}
    <div class="row between"><label class="chk"><input type="checkbox" data-a="soOnline" ${mine.soOnline ? "checked" : ""}> Só quem está na sala</label>
      <span class="muted small">${list.length}/${total} fichas${mine.ocultas.length ? ` · <a href="#" data-a="mostrarTodas">mostrar ${mine.ocultas.length} oculta(s)</a>` : ""}</span></div>
    ${list.length ? `<div class="pcs">${list.map((s) => pcCard(s, h)).join("")}</div>` : `<p class="vazio">Nenhuma ficha ainda. Abra a extensão da ficha com os jogadores na sala, ou clique em ⟳ para pedir as fichas.</p>`}`;
}

/* ---------- Aba: Secretas ---------- */
function viewSecretas() {
  const sheets = allSheets();
  ui.secSel ||= Object.fromEntries(panelSheets().map((s) => [s.id, true]));
  const log = readLog().filter((e) => ui.logFiltro === "todas" || (ui.logFiltro === "secretas" ? e.secret : e.src === "mestre"));
  const r = ui.secRes;
  return `${viewSussurros()}<section class="card"><h3>Teste secreto em grupo</h3>
      <p class="muted small">Rola pela ficha de cada um (atributo, treino, condições e penalidades do Hexatombe). Ninguém vê: o resultado fica só aqui.</p>
      <div class="row wrap"><select id="secTeste">${testeOptions(ui.lastTeste || "Percepção")}</select>
        <input type="number" id="secBonus" class="n4" placeholder="bônus" value="${esc(ui.secBonus ?? "")}"><input type="number" id="secDT" class="n4" placeholder="DT" value="${esc(ui.secDT ?? "")}"></div>
      <div class="pick">${sheets.map((s) => `<label class="chk"><input type="checkbox" data-secsel="${s.id}" ${ui.secSel[s.id] ? "checked" : ""}> ${esc(nomeS(s))}</label>`).join("") || `<span class="muted">Sem fichas.</span>`}</div>
      <div class="row"><button class="primary" data-a="secRolar">🎲 Rolar em segredo</button><button class="ghost" data-a="secTodos">Todos</button><button class="ghost" data-a="secNenhum">Nenhum</button></div>
      ${r ? `<table class="restab"><tr><th colspan="3">${esc(r.titulo)}</th></tr>${r.linhas.map((l) => `<tr class="${l.ok === true ? "ok" : l.ok === false ? "fail" : ""}"><td>${esc(l.nome)}</td><td class="muted small">${esc(l.txt)}</td><td><b>${l.total}</b>${l.ok === true ? " ✔" : l.ok === false ? " ✘" : ""}</td></tr>`).join("")}</table>` : ""}
    </section>
    <section class="card"><h3>Dados do mestre</h3>
      <div class="row wrap">${["1d20", "2d20", "1d4", "1d6", "1d8", "1d10", "1d12", "1d100"].map((d) => `<button data-a="dado" data-e="${d}">${d}</button>`).join("")}</div>
      <div class="row"><input id="exprLivre" placeholder="ex.: 3d6+2" value="${esc(ui.expr || "")}"><button class="primary" data-a="exprRolar">Rolar</button>
        <button data-a="exprPub" title="Mostrar o resultado para a mesa toda">📢</button></div>
      ${ui.exprRes ? `<div class="res">${esc(ui.exprRes)}</div>` : ""}
    </section>
    <section class="card"><h3>Registro de rolagens <button class="icon ghost" data-a="logLimpar" title="Limpar registro">🗑</button></h3>
      <div class="seg">${[["todas", "Todas"], ["secretas", "Secretas"], ["mestre", "Minhas"]].map(([k, n]) => `<button class="${ui.logFiltro === k ? "on" : ""}" data-a="logFiltro" data-k="${k}">${n}</button>`).join("")}</div>
      <p class="muted small">Inclui as rolagens dos jogadores feitas pela ficha, mesmo com esta janela fechada. As secretas (🙈) só você recebe.</p>
      <ol class="log">${log.slice(0, 80).map((e) => `<li class="${e.secret ? "sec" : ""}"><small>${hora(e.at)} · ${esc(e.who)}${e.secret ? " 🙈" : ""}</small><div>${esc(e.text).replace(/\n/g, "<br>")}</div></li>`).join("") || `<li class="muted">Nada rolado ainda.</li>`}</ol>
    </section>`;
}

/* ---------- Aba: Combate ---------- */
const C = () => mine.combate;
function cPV(e) { if (e.sheetId) { const s = getSheet(e.sheetId); return s ? [num(s.pv.atual), num(s.pv.max)] : [0, 0]; } return [num(e.pv), num(e.pvMax)]; }
function cDef(e) { if (e.sheetId) { const s = getSheet(e.sheetId); return s ? defesa(s) : "?"; } return e.def ?? "?"; }
function cNome(e) { if (e.sheetId) { const s = getSheet(e.sheetId); return s ? nomeS(s) : e.nome; } return e.nome; }
function sortCombate() {
  const c = C(); const atual = c.lista[c.vez]?.id;
  c.lista.sort((a, b) => num(b.ini) - num(a.ini) || num(b.pick) - num(a.pick));
  const i = c.lista.findIndex((e) => e.id === atual); c.vez = i >= 0 ? i : 0;
}
function iniDe(e) {
  if (e.sheetId) { const s = getSheet(e.sheetId); if (s) { const r = rollFor(s, "Iniciativa"); return { total: r.total, pick: r.pick }; } }
  if (e.cri) { const r = rollMonster(e.cri.ini || "1d20"); return { total: r.total, pick: r.pick }; }
  return { total: num(e.ini), pick: 0 };
}
function addCombatente(e) { const c = C(); const x = { id: uid(), conds: [], oculto: false, ...e }; const r = iniDe(x); x.ini = r.total; x.pick = r.pick; c.lista.push(x); sortCombate(); saveMine(); return x; }
function viewCombate() {
  const c = C(); const best = bestiarioTodo();
  const alvos = c.lista.map((e) => [e.id, cNome(e)]);
  const rows = c.lista.map((e, i) => {
    const [pv, pvMax] = cPV(e); const atual = c.ativo && i === c.vez; const open = !!ui.cOpen[e.id];
    const s = e.sheetId ? getSheet(e.sheetId) : null;
    const condsFicha = s ? activeConds(s) : [];
    const timed = Object.fromEntries((e.conds || []).map((x) => [x.n, x.r]));
    const conds = [...new Set([...condsFicha, ...(e.conds || []).map((x) => x.n)])];
    const caido = pv <= 0 && pvMax > 0;
    let extra = "";
    if (open) {
      const cri = e.cri;
      extra = `<div class="cbody">
        <div class="row wrap act"><input type="number" min="0" class="n4" id="cv-${e.id}" placeholder="valor"><button class="danger" data-a="cDano" data-id="${e.id}">Dano</button><button data-a="cCura" data-id="${e.id}">Cura</button>
          <label class="inl">Ini <input type="number" class="n3" data-cini="${e.id}" value="${num(e.ini)}"></label>
          ${e.sheetId ? "" : `<label class="inl">Def <input type="number" class="n3" data-cdef="${e.id}" value="${esc(e.def ?? "")}"></label>`}</div>
        <div class="row wrap act"><select id="cc-${e.id}"><option value="">＋ condição…</option>${CONDICOES.map(([n]) => `<option>${esc(n)}</option>`).join("")}</select>
          <input type="number" min="0" class="n3" id="cr-${e.id}" placeholder="rod." title="Rodadas (vazio = sem prazo)"><button data-a="cCond" data-id="${e.id}">Aplicar</button></div>
        ${cri ? `<div class="cri"><small class="muted">${esc(cri.tipo || "")}${cri.vd ? ` · VD ${esc(cri.vd)}` : ""}${cri.rd ? ` · RD ${esc(cri.rd)}` : ""}${cri.vuln ? ` · vuln. ${esc(cri.vuln)}` : ""}${cri.desl ? ` · ${esc(cri.desl)}` : ""}</small>
          <div class="row wrap"><span class="muted small">Alvo:</span><select data-calvo="${e.id}"><option value="">—</option>${alvos.filter(([id]) => id !== e.id).map(([id, n]) => `<option value="${id}" ${ui.alvo[e.id] === id ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></div>
          ${(cri.atq || []).map((a, ai) => `<button class="atk" data-a="cAtq" data-id="${e.id}" data-i="${ai}"><b>${esc(a[0])}</b> <span>${esc(a[1])} · ${esc(a[2])} ${esc(a[3] || "")}</span></button>`).join("")}
          ${(cri.extra || []).map((a) => `<button class="atk" data-a="cExtra" data-id="${e.id}" data-e="${esc(a[1])}" data-n="${esc(a[0])}"><b>${esc(a[0])}</b> <span>${esc(a[1])}</span></button>`).join("")}
          <div class="row wrap">${["Fortitude", "Reflexos", "Vontade"].map((r) => `<button data-a="cRes" data-id="${e.id}" data-r="${r}">${r} ${esc(cri.res?.[r] || "1d20")}</button>`).join("")}<button data-a="cRes" data-id="${e.id}" data-r="Percepção">Percepção ${esc(cri.per || "1d20")}</button></div>
          ${cri.attrs ? `<p class="small muted">${esc(cri.attrs)}</p>` : ""}
          ${(cri.hab || []).length ? `<details><summary>Habilidades</summary><ul class="small">${cri.hab.map((h) => `<li>${habHTML(h)}</li>`).join("")}</ul></details>` : ""}
          ${cri.lore ? `<details><summary>História</summary><ul class="small lore">${loreTexto(cri.lore).map((t) => `<li>${esc(t)}</li>`).join("")}</ul></details>` : ""}
          ${cri.pp ? `<p class="small"><b>Presença perturbadora:</b> ${esc(cri.pp)}</p>` : ""}</div>` : ""}
        ${ui.cRes?.id === e.id ? `<div class="res">${esc(ui.cRes.txt).replace(/\n/g, "<br>")}${ui.cRes.dano != null && ui.cRes.alvo ? ` <button data-a="cAplicar" data-id="${ui.cRes.alvo}" data-v="${ui.cRes.dano}">Aplicar ${ui.cRes.dano} de dano</button>` : ""}</div>` : ""}
        <div class="row wrap foot">${e.sheetId ? `<button class="ghost" data-a="abrirFicha" data-id="${e.sheetId}">📄 Ficha</button>` : `<button class="ghost" data-a="cVincular" data-id="${e.id}">🎯 Vincular token selecionado</button>`}
          <button class="ghost" data-a="cSel" data-id="${e.id}">📍 Mostrar no mapa</button>
          <button class="ghost" data-a="cOculto" data-id="${e.id}">${e.oculto ? "🙈 Nome oculto" : "👁 Nome visível"}</button>
          <button class="ghost danger" data-a="cDel" data-id="${e.id}">Remover</button></div></div>`;
    }
    return `<li class="comb ${atual ? "turn" : ""} ${caido ? "down" : ""} ${e.sheetId ? "pcrow" : "npc"}">
      <div class="chead" data-a="cToggle" data-id="${e.id}"><span class="ini">${num(e.ini)}</span><span class="cn"><b>${esc(cNome(e))}</b>${e.oculto ? " 🙈" : ""}${e.tokenId ? " 🎯" : ""}</span>
        <span class="cdef" title="Defesa">🛡${cDef(e)}</span>${pvMax ? bar("pv", pv, pvMax, "PV") : `<span class="muted small">PV ${pv}</span>`}</div>
      ${conds.length ? `<div class="chips">${conds.map((n) => `<button class="chip on" data-a="cCondDel" data-id="${e.id}" data-c="${esc(n)}" title="${esc(COND_MAP[n]?.d || "")}">${esc(n)}${timed[n] ? ` ⏱${timed[n]}` : ""} ✕</button>`).join("")}</div>` : ""}
      ${extra}</li>`;
  }).join("");
  const sheets = allSheets().filter((s) => !c.lista.some((e) => e.sheetId === s.id));
  return `<section class="card cbar"><div class="row between"><b class="round">${c.ativo ? `Rodada ${c.rodada}` : "Fora de combate"}</b>
      <span class="row">${c.ativo ? `<button data-a="cPrev" title="Turno anterior">◂</button><button class="primary" data-a="cNext">Próximo ▸</button><button class="ghost" data-a="cFim">Encerrar</button>` : `<button class="primary" data-a="cIniciar" ${c.lista.length ? "" : "disabled"}>⚔ Iniciar combate</button>`}</span></div>
      <div class="row wrap small"><label class="chk"><input type="checkbox" data-a="cAnel" ${c.anel ? "checked" : ""}> Anel no token da vez</label>
        <label class="chk"><input type="checkbox" data-a="cAnunciar" ${c.anunciar ? "checked" : ""}> Avisar a mesa de quem é a vez</label>
        <label class="chk"><input type="checkbox" data-a="cSeguir" ${c.seguir ? "checked" : ""}> Câmera vai até o token da vez</label>
        <button class="ghost" data-a="cReroll" ${c.lista.length ? "" : "disabled"}>🎲 Rolar iniciativa de novo</button>
        <button class="ghost danger" data-a="cLimpar" ${c.lista.length ? "" : "disabled"}>Limpar</button></div></section>
    <ol class="combat">${rows || `<li class="muted vazio">Ninguém no combate. Adicione abaixo.</li>`}</ol>
    <section class="card"><h3>Adicionar</h3>
      <div class="row wrap"><button data-a="cAddPCs" ${sheets.length ? "" : "disabled"}>＋ Todos os agentes (${sheets.length})</button>
        <select id="cAddPC"><option value="">ou um agente…</option>${sheets.map((s) => `<option value="${s.id}">${esc(nomeS(s))}</option>`).join("")}</select><button data-a="cAddPC">＋</button></div>
      <div class="row wrap"><select id="cBest"><option value="">Criatura do bestiário…</option>${best.map((b, i) => `<option value="${i}">${esc(b.nome)}${b._src === "hexa" ? " (Hexatombe)" : b._src === "meus" ? " (gerado)" : ""}${b.vd ? ` · VD ${esc(b.vd)}` : ""}</option>`).join("")}</select>
        <input type="number" min="1" max="20" id="cQtd" class="n3" value="1" title="Quantidade"><button data-a="cAddBest">＋</button></div>
      <div class="row wrap"><button data-a="cAddSel" title="Selecione tokens no mapa e clique">🎯 ＋ Tokens selecionados</button><span class="muted small">ou clique com o botão direito num token → “Adicionar ao combate”</span></div>
      <div class="row wrap"><input id="cNome" placeholder="Nome (NPC rápido)"><input type="number" id="cIni" class="n3" placeholder="Ini"><input type="number" id="cPv" class="n3" placeholder="PV"><input type="number" id="cDef" class="n3" placeholder="Def"><button data-a="cAddNpc">＋</button></div>
      <p class="muted small">Agentes usam a Iniciativa e os PV da ficha; o dano aplicado aqui vai direto para a ficha do jogador. Criaturas rolam a Iniciativa do bestiário.</p>
    </section>
    ${viewGerador()}`;
}
/* ---------- Gerador de NPC ---------- */
function geradoHTML(g) {
  const c = g.cri;
  const lore = loreTexto(c.lore);
  return `<div class="gerado"><div class="row between"><b class="gen">${esc(g.nome)}</b><button class="icon ghost" data-a="genNome" title="Outro nome">🎲</button></div>
    <div class="muted small">${esc(c.tipo)} · VD ${esc(c.vd)} · ${esc(c.desl)}${g.traco ? ` · <span class="traco">✨ ${esc(g.traco)}</span>` : ""}</div>
    ${c.attrs ? `<div class="small attrs">${esc(c.attrs)}</div>` : ""}
    <div class="gstats"><span>Def <b>${g.def}</b></span><span>PV <b>${g.pvInicial ? `${g.pvInicial}/` : ""}${g.pv}</b></span><span>Ini <b>${esc(c.ini)}</b></span><span>Perc. <b>${esc(c.per)}</b></span></div>
    <div class="small">Fort ${esc(c.res.Fortitude)} · Ref ${esc(c.res.Reflexos)} · Von ${esc(c.res.Vontade)}</div>
    ${c.rd ? `<div class="small">RD: ${esc(c.rd)}${c.vuln ? ` · vulnerável a ${esc(c.vuln)}` : ""}</div>` : ""}
    ${c.pp ? `<div class="small">Presença perturbadora: ${esc(c.pp)}</div>` : ""}
    <ul class="small gl">${c.atq.map((a) => `<li><b>${esc(a[0])}</b> ${esc(a[1])} · ${esc(a[2])} ${esc(a[3])}</li>`).join("")}${(c.extra || []).map((a) => `<li><b>${esc(a[0])}</b></li>`).join("")}</ul>
    <div class="row between ghead"><b class="small">Habilidades</b><span class="row">${g.traco ? "" : `<button class="ghost small" data-a="genTraco" title="Acrescenta um traço especial sorteado">✨ Traço</button>`}<button class="ghost small" data-a="genHabs" title="Sorteia outras habilidades, mantendo o resto">🎲 Outras</button></span></div>
    <ul class="small gl habs">${c.hab.map((h) => `<li>${habHTML(h)}</li>`).join("")}</ul>
    ${lore.length ? `<div class="row between ghead"><b class="small">História</b><button class="ghost small" data-a="genLore" title="Sorteia outra história, mantendo os números">🎲 Outra</button></div>
    <div class="lore small"><p>${esc(lore[0])}</p><ul class="gl">${lore.slice(1).map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : ""}
    <div class="row wrap"><input type="number" min="1" max="20" id="genQtd" class="n3" value="1" title="Quantidade"><button class="primary" data-a="genCombate">＋ Combate</button>
      <button data-a="genSalvar" title="Guarda na lista de criaturas do combate">💾 Guardar</button><button class="ghost" data-a="genCopiar">📋 Copiar</button></div></div>`;
}
/* "Nome (ação): texto" com o nome em negrito */
function habHTML(h) {
  const m = /^([^:(]{2,40}(?: \([^)]*\))?):\s(.*)$/s.exec(String(h));
  return m ? `<b>${esc(m[1])}:</b> ${esc(m[2])}` : esc(h);
}
/* ---------- Gerador de equipe do Hexatombe ---------- */
const HX_IMPORT = HX_NS + ":importar";
function membroHTML(m, i) {
  return `<details class="membro"><summary><b>${esc(m.nome)}</b> <span class="muted small">${esc(m.tipo)}${m.lealdade === "pode desertar" ? ` · <span class="danger">pode desertar</span>` : ""}</span>
      <button class="icon ghost" data-a="eqMembro" data-i="${i}" title="Sortear outra pessoa para esta função">🎲</button></summary>
    <div class="gstats"><span>Def <b>${esc(m.def)}</b></span><span>PV <b>${esc(m.pv)}</b></span><span>PE <b>${esc(m.pe)}</b></span><span>Ini <b>${esc(m.ini)}</b></span><span>Perc. <b>${esc(m.per)}</b></span></div>
    <div class="small attrs">${esc(m.attrs)}</div>
    <div class="small">Fort ${esc(m.res.Fortitude)} · Ref ${esc(m.res.Reflexos)} · Von ${esc(m.res.Vontade)}</div>
    <div class="small">Perícias: ${m.pericias.map((p) => `${esc(p[0])} ${esc(p[1])}`).join(" · ")}</div>
    <ul class="small gl">${m.atq.map((a) => `<li><b>${esc(a[0])}</b> ${esc(a[1])} · ${esc(a[2])} ${esc(a[3])}</li>`).join("")}</ul>
    <ul class="small gl habs">${m.hab.map((h) => `<li>${habHTML(h)}</li>`).join("")}</ul>
    <div class="lore small"><ul class="gl">${m.historia.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
  </details>`;
}
function viewGeradorEquipe() {
  const o = mine.genEq ||= { tema: "sorteio", nex: 35, tam: 4, comp: "equilibrada" };
  const e = ui.equipe; const h = hx();
  const alvos = (h?.equipes || []).map((t, i) => [i, t, (t.membros || []).length]);
  const livre = alvos.find(([, , n]) => !n);
  const alvoSel = ui.eqAlvo ?? (livre ? livre[0] : 0);
  return `<div class="row wrap"><select id="eqTema" title="Tipo de equipe">${TEMAS.map(([k, n]) => `<option value="${k}" ${o.tema === k ? "selected" : ""}>${n}</option>`).join("")}</select>
      <select id="eqNex" title="NEX dos integrantes">${NEXS.map((n) => `<option value="${n}" ${num(o.nex) === n ? "selected" : ""}>NEX ${n}%</option>`).join("")}</select>
      <select id="eqTam" title="Quantos integrantes">${[2, 3, 4, 5, 6].map((n) => `<option value="${n}" ${num(o.tam) === n ? "selected" : ""}>${n} pessoas</option>`).join("")}</select>
      <select id="eqComp" title="Composição da equipe">${COMPOSICOES.map(([k, n]) => `<option value="${k}" ${(o.comp || "equilibrada") === k ? "selected" : ""}>${n}</option>`).join("")}</select>
      <button class="primary" data-a="eqGerar">🎲 Gerar equipe</button></div>
    ${e ? `<div class="gerado">
      <div class="row between"><b class="gen">${esc(e.nome)}</b><span class="muted small">${esc(e.temaNome)} · NEX ${e.nex}%</span></div>
      <p class="small lore"><i>${esc(e.lema)}</i></p>
      <div class="row between ghead"><b class="small">A equipe</b><button class="ghost small" data-a="eqHist" title="Sorteia outra história, mantendo as pessoas">🎲 Outra</button></div>
      <div class="lore small"><p>${esc(e.conceito)}</p><ul class="gl">
        <li><b>Desejo:</b> ${esc(e.desejo)}.</li><li><b>Estratégia:</b> ${esc(e.estrategia)}</li>
        <li><b>Segredo:</b> ${esc(e.segredo)}.</li><li><b>Ponto fraco:</b> ${esc(e.fraqueza)}.</li>
        ${e.base ? `<li><b>Base:</b> ${esc(e.base)}.</li><li><b>Recursos:</b> ${esc(e.recursos)}.</li>` : ""}
        ${e.postura ? `<li><b>Com os agentes:</b> ${esc(e.postura)}.</li><li><b>No primeiro encontro:</b> ${esc(e.reacao)}</li><li><b>Troca:</b> ${esc(e.troca)}</li>` : ""}</ul>
        ${(e.fases || []).length ? `<b class="small">Plano ao longo do ritual</b><ul class="gl">${e.fases.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        <b class="small">Entre eles</b><ul class="gl">${e.tensoes.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
      <div class="row between ghead"><b class="small">Integrantes (${e.membros.length})</b></div>
      ${e.membros.map(membroHTML).join("")}
      <div class="ghead">
        ${h ? `<div class="row wrap"><span class="small">Pôr no Hexatombe como</span><select id="eqAlvo">${alvos.map(([i, t, n]) => `<option value="${i}" ${i === alvoSel ? "selected" : ""}>${esc(t.nome)}${n ? ` (${n} membro${n > 1 ? "s" : ""}: os NPCs saem)` : " (vazia)"}</option>`).join("")}</select>
          <button class="primary" data-a="eqHexa">⛺ Pôr no Hexatombe</button></div>
          <p class="muted small">A equipe ganha o nome gerado, os integrantes viram NPCs da aba NPCs e o plano vai para o “Plano secreto do mestre”. Fichas de jogadores dessa equipe não saem.</p>`
        : `<div class="row wrap"><button class="primary" data-a="eqHexa">⛺ Pôr no Hexatombe</button></div><p class="muted small">Vai para a primeira equipe vazia do Hexatombe quando ele abrir nesta sala.</p>`}
        <div class="row wrap"><button data-a="eqCombate">＋ Todos no combate</button><button class="ghost" data-a="eqCopiar">📋 Copiar</button></div>
      </div></div>`
    : `<p class="muted small">Cria uma equipe rival para o Hexatombe: nome, lema, desejo, estratégia, segredo, base, recursos, como tratam os agentes, o que trocam, o plano do começo ao sacrifício, tensões entre eles e de 2 a 6 agentes com PV, PE, Defesa, perícias, ataques, habilidades da função e história (aparência, fala, segredo e quem pode desertar). Os números são aproximados, na escala do NEX.</p>`}`;
}
/* ---------- Gerador de encontros ---------- */
function npcResumoHTML(x, i) {
  const g = x.g; const c = g.cri;
  return `<details class="membro"><summary><b>${x.qtd > 1 ? `${x.qtd}× ` : ""}${esc(g.nome)}</b> <span class="muted small">${esc(PAPEL_NOME[x.papel] || x.papel)} · ${esc(c.tipo)}${g.traco ? ` · ✨ ${esc(g.traco)}` : ""}</span>
      <button class="icon ghost" data-a="encGrupo" data-i="${i}" title="Sortear outro, mantendo o papel">🎲</button></summary>
    <div class="gstats"><span>Def <b>${g.def}</b></span><span>PV <b>${g.pvInicial ? `${g.pvInicial}/` : ""}${g.pv}</b></span><span>Ini <b>${esc(c.ini)}</b></span><span>Perc. <b>${esc(c.per)}</b></span></div>
    <div class="small">Fort ${esc(c.res.Fortitude)} · Ref ${esc(c.res.Reflexos)} · Von ${esc(c.res.Vontade)}${c.rd ? ` · RD ${esc(c.rd)}` : ""}${c.vuln ? ` · vuln. ${esc(c.vuln)}` : ""}</div>
    <ul class="small gl">${c.atq.map((a) => `<li><b>${esc(a[0])}</b> ${esc(a[1])} · ${esc(a[2])} ${esc(a[3])}</li>`).join("")}</ul>
    <ul class="small gl habs">${c.hab.map((h) => `<li>${habHTML(h)}</li>`).join("")}</ul>
    <div class="lore small"><ul class="gl">${loreTexto(c.lore).map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
    <div class="row wrap"><button data-a="encGrupoCombate" data-i="${i}">＋ Combate</button><button class="ghost" data-a="encGuardar" data-i="${i}">💾 Guardar</button></div>
  </details>`;
}
function viewGeradorEncontro() {
  const o = mine.genEnc ||= { tema: "sorteio", vd: 40, dif: "medio", el: "sorteio" };
  const e = ui.encontro;
  const inimigos = e ? e.grupos.filter((x) => !x.aliado).reduce((s, x) => s + x.qtd, 0) : 0;
  return `<div class="row wrap"><select id="encTema" title="Tipo de encontro">${TEMAS_ENC.map(([k, n]) => `<option value="${k}" ${o.tema === k ? "selected" : ""}>${n}</option>`).join("")}</select>
      <select id="encVd" title="Nível da ameaça (VD)">${VDS.map((v) => `<option value="${v}" ${num(o.vd) === v ? "selected" : ""}>VD ${v}</option>`).join("")}</select>
      <select id="encDif" title="Dificuldade">${DIFICULDADES.map(([k, n]) => `<option value="${k}" ${o.dif === k ? "selected" : ""}>${n}</option>`).join("")}</select>
      <select id="encEl" title="Elemento das criaturas e do culto">${ELEMENTOS_ENC.map(([k, n]) => `<option value="${k}" ${o.el === k ? "selected" : ""}>${n}</option>`).join("")}</select>
      <button class="primary" data-a="encGerar">🎲 Gerar encontro</button></div>
    ${e ? `<div class="gerado">
      <div class="row between"><b class="gen">${esc(e.titulo)}</b><span class="muted small">${esc(e.temaNome)} · ${esc(e.difNome)} · VD ${e.vd}</span></div>
      <div class="row between ghead"><b class="small">A cena</b><button class="ghost small" data-a="encCena" title="Sorteia outra cena, mantendo os inimigos">🎲 Outra</button></div>
      <div class="lore small"><ul class="gl">
        <li><b>Onde:</b> ${esc(e.local)}.</li><li><b>O que estão fazendo:</b> ${esc(e.situacao)}.</li><li><b>O que querem:</b> ${esc(e.objetivo)}.</li>
        <li><b>Quando atacam:</b> ${esc(e.gatilho)}</li><li><b>Quando fogem:</b> ${esc(e.fuga)}</li>
        <li><b>Complicação:</b> ${esc(e.complicacao)}</li><li><b>Sem luta:</b> ${esc(e.semLuta)}</li><li><b>Recompensa:</b> ${esc(e.recompensa)}.</li></ul></div>
      <div class="row between ghead"><b class="small">Quem está lá (${inimigos} inimigo${inimigos === 1 ? "" : "s"})</b></div>
      ${e.grupos.map(npcResumoHTML).join("")}
      <div class="row wrap ghead"><button class="primary" data-a="encCombate">＋ Todos no combate</button><button class="ghost" data-a="encCopiar">📋 Copiar</button></div>
      <p class="muted small">Os inimigos entram com o nome oculto para a mesa; os civis entram com o nome visível.</p>
    </div>`
    : `<p class="muted small">Monta um encontro inteiro: um grupo coerente de inimigos (chefe, comuns e lacaios do mesmo tema e elemento), com o que estão fazendo quando os agentes chegam, onde, quando atacam e quando fogem, uma complicação, um jeito de resolver sem luta e a recompensa. A dificuldade muda quantos são: fácil (3), médio (5), difícil (5 com chefe) e mortal (7 com chefe).</p>`}`;
}
function viewGerador() {
  const g = mine.gen;
  const salvos = mine.npcs || [];
  const modo = ui.genModo || "npc";
  const seg = `<nav class="seg gmodo"><button data-a="genModo" data-k="npc" class="${modo === "npc" ? "on" : ""}">👤 NPC</button><button data-a="genModo" data-k="encontro" class="${modo === "encontro" ? "on" : ""}">🎭 Encontro</button><button data-a="genModo" data-k="equipe" class="${modo === "equipe" ? "on" : ""}">👥 Equipe</button></nav>`;
  if (modo === "equipe") return `<section class="card"><h3>Gerador</h3>${seg}${viewGeradorEquipe()}</section>`;
  if (modo === "encontro") return `<section class="card"><h3>Gerador</h3>${seg}${viewGeradorEncontro()}</section>`;
  return `<section class="card"><h3>Gerador</h3>${seg}
    <div class="row wrap"><select id="genTipo">${TIPOS.map(([k, n]) => `<option value="${k}" ${g.tipo === k ? "selected" : ""}>${n}</option>`).join("")}</select>
      <select id="genVd" title="Nível da ameaça (VD)">${VDS.map((v) => `<option value="${v}" ${num(g.vd) === v ? "selected" : ""}>VD ${v}</option>`).join("")}</select>
      <select id="genPapel">${PAPEIS.map(([k, n]) => `<option value="${k}" ${g.papel === k ? "selected" : ""}>${n}</option>`).join("")}</select>
      <select id="genTraco" title="Traço especial (opcional)"><option value="nenhum" ${!g.traco || g.traco === "nenhum" ? "selected" : ""}>Sem traço</option><option value="sortear" ${g.traco === "sortear" ? "selected" : ""}>✨ Traço sorteado</option>${TRACOS.map(([n]) => `<option value="${esc(n)}" ${g.traco === n ? "selected" : ""}>✨ ${esc(n)}</option>`).join("")}</select>
      <button class="primary" data-a="gerar">🎲 Gerar</button></div>
    ${ui.gerado ? geradoHTML(ui.gerado) : `<p class="muted small">Cria uma ameaça pronta: Defesa, PV, atributos, testes, ataques, habilidades sorteadas do tipo escolhido (lacaio 1, comum 2, chefe 3 + uma de chefe) e uma pequena história, com o que quer, um segredo, como luta e o que carrega. Pessoas e assombrações vêm também com atitude, o que podem oferecer e o que pedem. O traço especial é opcional. Os números são aproximados, para improvisar.</p>`}
    ${(ui.recentes || []).length ? `<details><summary class="small">Últimos gerados (${ui.recentes.length})</summary><ul class="small gl">${ui.recentes.map((r, i) => `<li><button class="linkish" data-a="genVoltar" data-i="${i}">${esc(r.nome)}</button> <span class="muted">${esc(r.cri.tipo)} · VD ${esc(r.cri.vd)}</span></li>`).join("")}</ul></details>` : ""}
    ${salvos.length ? `<details><summary class="small">Guardados (${salvos.length})</summary><ul class="small gl">${salvos.map((n) => `<li>${esc(n.nome)} <span class="muted">VD ${esc(n.vd)}</span> <button class="icon ghost danger" data-a="genApagar" data-id="${esc(n.id)}" title="Apagar">✕</button></li>`).join("")}</ul></details>` : ""}
  </section>`;
}
function geradoParaBestiario(g) {
  return { id: uid(), nome: g.nome, tipo: g.cri.tipo, vd: g.cri.vd, def: g.def, pv: g.pv, ini: g.cri.ini, per: g.cri.per, res: g.cri.res, atq: g.cri.atq, extra: g.cri.extra, hab: g.cri.hab, pp: g.cri.pp, rd: g.cri.rd, vuln: g.cri.vuln, desl: g.cri.desl, attrs: g.cri.attrs || "", lore: g.cri.lore || null };
}

function npcTexto(g) {
  const c = g.cri;
  return `${g.nome} — ${c.tipo}, VD ${c.vd}\nDefesa ${g.def} · PV ${g.pv} · Desloc. ${c.desl}\nIniciativa ${c.ini} · Percepção ${c.per} · Fortitude ${c.res.Fortitude} · Reflexos ${c.res.Reflexos} · Vontade ${c.res.Vontade}${c.rd ? `\nResistências: ${c.rd}` : ""}${c.vuln ? ` · Vulnerável: ${c.vuln}` : ""}${c.pp ? `\nPresença perturbadora: ${c.pp}` : ""}${c.attrs ? `\n${c.attrs}` : ""}\n${c.atq.map((a) => `${a[0]}: ${a[1]} (${a[2]} ${a[3]})`).join("\n")}\n\nHabilidades\n${c.hab.join("\n")}${c.lore ? `\n\nHistória\n${loreTexto(c.lore).join("\n")}` : ""}`;
}
function lembrarGerado(g) { if (!g) return; ui.recentes = [g, ...(ui.recentes || []).filter((x) => x !== g)].slice(0, 10); }
function grupoNoCombate(x) {
  const g = x.g;
  for (let k = 0; k < x.qtd; k++) addCombatente({ nome: x.qtd > 1 ? `${g.nome} ${k + 1}` : g.nome, cri: { nome: g.nome, ...g.cri }, pv: g.pvInicial || g.pv, pvMax: g.pv, def: g.def, oculto: !x.aliado });
  return x.qtd;
}

/* ---------- Combate: tokens do mapa ---------- */
function nomeDoToken(it) { return (it.text?.plainText || it.name || "Token").trim().slice(0, 40) || "Token"; }
function addDoToken(it) {
  const link = it.metadata?.[LINK_KEY];
  const c = C();
  if (link?.sheetId && getSheet(link.sheetId)) {
    if (c.lista.some((e) => e.sheetId === link.sheetId)) return null;
    return addCombatente({ sheetId: link.sheetId, nome: nomeS(getSheet(link.sheetId)) });
  }
  if (c.lista.some((e) => e.tokenId === it.id)) return null;
  const nome = nomeDoToken(it);
  const cri = bestiarioTodo().find((b) => b.nome.toLowerCase() === nome.toLowerCase().replace(/\s+\d+$/, ""));
  if (cri) {
    return addCombatente({ nome, tokenId: it.id, cri: { nome: cri.nome, tipo: cri.tipo, vd: cri.vd, ini: cri.ini, per: cri.per, res: cri.res, atq: cri.atq, extra: cri.extra, hab: cri.hab, pp: cri.pp, rd: cri.rd, vuln: cri.vuln, desl: cri.desl, attrs: cri.attrs || "", lore: cri.lore || null }, pv: num(cri.pv), pvMax: num(cri.pv), def: num(cri.def), oculto: true });
  }
  return addCombatente({ nome, tokenId: it.id, ini: die(20), pv: 0, pvMax: 0, def: "", oculto: true });
}
async function addSelecionados() {
  if (!sceneOk) return toast("Abra uma cena primeiro.");
  const sel = await OBR.player.getSelection();
  if (!sel?.length) return toast("Selecione um ou mais tokens no mapa e clique de novo.");
  const its = await OBR.scene.items.getItems(sel); let n = 0;
  for (const it of its) if (["CHARACTER", "MOUNT", "PROP"].includes(it.layer) && addDoToken(it)) n++;
  saveMine(); render(); updateRing();
  toast(n ? `${n} adicionado(s) ao combate.` : "Nada novo: esses tokens já estão no combate.");
}
// Pedidos do menu do token (feitos pelo fundo, com a janela fechada ou aberta)
async function processarFila() {
  if (!isGM() || !sceneOk) return;
  const fila = readJSON(FILA(), []); if (!fila.length) return;
  lsSet(FILA(), "[]");
  let its = []; try { its = await OBR.scene.items.getItems(fila); } catch { /* */ }
  let n = 0; for (const it of its) if (addDoToken(it)) n++;
  if (n) { saveMine(); softRender(); updateRing(); toast(`${n} token(s) entraram no combate.`); }
}
async function seguirVez() {
  const c = C(); const e = c.lista[c.vez]; if (!c.seguir || !e || !sceneOk) return;
  try { const ids = await tokensOf(e); if (!ids.length) return; const b = await OBR.scene.items.getItemBounds(ids); await OBR.viewport.animateToBounds({ ...b, min: { x: b.min.x - b.width * 2, y: b.min.y - b.height * 2 }, max: { x: b.max.x + b.width * 2, y: b.max.y + b.height * 2 }, width: b.width * 5, height: b.height * 5 }); } catch { /* */ }
}

/* ---------- Aba: Cena ---------- */
function restante(fim) {
  const ms = Math.max(0, num(fim) - Date.now()); const s = Math.ceil(ms / 1000);
  return ms <= 0 ? "acabou" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
function relogioSVG(r, editavel = false) {
  const seg = clamp(num(r.seg), 2, 12); const at = clamp(num(r.atual), 0, seg); const R = 30, cx = 36, cy = 36;
  const fatias = Array.from({ length: seg }, (_, i) => {
    const a0 = (i / seg) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / seg) * 2 * Math.PI - Math.PI / 2;
    const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0), x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    return `<path d="M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z" class="${i < at ? "on" : ""}"${editavel ? ` data-a="relFatia" data-id="${esc(r.id)}" data-i="${i}"` : ""}/>`;
  }).join("");
  return `<figure class="clock ${at >= seg ? "cheio" : ""}"><svg viewBox="0 0 72 72" width="72" height="72" role="img" aria-label="${esc(r.nome)}: ${at} de ${seg}">${fatias}<circle cx="${cx}" cy="${cy}" r="${R}" class="aro"/></svg><figcaption>${esc(r.nome)}<small>${at}/${seg}</small></figcaption></figure>`;
}
function viewCena() {
  const a = mine.amb; const t = mine.timer;
  const cena = cenaId ? (mine.cenas[cenaId] ||= { nome: "", txt: "", at: 0 }) : null;
  const outras = Object.entries(mine.cenas).filter(([k, v]) => k !== cenaId && (v.txt || v.nome)).sort((x, y) => num(y[1].at) - num(x[1].at));
  return `${viewOuvintes()}${viewMesaDeSom()}${viewAmbientacao()}
    <section class="card"><h3>Relógios de ameaça</h3>
      <div class="clocks">${mine.relogios.map((r) => `<div class="clockbox">${relogioSVG(r, true)}
        <div class="row"><button class="icon" data-a="relMenos" data-id="${esc(r.id)}">−</button><button class="icon" data-a="relMais" data-id="${esc(r.id)}">＋</button>
          <button class="icon ${r.pub ? "on" : ""}" data-a="relPub" data-id="${esc(r.id)}" title="${r.pub ? "Os jogadores veem" : "Só você vê"}">${r.pub ? "👁" : "🙈"}</button><button class="icon ghost danger" data-a="relDel" data-id="${esc(r.id)}" title="Apagar">✕</button></div></div>`).join("") || `<p class="muted small">Ex.: “A Coroa desperta” (6), “Os cultistas chegam” (4).</p>`}</div>
      <div class="row wrap"><input id="relNome" placeholder="Nome do relógio"><select id="relSeg">${[4, 6, 8, 10, 12].map((n) => `<option ${n === 6 ? "selected" : ""}>${n}</option>`).join("")}</select>
        <label class="chk small"><input type="checkbox" id="relPubNovo"> Visível</label><button class="primary" data-a="relNovo">＋</button></div>
      <p class="muted small">Clique numa fatia para marcar até ela. Relógios visíveis aparecem para os jogadores e avisam a mesa quando avançam.</p></section>
    <section class="card"><h3>Cronômetro</h3>
      ${t ? `<div class="timer"><span>⏳ ${esc(t.nome || "Cronômetro")} ${t.pub ? "· 👁 todos veem" : "· 🙈 só você"}</span><b class="countdown" data-fim="${num(t.fim)}">${restante(t.fim)}</b></div>
        <div class="row"><button data-a="timerMais">＋1 min</button><button class="ghost danger" data-a="timerParar">Parar</button></div>`
      : `<div class="row wrap"><input id="timerNome" placeholder="Ex.: O teto desaba em…"><input type="number" min="0.5" step="0.5" id="timerMin" class="n3" value="5" title="Minutos"><span class="small muted">min</span>
        <label class="chk small"><input type="checkbox" id="timerPub" checked> Visível</label><button class="primary" data-a="timerIniciar">▶</button></div>`}
      <p class="muted small">Quando acabar, todos recebem um aviso com o sino.</p></section>
    <section class="card"><h3>Notas desta cena</h3>
      ${cena ? `<input id="cenaNome" placeholder="Nome da cena (ex.: Picadeiro, noite 2)" value="${esc(cena.nome)}">
        <textarea id="cenaTxt" rows="7" placeholder="O que acontece aqui, quem está escondido, o que os agentes podem achar…">${esc(cena.txt)}</textarea>` : `<p class="muted small">Abra uma cena no Owlbear para ter notas por cena.</p>`}
      ${outras.length ? `<details><summary class="small">Outras cenas (${outras.length})</summary>${outras.map(([k, v]) => `<div class="outra"><b>${esc(v.nome || "Cena sem nome")}</b><span class="muted small"> · ${v.at ? new Date(v.at).toLocaleDateString("pt-BR") : ""}</span><div class="small pre">${esc(v.txt)}</div></div>`).join("")}</details>` : ""}</section>
    <section class="card"><h3>Notas gerais</h3>
      <textarea id="notas" rows="6" placeholder="Segredos, ganchos, próximos encontros…">${esc(mine.notas)}</textarea></section>`;
}

/* ---------- Mesa de som ---------- */
function volAmb(k) { const v = mine.amb.vols?.[k]; return v === undefined ? 1 : clamp(Number(v), 0, 1); }
function outros() { return party.filter((p) => p.id !== me.id); }
function chipsPara(sel, acao) {
  const ps = outros();
  if (!ps.length) return `<span class="muted small">Ninguém mais na sala agora.</span>`;
  return ps.map((p) => `<button class="chip ${sel.includes(p.id) ? "on" : ""}" data-a="${acao}" data-pid="${esc(p.id)}">${esc(p.name)}${p.role === "GM" ? " (mestre)" : ""}</button>`).join("");
}
function viewMesaDeSom() {
  ui.somPara = (ui.somPara || []).filter((id) => party.some((p) => p.id === id));
  const alvo = ui.somPara.length;
  return `<section class="card"><h3>Mesa de som <span class="muted small">${alvo ? `só ${alvo === 1 ? "1 pessoa" : `${alvo} pessoas`} ${alvo === 1 ? "ouve" : "ouvem"}` : "todos ouvem"}</span></h3>
      <div class="para"><span class="muted small">Para:</span><button class="chip ${alvo ? "" : "on"}" data-a="somTodos">Todos</button>${chipsPara(ui.somPara, "somPara")}</div>
      <div class="sons">${EFEITOS.map(([k, n]) => `<button data-a="som" data-k="${k}">${n}</button>`).join("")}</div>
      ${mine.sonsLink.length ? `<div class="sons meus">${mine.sonsLink.map((x) => `<span class="meu"><button data-a="somLink" data-id="${esc(x.id)}" title="${esc(x.url)}">🔗 ${esc(x.nome)}</button><button class="icon ghost" data-a="somLinkDel" data-id="${esc(x.id)}" title="Apagar">✕</button></span>`).join("")}</div>` : ""}
      <details ${ui.slAberto ? "open" : ""} data-keep="slAberto"><summary class="small">＋ Seu próprio som (link de áudio)</summary>
        <div class="row"><input id="slNome" placeholder="Nome (ex.: Gargalhada)" maxlength="30"><input id="slUrl" placeholder="https://… .mp3"><button data-a="somLinkNovo">＋</button></div>
        <p class="muted small">Link direto para .mp3 ou .ogg (o arquivo, não a página). Toca uma vez, para quem estiver marcado em “Para”.</p></details>
      <div class="row wrap small"><label class="chk"><input type="checkbox" id="somPrevia" ${ui.previa ? "checked" : ""}> Só ouvir aqui (prévia)</label></div></section>`;
}
function viewAmbientacao() {
  const a = mine.amb; const nomeAmb = (k) => (AMBIENTES.find(([x]) => x === k) || [, k])[1];
  return `<section class="card"><h3>Ambientação <span class="muted small">em laço, para todos</span></h3>
      <div class="sons">${AMBIENTES.map(([k, n]) => `<button class="${a.loops.includes(k) ? "on" : ""}" data-a="amb" data-k="${k}">${n}</button>`).join("")}</div>
      ${a.loops.length ? `<div class="ambvols">${a.loops.map((k) => `<label class="row"><span class="small">${nomeAmb(k)}</span><input type="range" min="0" max="100" step="5" data-ambvol="${k}" value="${Math.round(volAmb(k) * 100)}" aria-label="Volume de ${esc(nomeAmb(k))}"></label>`).join("")}</div>` : ""}
      <div class="row"><input id="ambUrl" placeholder="Música por link (mp3/ogg)…" value="${esc(a.url)}"><button data-a="ambUrl">${a.url ? "Trocar" : "▶"}</button>${a.url ? `<button class="danger" data-a="ambUrlStop" title="Parar a música">■</button>` : ""}</div>
      <div class="row"><span class="small muted">Volume da música</span><input type="range" min="0" max="100" step="5" id="ambVol" value="${Math.round(num(a.urlVol) * 100)}"></div>
      <div class="row wrap"><button class="danger" data-a="silencio" title="Para toda a ambientação, a música e os sons por link, devagar">🔇 Silêncio</button></div>
      <div class="cenassom"><div class="small muted">Cenas sonoras guardadas</div>
        ${mine.cenasSom.length ? `<div class="row wrap">${mine.cenasSom.map((c) => `<span class="meu"><button data-a="cenaSomUsar" data-id="${esc(c.id)}" title="${esc([...c.loops.map(nomeAmb), c.url ? "música" : ""].filter(Boolean).join(", "))}">🎭 ${esc(c.nome)}</button><button class="icon ghost" data-a="cenaSomDel" data-id="${esc(c.id)}" title="Apagar">✕</button></span>`).join("")}</div>` : `<p class="muted small">Monte um clima (ex.: vento + realejo baixinho) e guarde para trocar com um clique.</p>`}
        <div class="row"><input id="csNome" placeholder="Nome (ex.: Picadeiro à noite)" maxlength="30"><button data-a="cenaSomSalvar" title="Guarda o que está tocando agora">💾 Guardar</button></div></div>
      <p class="muted small">Os sons tocam pelo botão 🔊 no canto de baixo, à esquerda, na tela de cada um. Se aparecer 🔇 vermelho, a pessoa precisa clicar nele uma vez: o navegador só libera som depois de um clique. O volume de cada um fica nesse botão.</p>
      <p class="muted small">Música por link: precisa ser um link direto para o arquivo (.mp3, .ogg). Links do YouTube, Spotify e Google Drive não funcionam.</p></section>`;
}
function somLink(x) {
  if (ui.previa || !obrOk) { tocarUrlLocal(x.url, 1); return; }
  OBR.broadcast.sendMessage(CH, { kind: "somUrl", url: x.url, vol: 1, para: ui.somPara?.length ? [...ui.somPara] : undefined }, { destination: "ALL" }).catch(() => toast("Não deu para enviar o som."));
}

/* ---------- Sussurros ---------- */
function viewSussurros() {
  ui.susPara = (ui.susPara || []).filter((id) => party.some((p) => p.id === id));
  const recibos = readJSON(susKey(), {});
  const hist = (mine.sussurros || []).slice(0, 12);
  const status = (h) => h.para.map((p) => {
    const r = recibos[h.id] || {}; const lido = r.lidos && p.id in r.lidos;
    return `<span class="${lido ? "lido" : "pend"}" title="${lido ? "Leu" : "Ainda não abriu (pode estar sem a extensão ativa)"}">${lido ? "✓" : "…"} ${esc(p.nome)}</span>`;
  }).join(" ");
  return `<section class="card sus"><h3>🗣 Sussurros <span class="muted small">só quem você marcar vê</span></h3>
      <div class="para">${chipsPara(ui.susPara, "susPara")}</div>
      <textarea id="susTxt" rows="3" maxlength="600" placeholder="Você ouve o seu nome vindo do fundo do poço…">${esc(ui.susTxt || "")}</textarea>
      <div class="row wrap"><select id="susEstilo">${SUS_ESTILOS.map(([k, n]) => `<option value="${k}" ${k === (ui.susEstilo || "sussurro") ? "selected" : ""}>${n}</option>`).join("")}</select>
        <select id="susSom">${SUS_SONS.map(([k, n]) => `<option value="${k}" ${k === (ui.susSom ?? "sussurros") ? "selected" : ""}>${n}</option>`).join("")}</select>
        <label class="chk small"><input type="checkbox" id="susResp" ${ui.susResp ? "checked" : ""}> Pode responder</label></div>
      <div class="row"><button class="primary" data-a="susEnviar">🗣 Sussurrar</button><button class="ghost" data-a="susPrevia" title="Ver como fica, só na sua tela">👁 Prévia</button><button class="ghost" data-a="susFav" title="Guardar esta frase para usar depois">★ Guardar</button></div>
      ${mine.susFav.length ? `<div class="fav"><span class="muted small">Frases guardadas:</span>${mine.susFav.map((f, i) => `<span class="meu"><button class="chip" data-a="susUsar" data-i="${i}" title="${esc(f.txt)}">${esc(f.txt.length > 34 ? f.txt.slice(0, 33) + "…" : f.txt)}</button><button class="icon ghost" data-a="susFavDel" data-i="${i}" title="Apagar">✕</button></span>`).join("")}</div>` : ""}
      ${hist.length ? `<details ${ui.susHist ? "open" : ""} data-keep="susHist"><summary class="small">Enviados (${(mine.sussurros || []).length})</summary>
        <ol class="sushist">${hist.map((h) => { const resp = (recibos[h.id]?.resp || []); return `<li><small class="muted">${hora(h.at)} · ${status(h)}</small><div class="st-${esc(h.estilo)}">${esc(h.txt)}</div>
          ${resp.map((r) => `<div class="resp">💬 <b>${esc(r.nome)}:</b> ${esc(r.txt)}</div>`).join("")}</li>`; }).join("")}</ol></details>` : ""}
      <p class="muted small">Aparece no alto da tela da pessoa, some sozinho depois de alguns segundos e só ela vê. O som escolhido toca só para ela. A mensagem passa pelo navegador de todos na sala, então não é sigilo à prova de quem abrir as ferramentas do navegador.</p></section>`;
}
function enviarSussurro(previa) {
  const txt = (ui.susTxt || "").trim(); if (!txt) return toast("Escreva o sussurro.");
  if (!obrOk) return toast("Só funciona dentro do Owlbear.");
  const estilo = ui.susEstilo || "sussurro"; const som = ui.susSom ?? "sussurros";
  if (previa) {
    OBR.broadcast.sendMessage(CH, { kind: "sussurro", sid: "previa", para: [me.id], txt, estilo, som, resp: !!ui.susResp }, { destination: "LOCAL" }).catch(() => {});
    return;
  }
  const para = outros().filter((p) => ui.susPara.includes(p.id)).map((p) => ({ id: p.id, nome: p.name }));
  if (!para.length) return toast("Escolha para quem é o sussurro.");
  const sid = uid();
  OBR.broadcast.sendMessage(CH, { kind: "sussurro", sid, para: para.map((p) => p.id), txt, estilo, som, resp: !!ui.susResp }, { destination: "REMOTE" })
    .then(() => {
      (mine.sussurros ||= []).unshift({ id: sid, at: Date.now(), para, txt, estilo }); mine.sussurros = mine.sussurros.slice(0, 40);
      ui.susTxt = ""; ui.susHist = true; saveMine(); render(); toast(`Sussurro enviado para ${para.map((p) => p.nome).join(", ")}.`);
    })
    .catch(() => toast("Não deu para enviar (texto grande demais?)."));
}

/* ---------- Efeitos das fichas (na sala) ---------- */
let fichaCfg = { ritual: true, crit: true };
function viewEfeitosFicha() {
  return `<section class="card"><h3>Efeitos das fichas na mesa</h3>
      <label class="chk"><input type="checkbox" data-a="cfgRitual" ${fichaCfg.ritual !== false ? "checked" : ""}> Animação ao conjurar ritual (na ficha de quem conjura e o selo no token)</label>
      <label class="chk"><input type="checkbox" data-a="cfgCrit" ${fichaCfg.crit !== false ? "checked" : ""}> Críticos e 1 natural aparecem na tela de todos</label>
      <p class="muted small">Vale para a sala toda, na hora. Use para tirar as animações numa cena tensa ou se alguém achar demais. O mesmo controle está na aba Mesa da ficha (mestre).</p></section>`;
}
async function salvarFichaCfg(patch) {
  fichaCfg = { ...fichaCfg, ...patch };
  if (!obrOk) return;
  try { await OBR.room.setMetadata({ [FICHA_CFG]: fichaCfg }); toast("Efeitos atualizados para a mesa."); }
  catch { toast("Não deu para salvar na sala (sem espaço?)."); }
}

async function tokensOf(e) {
  if (!sceneOk) return [];
  try {
    if (e.sheetId) return (await OBR.scene.items.getItems((it) => it.metadata?.[LINK_KEY]?.sheetId === e.sheetId)).map((i) => i.id);
    if (e.tokenId) return (await OBR.scene.items.getItems([e.tokenId])).map((i) => i.id);
  } catch { /* */ }
  return [];
}
async function updateRing() {
  if (!sceneOk) return;
  try {
    const old = await OBR.scene.items.getItems((it) => it.metadata?.[RING]);
    if (old.length) await OBR.scene.items.deleteItems(old.map((i) => i.id));
    const c = C(); const e = c.lista[c.vez];
    if (!c.ativo || !c.anel || !e) return;
    const ids = await tokensOf(e); if (!ids.length) return;
    const toks = await OBR.scene.items.getItems(ids); const add = [];
    for (const t of toks) {
      const b = await OBR.scene.items.getItemBounds([t.id]); const d = Math.max(b.width, b.height) * 1.3;
      add.push(buildShape().shapeType("CIRCLE").width(d).height(d).position(b.center).fillOpacity(0).strokeColor("#e0203a").strokeOpacity(1).strokeWidth(Math.max(4, d * 0.04)).strokeDash([18, 10])
        .attachedTo(t.id).layer("ATTACHMENT").locked(true).disableHit(true).visible(t.visible).disableAttachmentBehavior(["ROTATION", "SCALE"]).metadata({ [RING]: true }).zIndex(0).build());
    }
    if (add.length) await OBR.scene.items.addItems(add);
  } catch (err) { console.warn("Escudo: anel do turno", err); }
}
function nomePublico(e) { return e.oculto ? "uma criatura" : cNome(e); }
function anunciarVez() {
  const c = C(); const e = c.lista[c.vez]; if (!e) return;
  toast(`Rodada ${c.rodada}: vez de ${cNome(e)}`);
  if (c.anunciar && obrOk) OBR.broadcast.sendMessage(CH, { kind: "turno", text: `⚔ Rodada ${c.rodada}: vez de ${nomePublico(e)}` }).catch(() => {});
  seguirVez();
}
// No início do turno, as condições com prazo perdem uma rodada
function tickConds(e) {
  const venceu = [];
  for (const x of e.conds || []) { if (x.r > 0) { x.r -= 1; if (x.r === 0) venceu.push(x.n); } }
  e.conds = (e.conds || []).filter((x) => !(x.r === 0 && venceu.includes(x.n)));
  if (venceu.length && e.sheetId) applySheet(e.sheetId, (s) => { s.condicoes = (s.condicoes || []).filter((c) => !venceu.includes(c)); }, `fim de ${venceu.join(", ")}`);
  if (venceu.length) toast(`${cNome(e)}: acabou ${venceu.join(", ")}.`);
}
function avancar(d) {
  const c = C(); const n = c.lista.length; if (!n) return;
  if (d > 0) { c.vez += 1; if (c.vez >= n) { c.vez = 0; c.rodada += 1; } tickConds(c.lista[c.vez]); }
  else { c.vez -= 1; if (c.vez < 0) { if (c.rodada > 1) { c.rodada -= 1; c.vez = n - 1; } else c.vez = 0; } }
  saveMine(); render(); anunciarVez(); updateRing();
}
function findC(id) { return C().lista.find((e) => e.id === id); }
function danoC(e, v) {
  if (e.sheetId) { const s = applySheet(e.sheetId, (s) => danoNaFicha(s, v), `${v} de dano em ${cNome(e)}`); if (s && num(s.pv.atual) <= 0) toast(`${nomeS(s)} caiu a 0 PV.`); }
  else { e.pv = Math.max(0, num(e.pv) - v); if (e.pv <= 0) toast(`${e.nome} caiu.`); saveMine(); }
}

/* ---------- Aba: Ferramentas ---------- */
function viewFerramentas() {
  const h = hx(); const sheets = allSheets();
  let estig = "";
  if (h) {
    const lib = new Set((h.sacrificios || []).map((s) => s.estigma));
    const carrega = {}; const des = [];
    for (const t of h.equipes) for (const m of t.membros || []) {
      if (m.sac && m.vivo) (carrega[m.sac] ||= []).push(`${hxMemberName(m, h)} (${t.nome})`);
      if (m.vivo && (m.des || (m.sheetId && getSheet(m.sheetId)?.hexa?.desertor))) des.push(`${hxMemberName(m, h)} (${t.nome})`);
    }
    estig = `<section class="card"><h3>Sacrifícios e estigmas <span class="muted small">só o mestre</span></h3>
      <ul class="estig">${ESTIGMAS.map((e) => `<li class="${lib.has(e.nome) ? "feito" : ""}"><b>${esc(e.nome)}</b>${lib.has(e.nome) ? " ✠ realizado" : ""}
        <div class="small">Com o estigma: <b>${(carrega[e.nome] || []).map(esc).join(", ") || "ninguém vivo"}</b></div>
        <div class="small muted">Intenção: ${esc(e.missao)}</div></li>`).join("")}</ul>
      ${des.length ? `<p class="small"><b>Desertores vivos:</b> ${des.map(esc).join(", ")}</p>` : ""}
      ${(h.mortes || []).length ? `<details><summary>Mortes (${h.mortes.length})</summary><ul class="small">${h.mortes.map((m) => `<li>Dia ${num(m.dia)}: ${esc(m.nome)} (${esc(m.equipe)})${m.algoz ? ` — por ${esc(m.algoz)}` : ""}${m.sac ? ` ✠ ${esc(m.sac)}` : ""}</li>`).join("")}</ul></details>` : ""}</section>`;
  }
  ui.grupo ||= {};
  return `${estig}${viewEfeitosFicha()}
    <section class="card"><h3>Ações em grupo</h3>
      <div class="pick">${sheets.map((s) => `<label class="chk"><input type="checkbox" data-grp="${s.id}" ${ui.grupo[s.id] ? "checked" : ""}> ${esc(nomeS(s))}</label>`).join("") || `<span class="muted">Sem fichas.</span>`}</div>
      <div class="row wrap"><input type="number" min="0" id="gVal" class="n4" placeholder="valor"><button class="danger" data-a="gDano">Dano</button><button data-a="gCura">Cura</button><button data-a="gPd" data-d="-1">PD/PE−</button><button data-a="gPd" data-d="1">PD/PE+</button></div>
      <div class="row wrap"><select id="gCond"><option value="">condição…</option>${CONDICOES.map(([n]) => `<option>${esc(n)}</option>`).join("")}</select><button data-a="gCondAdd">Aplicar</button><button data-a="gCondDel">Tirar</button></div>
      <p class="muted small">Ex.: explosão em área, dano de fome, todos abalados pelo sino. Use ↶ no topo para desfazer, uma ficha por vez.</p></section>
    <section class="card"><h3>Anúncio para a mesa</h3>
      <div class="row"><input id="anuncio" placeholder="Ex.: O sino da Coroa ecoa pela floresta…"><button class="primary" data-a="anunciar">📢</button></div>
      <p class="muted small">Aparece como notificação para todos os jogadores.</p></section>
    <section class="card"><h3>Gerador de nomes</h3>
      <div class="row"><button data-a="nome">🎲 Pessoa</button><button data-a="nomeCirco">🎪 Do circo</button><span class="gen">${esc(ui.nome || "")}</span></div></section>
    <section class="card"><h3>Condições</h3>
      <dl class="conds">${CONDICOES.map(([n, d]) => `<dt>${esc(n)}</dt><dd>${esc(d)}</dd>`).join("")}</dl></section>`;
}

/* ---------- Parte pública (fica na sala; todos leem) ---------- */
function montarPub() {
  return {
    relogios: mine.relogios.filter((r) => r.pub).map(({ id, nome, seg, atual }) => ({ id, nome, seg, atual })),
    timer: mine.timer?.pub ? { nome: mine.timer.nome, fim: mine.timer.fim } : null,
    amb: { loops: [...mine.amb.loops], url: mine.amb.url, urlVol: mine.amb.urlVol, vols: Object.fromEntries(mine.amb.loops.map((k) => [k, volAmb(k)])) }, rev: Date.now(),
  };
}
let pubTimer;
function publicar() {
  saveMine(); pub = montarPub();
  lsSet(`${NS}:pub:${roomId}`, JSON.stringify(pub)); // o fundo responde com isto a quem chegar depois
  if (!obrOk) return;
  clearTimeout(pubTimer);
  pubTimer = setTimeout(() => {
    // vai por mensagem (chega na hora) e fica guardado na sala (para quem entrar depois)
    OBR.broadcast.sendMessage(CH, { kind: "pub", pub }, { destination: "ALL" }).catch(() => {});
    OBR.room.setMetadata({ [PUB_KEY]: pub }).catch(() => {});
  }, 150);
}
/* ---------- Quem está ouvindo ---------- */
const ouvintes = {}; // id -> { nome, estado, vol, v, at }
function perguntarQuemOuve() { if (obrOk) OBR.broadcast.sendMessage(CH, { kind: "quemOuve" }, { destination: "ALL" }).catch(() => {}); }
function statusOuvinte(id) {
  const o = ouvintes[id];
  if (!o || Date.now() - o.at > 60000) return ["sem", "❔ sem resposta", "A extensão dele está numa versão antiga ou a caixa de som não abriu. Peça para recarregar a página (F5)."];
  if (o.estado !== "running") return ["bloq", "🔇 bloqueado", "Precisa clicar uma vez no botão 🔇 no canto de baixo, à esquerda."];
  if (Number(o.vol) === 0) return ["mudo", "🔈 volume 0", "Está ouvindo, mas com o volume no zero."];
  return ["ok", `🔊 ouvindo · ${Math.round(Number(o.vol) * 100)}%`, ""];
}
function viewOuvintes() {
  const pessoas = [{ id: me.id, name: `${me.name} (você)` }, ...party.map((p) => ({ id: p.id, name: p.name }))];
  const semSom = pessoas.filter((p) => statusOuvinte(p.id)[0] !== "ok");
  return `<section class="card"><h3>Quem está ouvindo</h3>
    <ul class="ouvintes">${pessoas.map((p) => { const [k, txt, dica] = statusOuvinte(p.id); return `<li class="o-${k}"><b>${esc(p.name)}</b> <span>${txt}</span>${dica ? `<small class="muted">${esc(dica)}</small>` : ""}</li>`; }).join("")}</ul>
    <div class="row wrap"><button data-a="ouvVerificar">🔄 Verificar</button><button data-a="ouvTestar">🔔 Testar som em todos</button>
      ${semSom.length ? `<button class="primary" data-a="ouvAvisar" title="Mostra um aviso na tela de quem está sem som e reabre o botão de som dele">📣 Avisar quem está sem som (${semSom.length})</button>` : ""}</div></section>`;
}
function som(k) {
  if (ui.previa || !obrOk) { tocarLocal(k); return; }
  OBR.broadcast.sendMessage(CH, { kind: "som", k, para: ui.somPara?.length ? [...ui.somPara] : undefined }, { destination: "ALL" }).catch(() => toast("Não deu para enviar o som."));
}
function relAvisar(r) { if (r.pub) anunciar(`🕒 ${r.nome}: ${num(r.atual)}/${num(r.seg)}${num(r.atual) >= num(r.seg) ? " — completo!" : ""}`); }
function findRel(id) { return mine.relogios.find((r) => r.id === id); }
async function lerCena() {
  cenaId = null; if (!sceneOk) return;
  try {
    const md = await OBR.scene.getMetadata(); cenaId = md[CENA_KEY] || null;
    if (!cenaId && isGM()) { cenaId = uid(); await OBR.scene.setMetadata({ [CENA_KEY]: cenaId }); }
  } catch { /* */ }
}
setInterval(() => { for (const el of document.querySelectorAll(".countdown")) el.textContent = restante(el.dataset.fim); }, 1000);

/* ---------- Eventos ---------- */
function val(id) { return document.getElementById(id)?.value ?? ""; }
function grupoIds() { return Object.entries(ui.grupo).filter(([, v]) => v).map(([k]) => k).filter((id) => getSheet(id)); }

$app.addEventListener("change", (ev) => {
  const el = ev.target; const d = el.dataset;
  if (d.secsel) { ui.secSel[d.secsel] = el.checked; return; }
  if (d.grp) { ui.grupo[d.grp] = el.checked; return; }
  if (d.cini) { const e = findC(d.cini); if (e) { e.ini = num(el.value); e.pick = 0; sortCombate(); saveMine(); render(); } return; }
  if (d.cdef) { const e = findC(d.cdef); if (e) { e.def = el.value === "" ? "" : num(el.value); saveMine(); } return; }
  if (d.calvo) { ui.alvo[d.calvo] = el.value; return; }
  if (el.id === "secTeste" || el.id?.startsWith("t-")) { ui.lastTeste = el.value; return; }
  if (el.id === "secBonus") { ui.secBonus = el.value; return; }
  if (el.id === "secDT") { ui.secDT = el.value; return; }
  if (el.id === "exprLivre") { ui.expr = el.value; return; }
  if (d.a === "soOnline") { mine.soOnline = el.checked; saveMine(); render(); return; }
  if (d.a === "cAnel") { C().anel = el.checked; saveMine(); updateRing(); return; }
  if (d.a === "cAnunciar") { C().anunciar = el.checked; saveMine(); return; }
  if (d.a === "cSeguir") { C().seguir = el.checked; saveMine(); if (el.checked) seguirVez(); return; }
  if (el.id === "genTipo") { mine.gen.tipo = el.value; saveMine(); return; }
  if (el.id === "genVd") { mine.gen.vd = num(el.value); saveMine(); return; }
  if (el.id === "genPapel") { mine.gen.papel = el.value; saveMine(); return; }
  if (el.id === "genTraco") { mine.gen.traco = el.value; saveMine(); return; }
  if (el.id === "somPrevia") { ui.previa = el.checked; return; }
  if (el.id === "susEstilo") { ui.susEstilo = el.value; return; }
  if (el.id === "susSom") { ui.susSom = el.value; return; }
  if (el.id === "susResp") { ui.susResp = el.checked; return; }
  if (d.a === "cfgRitual") { salvarFichaCfg({ ritual: el.checked }); return; }
  if (d.a === "cfgCrit") { salvarFichaCfg({ crit: el.checked }); return; }
  if (d.ambvol) { mine.amb.vols = { ...(mine.amb.vols || {}), [d.ambvol]: clamp(num(el.value) / 100, 0, 1) }; publicar(); return; }
  if (el.id === "ambVol") { mine.amb.urlVol = clamp(num(el.value) / 100, 0, 1); publicar(); return; }
});
let notasTimer;
$app.addEventListener("input", (ev) => {
  const el = ev.target;
  if (el.id === "notas") { mine.notas = el.value; clearTimeout(notasTimer); notasTimer = setTimeout(saveMine, 400); }
  if (el.id === "susTxt") ui.susTxt = el.value;
  if ((el.id === "cenaTxt" || el.id === "cenaNome") && cenaId) {
    const c = (mine.cenas[cenaId] ||= { nome: "", txt: "", at: 0 }); c[el.id === "cenaTxt" ? "txt" : "nome"] = el.value; c.at = Date.now();
    clearTimeout(notasTimer); notasTimer = setTimeout(saveMine, 400);
  }
  if (el.id === "volJog") {
    lsSet(`${NS}:vol`, String(num(el.value) / 100)); setVolLocal(num(el.value) / 100);
    const t = document.getElementById("volTxt"); if (t) t.textContent = `${el.value}%`;
  }
});
$app.addEventListener("keydown", (ev) => {
  if (ev.key !== "Enter") return;
  const id = ev.target.id;
  if (id === "exprLivre") document.querySelector('[data-a="exprRolar"]')?.click();
  else if (id === "anuncio") document.querySelector('[data-a="anunciar"]')?.click();
  else if (id === "relNome") document.querySelector('[data-a="relNovo"]')?.click();
  else if (id === "ambUrl") document.querySelector('[data-a="ambUrl"]')?.click();
  else if (id === "timerNome" || id === "timerMin") document.querySelector('[data-a="timerIniciar"]')?.click();
  else if (id?.startsWith("v-")) document.querySelector(`[data-a="dano"][data-id="${id.slice(2)}"]`)?.click();
  else if (id?.startsWith("cv-")) document.querySelector(`[data-a="cDano"][data-id="${id.slice(3)}"]`)?.click();
});

$app.addEventListener("click", async (ev) => {
  const b = ev.target.closest("[data-tab],[data-a]"); if (!b || b.tagName === "INPUT") return;
  if (b.dataset.tab) { tab = b.dataset.tab; lsSet(NS + ":tab", tab); if (tab === "cena") perguntarQuemOuve(); render(); return; }
  if (b.tagName === "A") ev.preventDefault();
  const a = b.dataset.a; const id = b.dataset.id;
  const s = id ? getSheet(id) : null;
  const v = () => Math.max(0, num(val(`v-${id}`)));

  switch (a) {
    case "undo": return undoLast();
    case "pedir": fichaSend({ t: "request" }); return toast("Pedido enviado: as fichas chegam em alguns segundos.");
    case "modal":
      if (IS_MODAL) OBR.modal.close(MODAL_ID);
      else OBR.modal.open({ id: MODAL_ID, url: new URL("index.html?modal=1", location.href).href, width: 1000, height: 900 });
      return;
    case "toggle": if (ev.target.closest("button")) return; ui.open[id] = !ui.open[id]; return render();
    case "dano": { const x = v(); if (!x) return toast("Digite o valor."); applySheet(id, (s) => danoNaFicha(s, x), `${x} de dano em ${nomeS(s)}`); return render(); }
    case "cura": { const x = v(); if (!x) return toast("Digite o valor."); applySheet(id, (s) => curaNaFicha(s, x), `cura de ${x} em ${nomeS(s)}`); return render(); }
    case "pd": { const x = (v() || 1) * num(b.dataset.d); applySheet(id, (s) => { s.pd.atual = clamp(num(s.pd.atual) + x, 0, num(s.pd.max)); }, `${resSig(s)} de ${nomeS(s)}`); return render(); }
    case "san": { const x = (v() || 1) * num(b.dataset.d); applySheet(id, (s) => { s.san ||= { atual: 0, max: 0 }; s.san.atual = clamp(num(s.san.atual) + x, 0, num(s.san.max)); }, `SAN de ${nomeS(s)}`); return render(); }
    case "condAdd": { const c = val(`c-${id}`); if (!c) return; applySheet(id, (s) => { if (!s.condicoes.includes(c)) s.condicoes.push(c); }, `${c} em ${nomeS(s)}`); return render(); }
    case "condDel": {
      const c = b.dataset.c;
      if (s && !(s.condicoes || []).includes(c)) return toast(`${c} vem de um efeito com prazo: tire pela ficha.`);
      applySheet(id, (s) => { s.condicoes = s.condicoes.filter((x) => x !== c); }, `tirar ${c} de ${nomeS(s)}`); return render();
    }
    case "testeUm": {
      const k = val(`t-${id}`); ui.lastTeste = k; const r = rollFor(s, k);
      ui.res1 = { id, txt: `${testeNome(k)}: ${r.txt}` }; addLog(`${nomeS(s)} — ${testeNome(k)} (secreto): ${r.txt}`); return render();
    }
    case "abrirFicha": {
      if (!obrOk) return;
      lsSet(OPEN_KEY, JSON.stringify({ sheetId: id, at: Date.now() }));
      OBR.modal.open({ id: FICHA_NS + "/modal", url: FICHA_URL + "?modal=1", width: 900, height: 1000 });
      return;
    }
    case "selToken": {
      const ids = await tokensOf({ sheetId: id });
      if (!ids.length) return toast("Esta ficha não está vinculada a um token nesta cena.");
      OBR.player.select(ids); return;
    }
    case "ocultar": mine.ocultas.push(id); saveMine(); toast(`${nomeS(s)} saiu do painel.`); return render();
    case "mostrarTodas": mine.ocultas = []; saveMine(); return render();

    /* Secretas */
    case "secTodos": ui.secSel = Object.fromEntries(allSheets().map((s) => [s.id, true])); return render();
    case "secNenhum": ui.secSel = {}; return render();
    case "secRolar": {
      const k = val("secTeste"); const bonus = num(val("secBonus")); const dt = val("secDT");
      ui.lastTeste = k; ui.secBonus = val("secBonus"); ui.secDT = dt;
      const alvo = allSheets().filter((s) => ui.secSel[s.id]); if (!alvo.length) return toast("Marque pelo menos um personagem.");
      const linhas = alvo.map((s) => { const r = rollFor(s, k, bonus); return { nome: nomeS(s), txt: r.txt, total: r.total, ok: dt === "" ? null : r.total >= num(dt) }; });
      ui.secRes = { titulo: `${testeNome(k)}${bonus ? ` ${fmt(bonus)}` : ""}${dt !== "" ? ` · DT ${dt}` : ""}`, linhas };
      addLog(`${ui.secRes.titulo} (secreto)\n` + linhas.map((l) => `${l.nome}: ${l.total}${l.ok === true ? " ✔" : l.ok === false ? " ✘" : ""}`).join("\n"));
      return render();
    }
    case "dado": { const r = rollExpr(b.dataset.e); ui.exprRes = `${b.dataset.e}: ${r.txt} = ${r.total}`; addLog(ui.exprRes); return render(); }
    case "exprRolar": case "exprPub": {
      const e = val("exprLivre"); ui.expr = e; const r = rollExpr(e); if (!r.ok) return toast("Expressão inválida. Ex.: 2d6+3");
      ui.exprRes = `${e}: ${r.txt} = ${r.total}`;
      if (a === "exprPub") { anunciar(`🎲 Mestre rolou ${ui.exprRes}`); addLog(ui.exprRes, "Mestre", false); } else addLog(ui.exprRes);
      return render();
    }
    case "logFiltro": ui.logFiltro = b.dataset.k; return render();
    case "logLimpar": lsSet(logKey(), "[]"); return render();

    /* Combate */
    case "cToggle": if (ev.target.closest("button,input,select")) return; ui.cOpen[id] = !ui.cOpen[id]; return render();
    case "cIniciar": { const c = C(); c.ativo = true; c.rodada = 1; c.vez = 0; saveMine(); render(); anunciarVez(); updateRing(); return; }
    case "cFim": { const c = C(); c.ativo = false; saveMine(); render(); updateRing(); if (c.anunciar) anunciar("⚔ O combate terminou."); return; }
    case "cNext": return avancar(1);
    case "cPrev": return avancar(-1);
    case "cReroll": { for (const e of C().lista) { const r = iniDe(e); e.ini = r.total; e.pick = r.pick; } C().vez = 0; sortCombate(); C().vez = 0; saveMine(); addLog("Iniciativa:\n" + C().lista.map((e, i) => `${i + 1}. ${cNome(e)} — ${e.ini}`).join("\n")); render(); updateRing(); return; }
    case "cLimpar": { const c = C(); c.lista = []; c.vez = 0; c.rodada = 1; c.ativo = false; saveMine(); render(); updateRing(); return; }
    case "cAddPCs": for (const s of allSheets()) if (!C().lista.some((e) => e.sheetId === s.id)) addCombatente({ sheetId: s.id, nome: nomeS(s) }); return render();
    case "cAddPC": { const sid = val("cAddPC"); if (!sid) return; addCombatente({ sheetId: sid, nome: nomeS(getSheet(sid)) }); return render(); }
    case "cAddBest": {
      const i = val("cBest"); if (i === "") return toast("Escolha a criatura.");
      const cri = bestiarioTodo()[Number(i)]; const q = clamp(num(val("cQtd")) || 1, 1, 20);
      const ja = C().lista.filter((e) => e.cri?.nome === cri.nome).length;
      for (let k = 0; k < q; k++) {
        const nome = q > 1 || ja ? `${cri.nome} ${ja + k + 1}` : cri.nome; const pv = num(cri.pvAtual ?? cri.pv) || num(cri.pv);
        addCombatente({ nome, cri: { nome: cri.nome, tipo: cri.tipo, vd: cri.vd, ini: cri.ini, per: cri.per, res: cri.res, atq: cri.atq, extra: cri.extra, hab: cri.hab, pp: cri.pp, rd: cri.rd, vuln: cri.vuln, desl: cri.desl, attrs: cri.attrs || "", lore: cri.lore || null }, pv, pvMax: num(cri.pv) || pv, def: cri.def === "" ? "" : num(cri.def), oculto: true });
      }
      return render();
    }
    case "cAddNpc": {
      const nome = val("cNome").trim(); if (!nome) return toast("Dê um nome.");
      const pv = num(val("cPv")); addCombatente({ nome, ini: num(val("cIni")), pv, pvMax: pv, def: val("cDef") === "" ? "" : num(val("cDef")) }); return render();
    }
    case "cDel": { const c = C(); const i = c.lista.findIndex((e) => e.id === id); if (i < 0) return; c.lista.splice(i, 1); if (i < c.vez) c.vez -= 1; c.vez = clamp(c.vez, 0, Math.max(0, c.lista.length - 1)); saveMine(); render(); updateRing(); return; }
    case "cOculto": { const e = findC(id); e.oculto = !e.oculto; saveMine(); return render(); }
    case "cDano": case "cCura": {
      const e = findC(id); const x = Math.max(0, num(val(`cv-${id}`))); if (!x) return toast("Digite o valor.");
      if (a === "cDano") danoC(e, x);
      else if (e.sheetId) applySheet(e.sheetId, (s) => curaNaFicha(s, x), `cura em ${cNome(e)}`);
      else { e.pv = Math.min(num(e.pvMax) || Infinity, num(e.pv) + x); saveMine(); }
      return render();
    }
    case "cAplicar": { const e = findC(id); if (!e) return; danoC(e, num(b.dataset.v)); ui.cRes = null; return render(); }
    case "cCond": {
      const e = findC(id); const c = val(`cc-${id}`); if (!c) return; const r = num(val(`cr-${id}`));
      e.conds = (e.conds || []).filter((x) => x.n !== c); if (r > 0 || !e.sheetId) e.conds.push({ n: c, r: r > 0 ? r : 0 });
      if (e.sheetId) applySheet(e.sheetId, (s) => { if (!s.condicoes.includes(c)) s.condicoes.push(c); }, `${c} em ${cNome(e)}`);
      saveMine(); return render();
    }
    case "cCondDel": {
      const e = findC(id); const c = b.dataset.c; e.conds = (e.conds || []).filter((x) => x.n !== c);
      if (e.sheetId) { const s2 = getSheet(e.sheetId); if (s2 && (s2.condicoes || []).includes(c)) applySheet(e.sheetId, (s) => { s.condicoes = s.condicoes.filter((x) => x !== c); }, `tirar ${c} de ${cNome(e)}`); }
      saveMine(); return render();
    }
    case "cAtq": {
      const e = findC(id); const atq = e.cri.atq[num(b.dataset.i)]; const alvoId = ui.alvo[id]; const alvo = alvoId && findC(alvoId);
      const t = rollMonster(atq[1]); const nat = /\[([^\]]+)\]/.exec(t.txt);
      const crit = nat && t.pick === 20; const dmg = rollExpr(atq[2]); const dmg2 = crit ? rollExpr(atq[2]) : null;
      const total = dmg.total + (dmg2 ? dmg2.total : 0);
      const def = alvo ? num(cDef(alvo)) : null; const acerta = def != null ? t.total >= def : null;
      const txt = `${cNome(e)} — ${atq[0]}${alvo ? ` em ${cNome(alvo)} (Def ${def})` : ""}\nAtaque: ${t.txt}${acerta === true ? " → ACERTA" : acerta === false ? " → erra" : ""}${crit ? " ✦ 20 natural (confira a margem de crítico)" : ""}\nDano: ${dmg.txt}${dmg2 ? ` + ${dmg2.txt} (dados dobrados)` : ""} = ${total} ${atq[3] || ""}`;
      ui.cRes = { id, txt, dano: acerta === false ? null : total, alvo: alvoId || null }; addLog(txt); return render();
    }
    case "cExtra": { const r = rollExpr(b.dataset.e); const txt = `${cNome(findC(id))} — ${b.dataset.n}: ${r.txt} = ${r.total}`; ui.cRes = { id, txt }; addLog(txt); return render(); }
    case "cRes": {
      const e = findC(id); const r = rollMonster(b.dataset.r === "Percepção" ? e.cri.per : e.cri.res?.[b.dataset.r]);
      const txt = `${cNome(e)} — ${b.dataset.r}: ${r.txt}`; ui.cRes = { id, txt }; addLog(txt); return render();
    }
    case "cVincular": {
      if (!obrOk) return; const sel = await OBR.player.getSelection();
      if (!sel?.length) return toast("Selecione o token da criatura no mapa e clique de novo.");
      findC(id).tokenId = sel[0]; saveMine(); toast("Token vinculado."); render(); updateRing(); return;
    }
    case "cSel": { const ids = await tokensOf(findC(id)); if (!ids.length) return toast("Sem token vinculado nesta cena."); OBR.player.select(ids); return; }

    /* Ferramentas */
    case "gDano": case "gCura": case "gPd": {
      const ids = grupoIds(); if (!ids.length) return toast("Marque os personagens."); const x = Math.max(0, num(val("gVal")));
      if (!x && a !== "gPd") return toast("Digite o valor.");
      for (const sid of ids) applySheet(sid, (s) => {
        if (a === "gDano") danoNaFicha(s, x); else if (a === "gCura") curaNaFicha(s, x);
        else s.pd.atual = clamp(num(s.pd.atual) + (x || 1) * num(b.dataset.d), 0, num(s.pd.max));
      }, `${a === "gDano" ? "dano" : a === "gCura" ? "cura" : "PD"} em grupo (${nomeS(getSheet(sid))})`);
      toast(`Aplicado em ${ids.length} ficha(s).`); return render();
    }
    case "gCondAdd": case "gCondDel": {
      const ids = grupoIds(); const c = val("gCond"); if (!ids.length || !c) return toast("Marque os personagens e escolha a condição.");
      for (const sid of ids) applySheet(sid, (s) => { s.condicoes = s.condicoes.filter((x) => x !== c); if (a === "gCondAdd") s.condicoes.push(c); }, `${c} em grupo`);
      toast(`${a === "gCondAdd" ? "Aplicado" : "Tirado"}: ${c}.`); return render();
    }
    case "anunciar": { const t = val("anuncio").trim(); if (!t) return; anunciar(`📢 ${t}`); toast("Anúncio enviado."); document.getElementById("anuncio").value = ""; return; }
    case "nome": ui.nome = `${pick(NOMES)} ${pick(SOBRENOMES)}`; return render();
    case "nomeCirco": ui.nome = `${pick(NOMES)}, ${pick(APELIDOS)}`; return render();

    /* Combate: tokens e gerador */
    case "cAddSel": return addSelecionados();
    case "genModo": ui.genModo = b.dataset.k; return render();
    case "eqGerar": {
      mine.genEq = { tema: val("eqTema") || "sorteio", nex: num(val("eqNex")) || 35, tam: num(val("eqTam")) || 4, comp: val("eqComp") || "equilibrada" }; saveMine();
      ui.equipe = gerarEquipe(mine.genEq); ui.eqAlvo = undefined; return render();
    }
    case "eqHist": if (ui.equipe) outraHistoriaEquipe(ui.equipe); return render();
    case "eqMembro": ev.preventDefault?.(); if (ui.equipe) outroMembro(ui.equipe, num(b.dataset.i)); return render();
    case "eqCombate": {
      const e = ui.equipe; if (!e) return;
      for (const m of e.membros) addCombatente({ nome: m.nome, cri: { nome: m.nome, tipo: m.tipo, vd: m.vd, ini: m.ini, per: m.per, res: m.res, atq: m.atq, extra: m.extra, hab: m.hab, attrs: m.attrs, desl: m.desl, lore: { resumo: m.historia.join(" ") } }, pv: num(m.pv), pvMax: num(m.pv), def: num(m.def), oculto: true });
      toast(`${e.membros.length} integrantes de ${e.nome} no combate.`); return render();
    }
    case "eqCopiar": {
      const e = ui.equipe; if (!e) return;
      try { await navigator.clipboard.writeText([...equipeTexto(e), "", ...e.membros.map(membroTexto)].join("\n")); toast("Copiado."); } catch { toast("Não deu para copiar aqui."); }
      return;
    }
    case "eqHexa": {
      const e = ui.equipe; if (!e) return; const ti = document.getElementById("eqAlvo") ? num(val("eqAlvo")) : -1; ui.eqAlvo = ti >= 0 ? ti : undefined;
      const alvo = hx()?.equipes?.[ti];
      if (alvo && (alvo.membros || []).some((m) => !m.sheetId) && !b.classList.contains("confirm")) { b.classList.add("confirm"); b.textContent = "Confirmar: trocar os NPCs?"; return; }
      const plano = [`${e.nome} (${e.temaNome})`, ...equipeTexto(e).slice(3)].join("\n");
      const membros = e.membros.map(({ funcao, classe, lealdade, ...m }) => m);
      lsSet(HX_IMPORT, JSON.stringify({ at: Date.now(), ti, equipe: { nome: e.nome, membros, plano, perfil: equipeTexto(e).slice(1) } }));
      toast(`${e.nome} enviada ao Hexatombe. Ela aparece na aba Equipes.`); return render();
    }
    case "gerar": {
      mine.gen = { tipo: val("genTipo") || mine.gen.tipo, vd: num(val("genVd")) || mine.gen.vd, papel: val("genPapel") || mine.gen.papel, traco: val("genTraco") || "nenhum" }; saveMine();
      lembrarGerado(ui.gerado); ui.gerado = gerarNpc(mine.gen); return render();
    }
    case "genTraco": { if (!ui.gerado) return; aplicarTraco(ui.gerado); return render(); }
    case "genVoltar": {
      const r = (ui.recentes || [])[num(b.dataset.i)]; if (!r) return;
      ui.recentes = ui.recentes.filter((x) => x !== r); lembrarGerado(ui.gerado); ui.gerado = r; return render();
    }
    /* Encontro */
    case "encGerar": {
      mine.genEnc = { tema: val("encTema") || "sorteio", vd: num(val("encVd")) || 40, dif: val("encDif") || "medio", el: val("encEl") || "sorteio" }; saveMine();
      ui.encontro = gerarEncontro(mine.genEnc); return render();
    }
    case "encCena": if (ui.encontro) cenaEncontro(ui.encontro); return render();
    case "encGrupo": ev.preventDefault?.(); if (ui.encontro) outroGrupo(ui.encontro, num(b.dataset.i)); return render();
    case "encGrupoCombate": { const x = ui.encontro?.grupos[num(b.dataset.i)]; if (!x) return; grupoNoCombate(x); toast(`${x.qtd > 1 ? `${x.qtd}× ` : ""}${x.g.nome} no combate.`); return render(); }
    case "encCombate": {
      const e = ui.encontro; if (!e) return; let n = 0;
      for (const x of e.grupos) n += grupoNoCombate(x);
      toast(`${n} no combate: ${e.titulo}.`); return render();
    }
    case "encGuardar": { const x = ui.encontro?.grupos[num(b.dataset.i)]; if (!x) return; (mine.npcs ||= []).unshift(geradoParaBestiario(x.g)); mine.npcs = mine.npcs.slice(0, 40); saveMine(); toast("Guardado: aparece em “Criatura do bestiário…”."); return render(); }
    case "encCopiar": {
      const e = ui.encontro; if (!e) return;
      try { await navigator.clipboard.writeText([...encontroTexto(e), "", ...e.grupos.map((x) => npcTexto(x.g))].join("\n\n")); toast("Copiado."); } catch { toast("Não deu para copiar aqui."); }
      return;
    }
    case "genNome": { if (!ui.gerado) return; outroNome(ui.gerado); return render(); }
    case "genHabs": { if (!ui.gerado) return; outrasHabilidades(ui.gerado); return render(); }
    case "genLore": { if (!ui.gerado) return; outraHistoria(ui.gerado); return render(); }
    case "genCombate": {
      const g = ui.gerado; if (!g) return; const q = clamp(num(val("genQtd")) || 1, 1, 20);
      for (let k = 0; k < q; k++) addCombatente({ nome: q > 1 ? `${g.nome} ${k + 1}` : g.nome, cri: { nome: g.nome, ...g.cri }, pv: g.pvInicial || g.pv, pvMax: g.pv, def: g.def, oculto: true });
      toast(`${q > 1 ? `${q}× ` : ""}${g.nome} no combate.`); return render();
    }
    case "genSalvar": { if (!ui.gerado) return; (mine.npcs ||= []).unshift(geradoParaBestiario(ui.gerado)); mine.npcs = mine.npcs.slice(0, 40); saveMine(); toast("Guardado: aparece em “Criatura do bestiário…”."); return render(); }
    case "genApagar": mine.npcs = (mine.npcs || []).filter((n) => n.id !== id); saveMine(); return render();
    case "genCopiar": {
      const g = ui.gerado; if (!g) return;
      const t = npcTexto(g);
      try { await navigator.clipboard.writeText(t); toast("Copiado."); } catch { toast("Não deu para copiar aqui."); }
      return;
    }

    /* Cena: sons */
    case "som": return som(b.dataset.k);
    case "somTodos": ui.somPara = []; return render();
    case "somPara": { const p = b.dataset.pid; ui.somPara = ui.somPara.includes(p) ? ui.somPara.filter((x) => x !== p) : [...ui.somPara, p]; return render(); }
    case "somLink": { const x = mine.sonsLink.find((y) => y.id === id); if (x) somLink(x); return; }
    case "somLinkDel": mine.sonsLink = mine.sonsLink.filter((y) => y.id !== id); saveMine(); return render();
    case "somLinkNovo": {
      const nome = val("slNome").trim().slice(0, 30); const url = val("slUrl").trim();
      if (!/^https:\/\/\S+$/i.test(url)) return toast("Cole um link https:// direto para um arquivo de áudio.");
      mine.sonsLink.push({ id: uid(), nome: nome || "Meu som", url }); ui.slAberto = false; saveMine(); return render();
    }
    case "silencio":
      mine.amb.loops = []; mine.amb.url = ""; publicar();
      if (obrOk) OBR.broadcast.sendMessage(CH, { kind: "silencio" }, { destination: "ALL" }).catch(() => {});
      return render();
    case "cenaSomSalvar": {
      const nome = val("csNome").trim().slice(0, 30); if (!nome) return toast("Dê um nome à cena sonora.");
      if (!mine.amb.loops.length && !mine.amb.url) return toast("Ligue algum ambiente ou música antes de guardar.");
      mine.cenasSom = mine.cenasSom.filter((c) => c.nome !== nome);
      mine.cenasSom.push({ id: uid(), nome, loops: [...mine.amb.loops], vols: { ...(mine.amb.vols || {}) }, url: mine.amb.url, urlVol: mine.amb.urlVol });
      saveMine(); toast(`Cena sonora “${nome}” guardada.`); return render();
    }
    case "cenaSomUsar": {
      const c = mine.cenasSom.find((x) => x.id === id); if (!c) return;
      mine.amb = { ...mine.amb, loops: [...c.loops], vols: { ...(c.vols || {}) }, url: c.url || "", urlVol: c.urlVol ?? mine.amb.urlVol };
      publicar(); toast(`🎭 ${c.nome}`); return render();
    }
    case "cenaSomDel": mine.cenasSom = mine.cenasSom.filter((x) => x.id !== id); saveMine(); return render();

    /* Secretas: sussurros */
    case "susPara": { const p = b.dataset.pid; ui.susPara = ui.susPara.includes(p) ? ui.susPara.filter((x) => x !== p) : [...ui.susPara, p]; return render(); }
    case "susDe": ui.susPara = [b.dataset.pid]; tab = "secretas"; lsSet(NS + ":tab", tab); render(); document.getElementById("susTxt")?.focus(); return;
    case "susEnviar": return enviarSussurro(false);
    case "susPrevia": return enviarSussurro(true);
    case "susFav": {
      const txt = (ui.susTxt || "").trim(); if (!txt) return toast("Escreva a frase primeiro.");
      if (!mine.susFav.some((f) => f.txt === txt)) mine.susFav.push({ txt, estilo: ui.susEstilo || "sussurro" });
      mine.susFav = mine.susFav.slice(-20); saveMine(); toast("Frase guardada."); return render();
    }
    case "susUsar": { const f = mine.susFav[num(b.dataset.i)]; if (!f) return; ui.susTxt = f.txt; ui.susEstilo = f.estilo || ui.susEstilo; render(); document.getElementById("susTxt")?.focus(); return; }
    case "susFavDel": mine.susFav.splice(num(b.dataset.i), 1); saveMine(); return render();
    case "ouvVerificar": perguntarQuemOuve(); toast("Perguntando…"); setTimeout(() => softRender(), 1500); return;
    case "ouvTestar": som("sino"); return;
    case "ouvAvisar": {
      const pessoas = [me.id, ...party.map((p) => p.id)];
      const ids = pessoas.filter((id) => statusOuvinte(id)[0] !== "ok");
      OBR.broadcast.sendMessage(CH, { kind: "aviso", ids, reabrir: true, text: "🔇 O mestre está tocando sons. Clique no botão 🔇 no canto de baixo, à esquerda, para ouvir. Se ele não aparecer, recarregue a página (F5)." }, { destination: "ALL" }).catch(() => {});
      toast("Aviso enviado."); setTimeout(perguntarQuemOuve, 3000); return;
    }
    case "amb": { const k = b.dataset.k; const L = mine.amb.loops; mine.amb.loops = L.includes(k) ? L.filter((x) => x !== k) : [...L, k]; publicar(); return render(); }
    case "ambUrl": {
      const u = val("ambUrl").trim(); if (!/^https:\/\/\S+$/i.test(u)) return toast("Cole um link https:// direto para um arquivo de áudio.");
      mine.amb.url = u; publicar(); toast("Música tocando para todos."); return render();
    }
    case "ambUrlStop": mine.amb.url = ""; publicar(); return render();
    case "ambParar": mine.amb.loops = []; mine.amb.url = ""; publicar(); return render();

    /* Cena: relógios */
    case "relNovo": {
      const nome = val("relNome").trim(); if (!nome) return toast("Dê um nome ao relógio.");
      mine.relogios.push({ id: uid(), nome: nome.slice(0, 40), seg: clamp(num(val("relSeg")) || 6, 2, 12), atual: 0, pub: !!document.getElementById("relPubNovo")?.checked });
      publicar(); return render();
    }
    case "relMais": case "relMenos": case "relFatia": {
      const r = findRel(id); if (!r) return;
      if (a === "relFatia") { const i = num(b.dataset.i); r.atual = r.atual === i + 1 ? i : i + 1; }
      else r.atual = clamp(num(r.atual) + (a === "relMais" ? 1 : -1), 0, num(r.seg));
      publicar(); relAvisar(r); if (num(r.atual) >= num(r.seg)) toast(`🕒 ${r.nome} completou!`); return render();
    }
    case "relPub": { const r = findRel(id); if (!r) return; r.pub = !r.pub; publicar(); if (r.pub) relAvisar(r); return render(); }
    case "relDel": {
      if (!b.classList.contains("confirm")) { b.classList.add("confirm"); b.textContent = "?"; b.title = "Clique de novo para apagar"; return; }
      mine.relogios = mine.relogios.filter((r) => r.id !== id); publicar(); return render();
    }

    /* Cena: cronômetro */
    case "timerIniciar": {
      const min = num(val("timerMin")); if (min <= 0) return toast("Quantos minutos?");
      mine.timer = { nome: val("timerNome").trim().slice(0, 50) || "Cronômetro", fim: Date.now() + min * 60000, pub: !!document.getElementById("timerPub")?.checked };
      publicar(); if (mine.timer.pub) anunciar(`⏳ ${mine.timer.nome}: ${String(min).replace(".", ",")} min`); return render();
    }
    case "timerMais": if (!mine.timer) return; mine.timer.fim = Math.max(Date.now(), num(mine.timer.fim)) + 60000; publicar(); return render();
    case "timerParar": mine.timer = null; publicar(); return render();
  }
});

/* ---------- Sincronia com as outras extensões ---------- */
window.addEventListener("storage", (e) => {
  if (!isGM()) return;
  if ([fichaKey(), hxKey(), logKey()].includes(e.key)) softRender();
  if (e.key === mineKey()) { loadMine(); softRender(); }
  if (e.key === FILA()) processarFila();
  if (e.key === susKey() && tab === "secretas") softRender();
});

async function start() {
  if (!OBR.isAvailable) {
    // Teste fora do Owlbear: index.html?gm
    if (new URLSearchParams(location.search).has("gm")) role = "GM";
    loadMine(); render(); return;
  }
  OBR.onReady(async () => {
    obrOk = true; roomId = OBR.room.id;
    [role, me.id, me.name] = await Promise.all([OBR.player.getRole(), OBR.player.getId(), OBR.player.getName()]);
    loadMine(); setVolLocal(volJogador());
    try { const md = await OBR.room.getMetadata(); pub = md[PUB_KEY] || null; fichaCfg = { ...fichaCfg, ...(md[FICHA_CFG] || {}) }; } catch { pub = null; }
    render();
    OBR.room.onMetadataChange((md) => {
      const x = md[PUB_KEY]; if (!isGM() && x) { pub = x; softRender(); }
      if (md[FICHA_CFG]) { fichaCfg = { ...fichaCfg, ...md[FICHA_CFG] }; if (tab === "ferramentas") softRender(); }
    });
    OBR.player.onChange((p) => { if (p.role !== role) { role = p.role; render(); } });
    try { party = await OBR.party.getPlayers(); } catch { party = []; }
    OBR.party.onChange((ps) => { party = ps; softRender(); });
    OBR.broadcast.onMessage(CH, (ev) => {
      const d = ev.data || {};
      if (d.kind === "ouvinte" && d.id) { ouvintes[d.id] = { nome: d.nome, estado: d.estado, vol: d.vol, v: d.v, at: Date.now() }; if (isGM() && tab === "cena") softRender(); }
    });
    if (tab === "cena") perguntarQuemOuve();
    sceneOk = await OBR.scene.isReady();
    await lerCena();
    OBR.scene.onReadyChange(async (r) => { sceneOk = r; await lerCena(); if (r) { updateRing(); processarFila(); } softRender(); });
    if (isGM()) {
      fichaSend({ t: "request" }); processarFila();
      if (!pub || JSON.stringify(pub.amb) !== JSON.stringify(montarPub().amb) || (pub.relogios || []).length !== mine.relogios.filter((r) => r.pub).length) publicar();
      render();
    }
  });
}
start();
