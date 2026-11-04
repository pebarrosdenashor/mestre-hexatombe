import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";
import { tocar, laco, lacosAtivos, musica, setVolume } from "./sons.js";

/* Roda o tempo todo, mesmo com a janela fechada:
   - no mestre: guarda todas as rolagens das fichas (inclusive as secretas) para o Escudo do Mestre
   - em todos: mostra os avisos do combate ("vez de…") e os anúncios públicos do mestre
   - em todos: toca os efeitos e a ambientação que o mestre escolher, e avisa quando o cronômetro acaba
   - no mestre: menu do token "Adicionar ao combate" */

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

/* ---------- Volume de cada jogador ---------- */
function volume() { try { const v = localStorage.getItem(`${NS}:vol`); return v === null ? 0.8 : Math.max(0, Math.min(1, Number(v) || 0)); } catch { return 0.8; } }
setVolume(volume());
window.addEventListener("storage", (e) => { if (e.key === `${NS}:vol`) { setVolume(volume()); aplicarAmbiente(ultimoPub); } });

/* ---------- Ambiente, relógios e cronômetro (guardados na sala) ---------- */
let ultimoPub = null, timerAlarme = null, timerFim = 0;
function aplicarAmbiente(p) {
  const loops = p?.amb?.loops || [];
  for (const k of lacosAtivos()) if (!loops.includes(k)) laco(k, false);
  for (const k of loops) laco(k, true);
  musica(p?.amb?.url || "", Number(p?.amb?.urlVol ?? 0.6));
}
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
function aplicarPub(p) { ultimoPub = p; aplicarAmbiente(p); aplicarTimer(p); }

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
    if (d.kind === "som" && d.k) tocar(String(d.k));
  });
  try { aplicarPub((await OBR.room.getMetadata())[PUB_KEY] || null); } catch { /* */ }
  OBR.room.onMetadataChange((md) => { if (PUB_KEY in md) aplicarPub(md[PUB_KEY]); });
  menuCombate();
});
