import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";

/* Animação do estigma, aberta em tela cheia para todos da sala.
   Recebe pelo endereço (#d=...) qual estigma mostrar e se fecha sozinha no fim.
   O som toca na caixa de som de cada pessoa (som.js), que já está liberada;
   a explosão da animação (0,3 s) bate com a do som. */

const NS = "io.github.pebarrosdenashor.mestre-hx";
const MODAL = NS + "/estigma";
const DURACAO = 2500;
const ARQ = { Desejo: "desejo", Rancor: "rancor", Culpa: "culpa", Prazer: "prazer", Orgulho: "orgulho" };

let d = {};
try { d = JSON.parse(decodeURIComponent((location.hash.match(/d=([^&]*)/) || [])[1] || "{}")); } catch { /* */ }
const nome = ARQ[d.e] ? d.e : "Rancor";
const arq = ARQ[nome];

document.body.classList.add(arq);
document.getElementById("nomeTxt").textContent = `${nome === "Culpa" ? "da" : "do"} ${nome}`;

// brasas lançadas para fora pela explosão
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const n = arq === "rancor" ? 70 : 50; const m = Math.max(innerWidth, innerHeight);
  for (let i = 0; i < n; i++) {
    const b = document.createElement("i"); b.className = "brasa";
    const ang = Math.random() * Math.PI * 2, r = m * (0.15 + Math.random() * 0.45);
    b.style.setProperty("--dx", `${Math.cos(ang) * r}px`); b.style.setProperty("--dy", `${Math.sin(ang) * r}px`);
    b.style.setProperty("--d", `${0.7 + Math.random() * 0.9}s`);
    document.body.appendChild(b);
  }
}

// só começa quando o símbolo já carregou (senão a explosão sai sem ele); no máximo 0,4 s de espera
let comecou = false, pronto = false, acabou = false, soou = false;
function fechar() { try { OBR.modal.close(MODAL); } catch { /* */ } }
// o som é pedido daqui, no momento em que a animação começa, para a explosão bater junto
function soar() {
  if (soou || !pronto || !comecou || d.mudo) return; soou = true;
  OBR.broadcast.sendMessage(NS + "/msg", { kind: "som", k: "estigma-" + nome }, { destination: "LOCAL" }).catch(() => {});
}
OBR.onReady(() => { pronto = true; soar(); if (acabou) fechar(); });
function comecar() {
  if (comecou) return; comecou = true;
  document.body.classList.add("vai"); soar();
  setTimeout(() => { acabou = true; if (pronto) fechar(); }, DURACAO + 50);
  setTimeout(() => { document.body.style.transition = "opacity .2s"; document.body.style.opacity = "0"; }, DURACAO + 150);
}
const img = document.getElementById("img");
img.onload = comecar; img.onerror = comecar;
img.src = new URL(`estigmas/${arq}.png`, location.href).href;
if (img.complete) comecar();
setTimeout(comecar, 400);
