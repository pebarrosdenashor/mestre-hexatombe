/* =========================================================
   Tamanho da janela da extensão no Owlbear.
   - Botão ⤡ no topo: tamanhos prontos e ajuste fino.
   - Alça no canto inferior direito: arraste para redimensionar
     (duplo clique volta ao tamanho padrão).
   O tamanho fica salvo neste navegador.
   ========================================================= */
import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";

const KEY = "mestre-hexatombe:tamanho";
const PADRAO = { w: 460, h: 760 };
const PRESETS = [["Compacta", 380, 600], ["Padrão", 460, 760], ["Larga", 620, 860], ["Máxima", 9999, 9999]];
const MIN = { w: 340, h: 420 };
let atual = { ...PADRAO }, limite = { w: 1600, h: 1200 }, pronto = false;

const ler = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); if (v && v.w && v.h) return v; } catch { /* */ } return null; };
const gravar = () => { try { localStorage.setItem(KEY, JSON.stringify(atual)); } catch { /* */ } };
const clamp = (v, a, b) => Math.max(a, Math.min(b, Math.round(v)));

async function medirLimite() {
  try {
    const [w, h] = await Promise.all([OBR.viewport.getWidth(), OBR.viewport.getHeight()]);
    if (w > 0 && h > 0) limite = { w: Math.max(MIN.w, w - 40), h: Math.max(MIN.h, h - 30) };
  } catch { /* fica o limite padrão */ }
}
let pend = null, raf = 0;
function aplicar(w, h, salvar = true) {
  atual = { w: clamp(w, MIN.w, limite.w), h: clamp(h, MIN.h, limite.h) };
  if (salvar) gravar();
  atualizarPainel();
  if (!pronto) return;
  pend = atual; if (raf) return;
  raf = requestAnimationFrame(() => { raf = 0; const p = pend; OBR.action.setWidth(p.w).catch(() => {}); OBR.action.setHeight(p.h).catch(() => {}); });
}

/* ---------- painel de tamanho ---------- */
const painel = document.createElement("div");
painel.className = "tam-painel"; painel.hidden = true;
painel.innerHTML = `<div class="tam-h"><b>Tamanho da janela</b><button class="icon" data-tam="fechar" title="Fechar">✕</button></div>
  <div class="tam-pre">${PRESETS.map(([n, w, h]) => `<button data-tam="pre" data-w="${w}" data-h="${h}">${n}</button>`).join("")}</div>
  <div class="tam-fino">
    <span>Largura</span><button data-tam="w" data-d="-40" title="Mais estreita">−</button><output id="tamW"></output><button data-tam="w" data-d="40" title="Mais larga">+</button>
    <span>Altura</span><button data-tam="h" data-d="-60" title="Mais baixa">−</button><output id="tamH"></output><button data-tam="h" data-d="60" title="Mais alta">+</button>
  </div>
  <p class="tam-dica">Dica: arraste a alça ◢ no canto de baixo para ajustar livremente.</p>`;
function atualizarPainel() {
  const w = painel.querySelector("#tamW"), h = painel.querySelector("#tamH");
  if (w) w.textContent = atual.w + " px"; if (h) h.textContent = atual.h + " px";
}
painel.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-tam]"); if (!b) return;
  const t = b.dataset.tam;
  if (t === "fechar") { painel.hidden = true; return; }
  if (t === "pre") return aplicar(Number(b.dataset.w), Number(b.dataset.h));
  if (t === "w") return aplicar(atual.w + Number(b.dataset.d), atual.h);
  if (t === "h") return aplicar(atual.w, atual.h + Number(b.dataset.d));
});
// O botão ⤡ fica no cabeçalho (que é redesenhado): tratado aqui, antes do resto da extensão
document.addEventListener("click", (e) => {
  const b = e.target.closest?.("#btnTam");
  if (b) { e.stopPropagation(); e.preventDefault(); painel.hidden = !painel.hidden; if (!painel.hidden) medirLimite(); atualizarPainel(); return; }
  if (!painel.hidden && !painel.contains(e.target)) painel.hidden = true;
}, true);

/* ---------- alça de arrastar ---------- */
const alca = document.createElement("div");
alca.className = "tam-alca"; alca.title = "Arraste para mudar o tamanho (duplo clique: padrão)";
let ini = null;
alca.addEventListener("pointerdown", async (e) => {
  e.preventDefault(); alca.setPointerCapture(e.pointerId); document.body.classList.add("tam-arrastando");
  ini = { x: e.screenX, y: e.screenY, w: atual.w, h: atual.h };
  medirLimite();
});
alca.addEventListener("pointermove", (e) => { if (ini) aplicar(ini.w + (e.screenX - ini.x), ini.h + (e.screenY - ini.y), false); });
const soltar = () => { if (!ini) return; ini = null; document.body.classList.remove("tam-arrastando"); gravar(); };
alca.addEventListener("pointerup", soltar); alca.addEventListener("pointercancel", soltar);
alca.addEventListener("dblclick", () => aplicar(PADRAO.w, PADRAO.h));

document.body.append(painel, alca);

if (new URLSearchParams(location.search).has("modal")) { alca.remove(); painel.remove(); }
else if (OBR.isAvailable) {
  OBR.onReady(async () => {
    pronto = true; await medirLimite();
    const salvo = ler();
    if (salvo) aplicar(salvo.w, salvo.h, false);
    else { try { atual = { w: await OBR.action.getWidth() || PADRAO.w, h: await OBR.action.getHeight() || PADRAO.h }; } catch { /* */ } atualizarPainel(); }
  });
} else { const s = ler(); if (s) atual = s; atualizarPainel(); }
