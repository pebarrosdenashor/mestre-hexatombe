import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";

/* Janelinha do sussurro: aparece só na tela de quem o mestre escolheu.
   O texto chega pelo endereço (#d=...), aberto pelo fundo da extensão. */

const NS = "io.github.pebarrosdenashor.mestre-hx";
const CH = NS + "/msg";
const POP = NS + "/sussurro";
const ROTULOS = { sussurro: "Um sussurro…", outro: "O Outro Lado fala", pensamento: "Um pensamento que não é seu", bilhete: "Um bilhete" };
const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id);

let d = {};
try { d = JSON.parse(decodeURIComponent(location.hash.replace(/^#d=/, ""))); } catch { d = {}; }
const estilo = ROTULOS[d.estilo] ? d.estilo : "sussurro";
const texto = String(d.txt || "").slice(0, 1200);
const $caixa = $("caixa"), $texto = $("texto");
$caixa.classList.add(estilo);
$("rotulo").textContent = ROTULOS[estilo];

let meId = "", meNome = "", fechando = false, autoTimer = null;
async function fechar() {
  if (fechando) return; fechando = true;
  $caixa.classList.add("sai");
  setTimeout(() => { if (OBR.isAvailable) OBR.popover.close(POP).catch(() => {}); else window.close(); }, calmo ? 50 : 1300);
}
$("fechar").addEventListener("click", fechar);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fechar(); });

/* ---------- Texto aparecendo ---------- */
function montar() {
  // palavras para pensamento; letras para os outros
  $texto.innerHTML = "";
  for (const linha of texto.split("\n").map((l, i) => [l, i])) {
    if (linha[1] > 0) $texto.appendChild(document.createElement("br"));
    for (const p of linha[0].split(/(\s+)/)) {
      if (!p) continue;
      if (/^\s+$/.test(p) || estilo === "pensamento") { const s = document.createElement("span"); s.textContent = p; s.dataset.f = p; $texto.appendChild(s); continue; }
      // a palavra fica inteira na mesma linha; as letras aparecem uma a uma
      const w = document.createElement("i"); w.className = "w";
      for (const ch of p) { const s = document.createElement("span"); s.textContent = ch; s.dataset.f = ch; w.appendChild(s); }
      $texto.appendChild(w);
    }
  }
  return [...$texto.querySelectorAll("span")];
}
const RUIDO = "▓▒░█#@%&?!¿ΔΩ†‡∴";
function revelar(spans) {
  if (calmo) { spans.forEach((s) => s.classList.add("v")); return Promise.resolve(); }
  const passo = estilo === "pensamento" ? 170 : estilo === "bilhete" ? 38 : estilo === "outro" ? 45 : 70;
  return new Promise((ok) => {
    let i = 0;
    const iv = setInterval(() => {
      const s = spans[i]; if (!s) { clearInterval(iv); ok(); return; }
      if (estilo === "outro" && s.dataset.f.trim()) {
        // a letra embaralha antes de assentar
        let n = 0; const f = s.dataset.f;
        const em = setInterval(() => { s.textContent = RUIDO[Math.floor(Math.random() * RUIDO.length)]; if (++n > 4) { clearInterval(em); s.textContent = f; } }, 40);
      }
      if (estilo === "sussurro") s.style.animationDelay = `${-Math.random() * 2.6}s`;
      s.classList.add("v"); i++;
      if (estilo === "outro" && Math.random() < 0.03) { $caixa.classList.remove("glitch"); void $caixa.offsetWidth; $caixa.classList.add("glitch"); }
    }, passo);
  });
}
function agendarFim() {
  clearTimeout(autoTimer);
  const seg = Math.min(30, Math.max(8, 4 + texto.length / 12));
  autoTimer = setTimeout(() => {
    const r = $("respTxt");
    if (document.activeElement === r || r.value.trim()) return agendarFim(); // está respondendo
    fechar();
  }, seg * 1000);
}

/* ---------- Resposta ---------- */
$("resp").addEventListener("submit", async (e) => {
  e.preventDefault();
  const txt = $("respTxt").value.trim().slice(0, 300); if (!txt) return;
  if (OBR.isAvailable) await OBR.broadcast.sendMessage(CH, { kind: "susResp", sid: d.sid, de: meId, nome: meNome, txt }, { destination: "REMOTE" }).catch(() => {});
  $("resp").classList.remove("on"); $("enviado").style.display = "block";
  setTimeout(fechar, 2500);
});
$("respTxt").addEventListener("input", agendarFim);

async function iniciar() {
  const spans = montar();
  requestAnimationFrame(() => $caixa.classList.add("on"));
  if (estilo === "outro" && !calmo) setTimeout(() => $caixa.classList.add("glitch"), 300);
  await revelar(spans);
  if (d.resp) { $("resp").classList.add("on"); }
  agendarFim();
}

if (OBR.isAvailable) {
  OBR.onReady(async () => {
    try { [meId, meNome] = await Promise.all([OBR.player.getId(), OBR.player.getName()]); } catch { /* */ }
    // avisa o mestre que o sussurro foi visto
    OBR.broadcast.sendMessage(CH, { kind: "susLido", sid: d.sid, de: meId, nome: meNome }, { destination: "REMOTE" }).catch(() => {});
    iniciar();
  });
} else iniciar();
