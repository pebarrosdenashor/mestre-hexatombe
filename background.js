import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";

/* Roda o tempo todo, mesmo com a janela fechada:
   - no mestre: guarda todas as rolagens das fichas (inclusive as secretas) para o Escudo do Mestre
   - em todos: mostra os avisos do combate ("vez de…") e os anúncios públicos do mestre
   - em todos: abre a "caixa de som" (som.html), onde os sons tocam de verdade, e avisa quando o cronômetro acaba
   - no mestre: menu do token "Adicionar ao combate"
   - em todos: abre o sussurro que o mestre mandou só para esta pessoa
   - no mestre: guarda quem leu e quem respondeu aos sussurros */

const NS = "io.github.pebarrosdenashor.mestre-hx";
const CH = NS + "/msg";
const PUB_KEY = NS + "/publico";
const FICHA_CH = "io.github.pebarrosdenashor.ficha-op/sync";
let role = "PLAYER", roomId = "";
const parts = {};

function logRoll(msg) {
  const k = `${NS}:log:${roomId}`;
  try {
    const log = JSON.parse(localStorage.getItem(k) || "[]");
    log.unshift({ at: Date.now(), who: msg.who || "", text: String(msg.text || ""), secret: !!msg.secret, src: "ficha" });
    localStorage.setItem(k, JSON.stringify(log.slice(0, 250)));
  } catch { /* armazenamento cheio */ }
}
function onFichaChunk(d) {
  if (!d?.m) return;
  const p = (parts[d.m] ||= { n: d.n, parts: [], got: 0, at: Date.now() });
  if (p.parts[d.i] === undefined) { p.parts[d.i] = d.d; p.got++; }
  for (const [k, v] of Object.entries(parts)) if (Date.now() - v.at > 60000) delete parts[k];
  if (p.got !== p.n) return;
  delete parts[d.m];
  // Só a mensagem pequena de rolagem interessa; fichas grandes são ignoradas aqui
  let msg; try { msg = JSON.parse(p.parts.join("")); } catch { return; }
  if (msg?.t !== "roll" || role !== "GM") return;
  logRoll(msg);
  if (msg.secret) OBR.notification.show(`🛡 Rolagem secreta de ${msg.who}: ${String(msg.text).split("\n")[0]}`);
}

/* ---------- Caixa de som ----------
   O fundo não recebe cliques, e sem clique o navegador não deixa tocar som.
   Os sons tocam num botãozinho no canto da tela (som.html), que libera o áudio com um clique. */
const POP = NS + "/som";
async function abrirCaixaDeSom() {
  try {
    const h = await OBR.viewport.getHeight();
    await OBR.popover.open({
      id: POP, url: new URL("som.html?v=1.7.0", location.href).href, width: 240, height: 52,
      anchorReference: "POSITION", anchorPosition: { left: 72, top: h - 12 },
      anchorOrigin: { horizontal: "LEFT", vertical: "BOTTOM" }, transformOrigin: { horizontal: "LEFT", vertical: "BOTTOM" },
      disableClickAway: true, hidePaper: true,
    });
  } catch { /* */ }
}
// se a caixa de som não der sinal de vida, abre de novo
let caixaViva = false, meuId = "";
function vigiarCaixa() { setTimeout(() => { if (!caixaViva) abrirCaixaDeSom(); }, 15000); }
function tocar(k) { OBR.broadcast.sendMessage(CH, { kind: "som", k }, { destination: "LOCAL" }).catch(() => {}); }

/* ---------- Sussurros ---------- */
const SUS_POP = NS + "/sussurro";
async function abrirSussurro(d) {
  try {
    const w = await OBR.viewport.getWidth();
    const linhas = Math.ceil(String(d.txt || "").length / 42) + String(d.txt || "").split("\n").length;
    const h = Math.min(420, 110 + linhas * 30 + (d.resp ? 52 : 0));
    await OBR.popover.close(SUS_POP).catch(() => {});
    await OBR.popover.open({
      id: SUS_POP, url: new URL("sussurro.html?v=1.7.0", location.href).href + "#d=" + encodeURIComponent(JSON.stringify({ sid: d.sid, txt: d.txt, estilo: d.estilo, resp: !!d.resp })),
      width: Math.min(560, Math.max(320, w - 40)), height: h,
      anchorReference: "POSITION", anchorPosition: { left: Math.round(w / 2), top: 70 },
      anchorOrigin: { horizontal: "CENTER", vertical: "TOP" }, transformOrigin: { horizontal: "CENTER", vertical: "TOP" },
      disableClickAway: true, hidePaper: true,
    });
    if (d.som) tocar(String(d.som));
  } catch { /* */ }
}
function guardarSus(d, campo) {
  const k = `${NS}:sus:${roomId}`;
  try {
    const all = JSON.parse(localStorage.getItem(k) || "{}"); const r = (all[d.sid] ||= { lidos: {}, resp: [] });
    if (campo === "lido") r.lidos[d.de] = d.nome || "?";
    else { r.lidos[d.de] = d.nome || "?"; r.resp.push({ de: d.de, nome: String(d.nome || "?").slice(0, 60), txt: String(d.txt || "").slice(0, 300), at: Date.now() }); }
    const ids = Object.keys(all); if (ids.length > 60) for (const x of ids.slice(0, ids.length - 60)) delete all[x];
    localStorage.setItem(k, JSON.stringify(all));
  } catch { /* */ }
  if (campo === "resp") OBR.notification.show(`💬 ${d.nome || "Alguém"} respondeu ao sussurro: “${String(d.txt || "").slice(0, 90)}”`);
}

/* ---------- Cronômetro (guardado na sala) ---------- */
let timerAlarme = null, timerFim = 0;
function fimDoTimer(nome) {
  OBR.notification.show(`⏳ ${nome || "Cronômetro"}: o tempo acabou!`, "WARNING");
  tocar("sino");
}
function aplicarTimer(p) {
  const t = p?.timer;
  if (!t) { clearTimeout(timerAlarme); timerAlarme = null; timerFim = 0; return; }
  if (Number(t.fim) === timerFim) return;
  clearTimeout(timerAlarme); timerFim = Number(t.fim);
  const falta = timerFim - Date.now();
  if (falta > 0) timerAlarme = setTimeout(() => fimDoTimer(t.nome), falta);
}
function aplicarPub(p) { aplicarTimer(p); }

// Cronômetro só do mestre (não vai para a sala): confere o que a janela guardou
setInterval(() => {
  if (role !== "GM" || !roomId) return;
  try {
    const m = JSON.parse(localStorage.getItem(`${NS}:${roomId}`) || "null"); const t = m?.timer;
    if (!t || t.pub) return;
    const avisado = Number(localStorage.getItem(`${NS}:timerAvisado`) || 0);
    if (Date.now() >= Number(t.fim) && avisado !== Number(t.fim)) { localStorage.setItem(`${NS}:timerAvisado`, String(t.fim)); fimDoTimer(t.nome); }
  } catch { /* */ }
}, 1000);

/* ---------- Menu do token: "Adicionar ao combate" ---------- */
function menuCombate() {
  OBR.contextMenu.create({
    id: NS + "/combate",
    icons: [{
      icon: new URL("icon.svg", location.href).href, label: "Adicionar ao combate",
      filter: { roles: ["GM"], every: [{ key: "layer", value: "CHARACTER", coordinator: "||" }, { key: "layer", value: "MOUNT", coordinator: "||" }, { key: "layer", value: "PROP" }] },
    }],
    async onClick(context) {
      const ids = context.items.map((i) => i.id);
      const k = `${NS}:fila:${roomId}`;
      try { const fila = JSON.parse(localStorage.getItem(k) || "[]"); localStorage.setItem(k, JSON.stringify([...new Set([...fila, ...ids])])); } catch { /* */ }
      if (await OBR.action.isOpen()) return; // a janela aberta já pega pela mudança
      OBR.notification.show(`⚔ ${ids.length} token(s) na fila do combate. Abra o Escudo do Mestre para entrarem na iniciativa.`);
    },
  });
}

OBR.onReady(async () => {
  roomId = OBR.room.id;
  role = await OBR.player.getRole();
  OBR.player.onChange((p) => { role = p.role; });
  OBR.broadcast.onMessage(FICHA_CH, (ev) => { if (role === "GM") onFichaChunk(ev.data); });
  OBR.broadcast.onMessage(CH, (ev) => {
    const d = ev.data || {};
    if ((d.kind === "turno" || d.kind === "anuncio") && d.text) OBR.notification.show(d.text);
    if (d.kind === "ouvinte" && d.id === meuId) caixaViva = true;
    if (d.kind === "sussurro" && Array.isArray(d.para) && d.para.includes(meuId)) abrirSussurro(d);
    if (d.kind === "susLido" && role === "GM" && d.sid) guardarSus(d, "lido");
    if (d.kind === "susResp" && role === "GM" && d.sid) guardarSus(d, "resp");
    // o mestre avisou que esta pessoa está sem som
    if (d.kind === "aviso" && Array.isArray(d.ids) && d.ids.includes(meuId)) {
      OBR.notification.show(d.text || "🔇 Clique no botão de som no canto de baixo, à esquerda, para ouvir o mestre.", "WARNING");
      if (d.reabrir) { caixaViva = false; abrirCaixaDeSom(); }
    }
    // a caixa de som pediu a ambientação (a sala pode estar sem espaço para guardá-la)
    if (d.kind === "pedePub" && role === "GM") {
      try { const pub = JSON.parse(localStorage.getItem(`${NS}:pub:${roomId}`) || "null"); if (pub) OBR.broadcast.sendMessage(CH, { kind: "pub", pub }, { destination: "REMOTE" }); } catch { /* */ }
    }
  });
  try { aplicarPub((await OBR.room.getMetadata())[PUB_KEY] || null); } catch { /* */ }
  OBR.room.onMetadataChange((md) => { if (PUB_KEY in md) aplicarPub(md[PUB_KEY]); });
  menuCombate();
  try { meuId = await OBR.player.getId(); } catch { /* */ }
  abrirCaixaDeSom(); vigiarCaixa();
});
