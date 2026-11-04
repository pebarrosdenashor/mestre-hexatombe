import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";

/* Roda o tempo todo, mesmo com a janela fechada:
   - no mestre: guarda todas as rolagens das fichas (inclusive as secretas) para o Escudo do Mestre
   - em todos: mostra os avisos do combate ("vez de…") e os anúncios públicos do mestre */

const NS = "io.github.pebarrosdenashor.mestre-hx";
const CH = NS + "/msg";
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

OBR.onReady(async () => {
  roomId = OBR.room.id;
  role = await OBR.player.getRole();
  OBR.player.onChange((p) => { role = p.role; });
  OBR.broadcast.onMessage(FICHA_CH, (ev) => { if (role === "GM") onFichaChunk(ev.data); });
  OBR.broadcast.onMessage(CH, (ev) => {
    const d = ev.data || {};
    if ((d.kind === "turno" || d.kind === "anuncio") && d.text) OBR.notification.show(d.text);
  });
});
