import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";
import { tocar, tocarUrl, pararAvulsos, laco, lacosAtivos, musica, setVolume, estado, aoMudarEstado, destravar, AMBIENTES } from "./sons.js?v=1.8.0";
const VERSAO = "1.5";

/* Caixa de som: um botãozinho no canto da tela de cada pessoa da sala.
   Os navegadores só deixam tocar som numa janela em que a pessoa clicou,
   e a parte invisível da extensão (o fundo) nunca recebe cliques.
   Por isso os sons tocam aqui: um clique no botão libera o áudio. */

const NS = "io.github.pebarrosdenashor.mestre-hx";
const CH = NS + "/msg";
const PUB_KEY = NS + "/publico";
const POP = NS + "/som";
const $ = (id) => document.getElementById(id);
const $btn = $("btn"), $ativar = $("ativar"), $vol = $("vol"), $pct = $("pct"), $tocando = $("tocando");
let aberto = false, ultimoPub = null;

/* ---------- Volume (o mesmo da tela de "privado") ---------- */
const VOL = `${NS}:vol`;
function lerVol() { try { const v = localStorage.getItem(VOL); return v === null ? 0.8 : Math.max(0, Math.min(1, Number(v) || 0)); } catch { return 0.8; } }
function aplicarVol() { const v = lerVol(); setVolume(v); $vol.value = Math.round(v * 100); $pct.textContent = `${Math.round(v * 100)}%`; desenhar(); }
$vol.addEventListener("input", () => { try { localStorage.setItem(VOL, String(Number($vol.value) / 100)); } catch { /* */ } aplicarVol(); relatarLogo(); });
window.addEventListener("storage", (e) => { if (e.key === VOL) aplicarVol(); });

/* ---------- Aparência ---------- */
function tamanho(w) {
  try { OBR.popover.setWidth(POP, w); } catch { /* versão sem redimensionar: fica do tamanho aberto */ }
}
function desenhar() {
  const ok = estado() === "running";
  document.body.classList.toggle("bloq", !ok);
  $ativar.classList.toggle("esconde", ok);
  for (const el of [$vol, $pct]) el.classList.toggle("esconde", !ok || !aberto);
  const nomes = (ultimoPub?.amb?.loops || []).map((k) => (AMBIENTES.find(([x]) => x === k) || [, k])[1].replace(/^\S+\s/, ""));
  if (ultimoPub?.amb?.url) nomes.push("música");
  $tocando.textContent = nomes.length ? `♪ ${nomes.join(", ")}` : "";
  $tocando.classList.toggle("esconde", !ok || !aberto || !nomes.length);
  const v = lerVol();
  $btn.textContent = !ok ? "🔇" : v === 0 ? "🔈" : "🔊";
  $btn.title = !ok ? "Som bloqueado pelo navegador: clique para liberar" : `Sons do mestre · volume ${Math.round(v * 100)}%`;
  tamanho(!ok ? 240 : aberto ? (nomes.length ? 320 : 220) : 46);
}
async function liberar() {
  await destravar();
  aplicarAmbiente(ultimoPub, true);
  desenhar();
}
$ativar.addEventListener("click", liberar);
$btn.addEventListener("click", async () => {
  if (estado() !== "running") return liberar();
  aberto = !aberto; desenhar();
});
// qualquer clique aqui também serve para liberar
document.addEventListener("pointerdown", () => { if (estado() !== "running") destravar().then(desenhar); }, true);
aoMudarEstado(() => { aplicarAmbiente(ultimoPub, true); desenhar(); relatar(); });

/* ---------- Avisa o mestre se esta pessoa está ouvindo ---------- */
let meId = "", meNome = "", relTimer = null, souMestre = false;
function relatar() {
  if (!meId) return;
  OBR.broadcast.sendMessage(CH, { kind: "ouvinte", id: meId, nome: meNome, estado: estado(), vol: lerVol(), v: VERSAO }, { destination: "ALL" }).catch(() => {});
}
function relatarLogo() { clearTimeout(relTimer); relTimer = setTimeout(relatar, 600); }

/* ---------- Ambientação e música ---------- */
function aplicarAmbiente(p, forcar = false) {
  if (!p) return;
  if (!forcar && ultimoPub && Number(p.rev || 0) < Number(ultimoPub.rev || 0)) return; // versão velha
  ultimoPub = p;
  const loops = p.amb?.loops || []; const vols = p.amb?.vols || {};
  for (const k of lacosAtivos()) if (!loops.includes(k)) laco(k, false);
  for (const k of loops) laco(k, true, vols[k] ?? 1);
  musica(p.amb?.url || "", Number(p.amb?.urlVol ?? 0.6));
  desenhar();
}

OBR.onReady(async () => {
  aplicarVol();
  OBR.broadcast.onMessage(CH, (ev) => {
    const d = ev.data || {};
    // som só para algumas pessoas: d.para traz os ids (o mestre sempre ouve, para acompanhar)
    const praMim = !Array.isArray(d.para) || !d.para.length || d.para.includes(meId) || souMestre;
    if (d.kind === "som" && d.k && praMim) tocar(String(d.k));
    if (d.kind === "somUrl" && d.url && praMim) tocarUrl(String(d.url), Number(d.vol ?? 1));
    if (d.kind === "silencio") pararAvulsos();
    if (d.kind === "pub" && d.pub) aplicarAmbiente(d.pub);
    if (d.kind === "quemOuve") relatarLogo();
  });
  try { let r; [meId, meNome, r] = await Promise.all([OBR.player.getId(), OBR.player.getName(), OBR.player.getRole()]); souMestre = r === "GM"; } catch { /* */ }
  OBR.player.onChange((p) => { souMestre = p.role === "GM"; if (p.name && p.name !== meNome) { meNome = p.name; relatarLogo(); } });
  relatar(); setInterval(relatar, 20000);
  try { aplicarAmbiente((await OBR.room.getMetadata())[PUB_KEY] || null); } catch { /* */ }
  OBR.room.onMetadataChange((md) => { if (md[PUB_KEY]) aplicarAmbiente(md[PUB_KEY]); });
  // se a sala não tiver espaço para guardar a ambientação, o mestre responde por mensagem
  OBR.broadcast.sendMessage(CH, { kind: "pedePub" }, { destination: "REMOTE" }).catch(() => {});
  desenhar();
});
