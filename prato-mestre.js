/* =========================================================
   Prato do mestre — os dados que o mestre rola aparecem só
   para ele, num prato igual ao da Ficha Ordem Paranormal.
   O mesmo arquivo vive nas extensões Hexatombe e Painel do
   Mestre. Nada é enviado pela sala: tudo fica no navegador
   do mestre, então os jogadores nunca veem este prato.
   A aparência dos dados é a mesma escolhida na ficha
   (Dados › Aparência dos dados e do prato).
   ========================================================= */

const FICHA_DICE = "io.github.pebarrosdenashor.ficha-op:dice";
const HIST_NS = "io.github.pebarrosdenashor.prato-mestre";
const DICE_DEF = { cor: "#c8102e", num: "#ffffff", borda: "#ffffff", estilo: "solido", prato: "feltro-vermelho", tam: 50, tempo: 5, fixo: false };
const SHAPES = {
  4: "50,6 95,90 5,90", 6: "10,10 90,10 90,90 10,90", 8: "50,3 95,50 50,97 5,50", 10: "50,3 93,42 50,97 7,42",
  12: "50,3 96,36 78,94 22,94 4,36", 20: "50,3 93,27 93,73 50,97 7,73 7,27",
};
const INNER = { 20: '<polygon points="50,24 80,70 20,70"/><path d="M50,24 L7,27 M50,24 L93,27 M50,24 L50,3 M20,70 L7,27 M20,70 L7,73 M20,70 L50,97 M80,70 L93,27 M80,70 L93,73 M80,70 L50,97"/>',
  8: '<line x1="5" y1="50" x2="95" y2="50"/>', 10: '<polyline points="7,42 50,60 93,42"/><line x1="50" y1="60" x2="50" y2="97"/>', 12: '<polygon points="50,22 76,40 66,72 34,72 24,40"/>' };
const MAX_DADOS = 24, MAX_HIST = 20;

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (v) => Number(v) || 0;
const hora = (t) => new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch { /* sem espaço */ } }
function cfg() { try { return { ...DICE_DEF, ...JSON.parse(lsGet(FICHA_DICE) || "{}") }; } catch { return { ...DICE_DEF }; } }

let opts = { ativo: () => false, sala: () => "local", origem: "" };
let pend = null;         // rolagem sendo juntada (dados que saem no mesmo clique)
let ultima = null;       // última rolagem mostrada
let timer = null, trayPinned = false, histAberto = false;

const histKey = () => `${HIST_NS}:${opts.sala() || "local"}`;
export function lerHistorico(sala) { try { return JSON.parse(lsGet(`${HIST_NS}:${sala || "local"}`) || "[]"); } catch { return []; } }
function gravarHist(e) {
  const h = lerHistorico(opts.sala()).filter((x) => x.id !== e.id);
  h.unshift(e); lsSet(histKey(), JSON.stringify(h.slice(0, MAX_HIST)));
}

/* Liga o prato. ativo(): só o mestre; sala(): id da sala; origem: nome da extensão */
export function iniciar(o) {
  opts = { ...opts, ...o };
  estilos();
  window.addEventListener("storage", (e) => { if (e.key === histKey() && histAberto) desenharHist(); });
}

/* Mostra (ou tira) o botão 🎲 do prato conforme a pessoa é mestre ou não; chame quando souber o papel */
export function atualizar() {
  estilos();
  let bt = document.getElementById("pmBtn");
  if (!opts.ativo()) { bt?.remove(); document.getElementById("pmTray")?.remove(); return; }
  if (bt) return;
  bt = document.createElement("button"); bt.id = "pmBtn"; bt.type = "button"; bt.title = "Prato do mestre (só você vê)"; bt.textContent = "🎲";
  bt.addEventListener("click", () => { const t = document.getElementById("pmTray"); if (t?.classList.contains("open")) { trayPinned = false; histAberto = false; t.classList.remove("open", "pinned"); } else abrir(); });
  document.body.appendChild(bt);
}

/* Um dado rolado: devolve o próprio valor (use em volta do sorteio) */
export function d(f, v) {
  if (!opts.ativo()) return v;
  const p = juntar(); const g = p.groups[p.groups.length - 1];
  if (g && g.f === f && g.keep < 0 && !g.fechado) g.vals.push(v); else p.groups.push({ f, vals: [v], keep: -1 });
  return v;
}
/* Um teste de vários d20 em que se fica com um deles */
export function grupo(f, vals, pick, worst = false) {
  if (!opts.ativo() || !vals?.length) return;
  juntar().groups.push({ f, vals: [...vals], keep: vals.indexOf(pick), worst: !!worst, fechado: true });
}
/* O texto da rolagem (o anúncio). Junta com os dados que acabaram de sair */
export function texto(t) {
  if (!opts.ativo() || !t) return;
  t = String(t).slice(0, 900);
  if (pend) { pend.text = pend.text ? pend.text + "\n" + t : t; return; }
  if (ultima && ultima.auto && Date.now() - ultima.at < 2500) {
    ultima.text = t; ultima.auto = false; gravarHist(limpa(ultima)); textoNoPrato(ultima.text);
  }
}

function juntar() {
  if (!pend) pend = { groups: [], text: "" };
  clearTimeout(pend.t); pend.t = setTimeout(soltar, 90);
  return pend;
}
function contar(groups) { return groups.reduce((a, g) => a + g.vals.length, 0); }
function cortar(groups) {
  const out = []; let n = 0;
  for (const g of groups) { if (n >= MAX_DADOS) break; const vals = g.vals.slice(0, MAX_DADOS - n); n += vals.length; out.push({ ...g, vals, keep: g.keep < vals.length ? g.keep : -1 }); }
  return out;
}
function resumo(groups) {
  return groups.map((g) => g.keep >= 0 ? `${g.vals.length}d${g.f} [${g.vals.join(", ")}] → ${g.vals[g.keep]}` : `${g.vals.length}d${g.f} [${g.vals.join(", ")}] = ${g.vals.reduce((a, b) => a + b, 0)}`).join("\n");
}
const limpa = (e) => ({ id: e.id, at: e.at, origem: e.origem, text: e.text, groups: e.groups.map(({ f, vals, keep, worst }) => ({ f, vals, keep, worst })), cfg: e.cfg });
function soltar() {
  const p = pend; pend = null; if (!p || !p.groups.length) return;
  const total = contar(p.groups);
  const e = { id: Math.random().toString(36).slice(2, 10), at: Date.now(), origem: opts.origem, text: p.text || resumo(p.groups), auto: !p.text,
    groups: cortar(p.groups), cfg: cfg(), sobra: Math.max(0, total - MAX_DADOS) };
  ultima = e; gravarHist(limpa(e)); mostrar(e);
}

/* ---------- O prato na tela ---------- */
function dieHTML(f, cls, estilo) {
  return `<div class="pm-die s-${esc(estilo)} ${cls}"><svg viewBox="0 0 100 100"><polygon class="body" points="${SHAPES[f] || SHAPES[20]}"/><g class="lines">${INNER[f] || ""}</g></svg><span>?</span><small>d${f}</small></div>`;
}
function bandeja() {
  let t = document.getElementById("pmTray");
  if (!t) {
    t = document.createElement("div"); t.id = "pmTray";
    t.innerHTML = `<div class="pm-head"><span class="pm-title"></span><span class="pm-btns"><span class="pm-priv" title="Os jogadores não veem este prato">🙈 só você vê</span><button type="button" data-pm="hist" title="Rolagens anteriores">🕘</button><button type="button" data-pm="pin" title="Manter aberto">📌</button><button type="button" data-pm="fechar" title="Fechar">✕</button></span></div><div class="pm-felt"></div><div class="pm-res"></div><div class="pm-hist" hidden></div>`;
    document.body.appendChild(t);
    t.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-pm]"); if (!b) return; ev.stopPropagation();
      const a = b.dataset.pm;
      if (a === "fechar") { trayPinned = false; histAberto = false; t.classList.remove("open", "pinned"); }
      if (a === "pin") { trayPinned = !trayPinned; t.classList.toggle("pinned", trayPinned); if (trayPinned) clearTimeout(timer); else esconderLogo(); }
      if (a === "hist") { histAberto = !histAberto; desenharHist(); if (histAberto) clearTimeout(timer); else esconderLogo(); }
    });
    atualizar();
  }
  const c = cfg();
  t.className = `pm-prato-${c.prato}${trayPinned ? " pinned" : ""} open`;
  t.style.setProperty("--dcor", c.cor); t.style.setProperty("--dnum", c.num); t.style.setProperty("--dborda", c.borda); t.style.setProperty("--dtam", num(c.tam || 50) + "px");
  return t;
}
function esconderLogo() {
  clearTimeout(timer); const c = cfg();
  if (!trayPinned && !c.fixo && !histAberto) timer = setTimeout(() => document.getElementById("pmTray")?.classList.remove("open"), num(c.tempo || 5) * 1000 + 900);
}
function textoNoPrato(text) {
  const t = document.getElementById("pmTray"); if (!t) return;
  const [a, ...rest] = String(text || "").split("\n");
  const i = a.indexOf(":");
  t.querySelector(".pm-title").textContent = (i > 0 && i < 60 ? a.slice(0, i) : "Rolagem") + "";
  t.querySelector(".pm-res").innerHTML = [i > 0 && i < 60 ? a.slice(i + 1) : a, ...rest].filter((l) => l.trim()).map((l) => `<div>${esc(l.trim())}</div>`).join("");
}
function mostrar(e) {
  const t = bandeja(); const felt = t.querySelector(".pm-felt"); const c = e.cfg || cfg();
  histAberto = false; t.querySelector(".pm-hist").hidden = true;
  felt.innerHTML = ""; textoNoPrato(e.text);
  if (e.sobra) t.querySelector(".pm-res").insertAdjacentHTML("beforeend", `<div class="pm-sobra">+${e.sobra} dados não cabem no prato</div>`);
  som();
  const W = felt.clientWidth || 400, H = felt.clientHeight || 130, sz = num(c.tam || 50);
  const placed = [];
  for (const g of e.groups) {
    g.vals.forEach((v, i) => {
      const wrap = document.createElement("div");
      wrap.innerHTML = dieHTML(g.f, g.keep === i ? (g.worst ? "keep worst" : "keep") : g.keep >= 0 ? "drop" : "", c.estilo);
      const el = wrap.firstChild; felt.appendChild(el);
      let x, y, tries = 0;
      do { x = 8 + Math.random() * Math.max(10, W - sz - 16); y = 6 + Math.random() * Math.max(10, H - sz - 12); tries++; }
      while (tries < 40 && placed.some(([px, py]) => Math.abs(px - x) < sz * 0.95 && Math.abs(py - y) < sz * 0.95));
      placed.push([x, y]);
      const sx = Math.random() < 0.5 ? -sz * 1.5 : W + sz * 0.5, sy = H * Math.random();
      const mx = (sx + x) / 2, my = Math.max(0, y - 30 - Math.random() * 30);
      const r0 = (Math.random() - 0.5) * 900, r1 = r0 / 3, r2 = (Math.random() - 0.5) * 50;
      const dur = 750 + Math.random() * 450;
      el.animate([
        { transform: `translate(${sx}px,${sy}px) rotate(${r0}deg) scale(.7)` },
        { transform: `translate(${mx}px,${my}px) rotate(${r1}deg) scale(1.12)`, offset: 0.55 },
        { transform: `translate(${x}px,${y}px) rotate(${r2}deg) scale(.96)`, offset: 0.8 },
        { transform: `translate(${x}px,${y}px) rotate(${r2 / 4}deg) scale(1)` },
      ], { duration: dur, easing: "cubic-bezier(.25,.7,.35,1)", fill: "forwards" });
      const span = el.querySelector("span"); let n = 0;
      const iv = setInterval(() => {
        span.textContent = 1 + Math.floor(Math.random() * g.f);
        if ((n += 60) >= dur - 80) { clearInterval(iv); span.textContent = v; el.classList.add("done"); if (g.f === 20 && v === 20) el.classList.add("nat20"); if (g.f === 20 && v === 1) el.classList.add("nat1"); }
      }, 60);
    });
  }
  esconderLogo();
}
/* Abre o prato com a última rolagem (ou o histórico, se ainda não houve nenhuma aqui) */
export function abrir() {
  const t = bandeja();
  if (!ultima) { histAberto = true; desenharHist(); t.querySelector(".pm-felt").innerHTML = ""; textoNoPrato(""); t.querySelector(".pm-title").textContent = "Prato do mestre"; }
  else if (!t.querySelector(".pm-felt").children.length) mostrar(ultima);
  clearTimeout(timer); if (!histAberto) esconderLogo();
}
export function miniDados(groups, c) {
  c = { ...DICE_DEF, ...(c || {}) };
  const st = `--dcor:${esc(c.cor)};--dnum:${esc(c.num)};--dborda:${esc(c.borda)};--dtam:34px`;
  return `<div class="pm-mini-felt pm-prato-${esc(c.prato)}" style="${st}">${(groups || []).flatMap((g) => g.vals.map((v, i) =>
    `<div class="pm-die mini s-${esc(c.estilo)} done ${g.keep === i ? (g.worst ? "keep worst" : "keep") : g.keep >= 0 ? "drop" : ""} ${g.f === 20 && v === 20 ? "nat20" : ""} ${g.f === 20 && v === 1 ? "nat1" : ""}"><svg viewBox="0 0 100 100"><polygon class="body" points="${SHAPES[g.f] || SHAPES[20]}"/><g class="lines">${INNER[g.f] || ""}</g></svg><span>${num(v)}</span></div>`)).join("")}</div>`;
}
function desenharHist() {
  const t = document.getElementById("pmTray"); if (!t) return;
  const box = t.querySelector(".pm-hist"); box.hidden = !histAberto; t.classList.toggle("com-hist", histAberto);
  if (!histAberto) return;
  const h = lerHistorico(opts.sala());
  box.innerHTML = `<div class="pm-hist-top"><b>Rolagens do mestre</b><button type="button" data-pmlimpa title="Apagar o histórico">Limpar</button></div>` +
    (h.length ? h.map((e) => `<div class="pm-item"><div class="pm-item-top"><span>${esc(String(e.text || "").split("\n")[0])}</span><small>${esc(e.origem || "")} · ${hora(e.at)}</small></div>${miniDados(e.groups, e.cfg)}</div>`).join("")
      : `<p class="pm-vazio">Nenhuma rolagem ainda. Os dados que você rolar no Hexatombe, no Painel do Mestre ou na ficha (como mestre) aparecem aqui.</p>`);
  box.querySelector("[data-pmlimpa]")?.addEventListener("click", (ev) => { ev.stopPropagation(); lsSet(histKey(), "[]"); desenharHist(); });
}

/* ---------- Som ---------- */
let audioCtx = null;
function som() {
  if (lsGet("io.github.pebarrosdenashor.ficha-op:som") === "0") return;
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime;
    for (let i = 0; i < 5; i++) {
      const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
      o.type = "triangle"; o.frequency.value = 500 + Math.random() * 700;
      const t = t0 + i * 0.07 + Math.random() * 0.03;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      o.connect(g).connect(audioCtx.destination); o.start(t); o.stop(t + 0.08);
    }
  } catch { /* sem áudio */ }
}

/* ---------- Estilos (os mesmos do prato da ficha) ---------- */
function estilos() {
  if (document.getElementById("pmCss")) return;
  const s = document.createElement("style"); s.id = "pmCss";
  s.textContent = `
#pmTray { position: fixed; left: 6px; right: 6px; bottom: 6px; height: 210px; z-index: 9990; display: flex; flex-direction: column; color: #fff;
  border: 3px solid #000; box-shadow: 0 0 0 2px #7b5cff, 0 10px 30px rgba(0,0,0,.8); font-family: "Oswald", "Arial Narrow", system-ui, sans-serif;
  transform: translateY(calc(100% + 20px)); transition: transform .35s cubic-bezier(.3,.8,.3,1), height .25s; }
#pmTray.open { transform: none; }
#pmTray.com-hist { height: min(440px, calc(100vh - 12px)); }
#pmTray.pinned { box-shadow: 0 0 0 2px #ffd36b, 0 10px 30px rgba(0,0,0,.8); }
#pmTray .pm-head { display: flex; justify-content: space-between; align-items: center; gap: 6px; background: rgba(0,0,0,.8); padding: 3px 6px; }
#pmTray .pm-title { font-size: 13px; letter-spacing: .05em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#pmTray .pm-btns { display: flex; align-items: center; gap: 2px; flex: none; }
#pmTray .pm-btns button { background: transparent; border: 0; color: #fff; cursor: pointer; padding: 0 5px; font-size: 14px; line-height: 1.6; }
#pmTray .pm-priv { font-size: 11px; color: #c9b8ff; margin-right: 4px; white-space: nowrap; }
#pmTray .pm-felt { position: relative; flex: 1; min-height: 110px; overflow: hidden; box-shadow: inset 0 0 30px rgba(0,0,0,.75); }
#pmTray .pm-felt::after { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .3; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
#pmTray.com-hist .pm-felt { flex: none; height: 110px; }
#pmTray .pm-res { background: rgba(0,0,0,.8); padding: 4px 8px; font: 14px/1.35 "Crimson Pro", Georgia, serif; max-height: 64px; overflow: auto; }
#pmTray .pm-res div:first-child { font: 16px "Oswald", "Arial Narrow", sans-serif; }
#pmTray .pm-sobra { font-size: 12px; opacity: .7; }
#pmTray .pm-hist { flex: 1; overflow: auto; background: #111014; padding: 6px 8px; font: 13px system-ui, sans-serif; }
#pmTray .pm-hist-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
#pmTray .pm-hist-top button { background: transparent; border: 1px solid #555; color: #ddd; border-radius: 3px; cursor: pointer; font-size: 12px; }
#pmTray .pm-item { border-top: 1px solid #2a2830; padding: 4px 0; }
#pmTray .pm-item-top { display: flex; justify-content: space-between; gap: 8px; }
#pmTray .pm-item-top span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#pmTray .pm-item-top small, #pmTray .pm-vazio { color: #9a9aa6; }
#pmTray .pm-item-top small { white-space: nowrap; }
.pm-prato-feltro-vermelho .pm-felt, .pm-mini-felt.pm-prato-feltro-vermelho { background: radial-gradient(circle at 50% 40%, #8c1022, #4a0510 70%, #2a0208); }
.pm-prato-feltro-verde .pm-felt, .pm-mini-felt.pm-prato-feltro-verde { background: radial-gradient(circle at 50% 40%, #23683a, #12391f 70%, #0a2112); }
.pm-prato-couro .pm-felt, .pm-mini-felt.pm-prato-couro { background: radial-gradient(circle at 50% 40%, #2d2420, #15100e 75%); outline: 2px dashed rgba(200,170,140,.35); outline-offset: -6px; }
.pm-prato-madeira .pm-felt, .pm-mini-felt.pm-prato-madeira { background: repeating-linear-gradient(92deg, #5a3a22 0 14px, #6b4528 14px 22px, #4e321d 22px 40px), #5a3a22; }
.pm-prato-pedra .pm-felt, .pm-mini-felt.pm-prato-pedra { background: radial-gradient(circle at 30% 30%, #6c6c70, #3a3a3e 60%, #242427); }
.pm-prato-sangue .pm-felt, .pm-mini-felt.pm-prato-sangue { background: radial-gradient(ellipse at 45% 45%, #b3001b, #6a000f 45%, #2b0006 75%), #200004; }
.pm-prato-papel .pm-felt, .pm-mini-felt.pm-prato-papel { background: #e9e0cf; }
.pm-mini-felt { position: relative; display: flex; flex-wrap: wrap; gap: 6px; padding: 6px; margin: 4px 0; min-height: 44px; align-items: center; box-shadow: inset 0 0 20px rgba(0,0,0,.7); }
.pm-die { position: absolute; left: 0; top: 0; width: var(--dtam); height: var(--dtam); filter: drop-shadow(2px 4px 3px rgba(0,0,0,.65)); }
.pm-die svg { width: 100%; height: 100%; display: block; }
.pm-die .body { fill: var(--dcor); stroke: var(--dborda); stroke-width: 3; stroke-linejoin: round; }
.pm-die .lines * { fill: none; stroke: var(--dborda); stroke-width: 1.6; opacity: .45; }
.pm-die span { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font: 700 calc(var(--dtam) * .36)/1 "Oswald", "Arial Narrow", sans-serif; color: var(--dnum); text-shadow: 0 1px 2px rgba(0,0,0,.6); }
.pm-die small { position: absolute; bottom: -12px; left: 0; right: 0; text-align: center; font: 9px sans-serif; color: rgba(255,255,255,.6); }
.pm-die.mini { position: relative; left: auto; top: auto; }
.pm-die.mini small { display: none; }
.pm-die.s-translucido .body { fill-opacity: .55; }
.pm-die.s-metalico { filter: drop-shadow(0 0 2px rgba(255,255,255,.6)) drop-shadow(2px 4px 3px rgba(0,0,0,.7)) contrast(1.25) brightness(1.15); }
.pm-die.s-metalico .body { stroke-width: 5; }
.pm-die.s-osso .body { fill: #e6d9bf; stroke: #6b5534; }
.pm-die.s-osso span { color: #3b2a16; text-shadow: none; }
.pm-die.s-contorno .body { fill: rgba(0,0,0,.35); stroke-width: 5; }
.pm-die.done.keep { filter: drop-shadow(0 0 7px #fff) drop-shadow(2px 4px 3px rgba(0,0,0,.65)); z-index: 2; }
.pm-die.done.keep.worst { filter: drop-shadow(0 0 7px #888) grayscale(.5); }
.pm-die.done.drop { opacity: .4; }
.pm-die.done.nat20 { filter: drop-shadow(0 0 10px #ffd36b) drop-shadow(0 0 3px #ffd36b); }
.pm-die.done.nat1 { filter: grayscale(1) brightness(.7); }
#pmBtn { position: fixed; right: 8px; bottom: 8px; z-index: 9989; width: 34px; height: 34px; border-radius: 50%; border: 1px solid #7b5cff; background: rgba(20,16,30,.85);
  color: #fff; font-size: 17px; line-height: 1; cursor: pointer; opacity: .65; box-shadow: 0 2px 8px rgba(0,0,0,.6); padding: 0; }
#pmBtn:hover { opacity: 1; }
`;
  document.head.appendChild(s);
}
