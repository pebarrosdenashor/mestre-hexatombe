import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";

/* Animação do estigma, aberta em tela cheia para todos da sala.
   Recebe pelo endereço (#d=...) qual estigma mostrar e se fecha sozinha no fim.
   O som toca na caixa de som de cada pessoa (som.js), que já está liberada. */

const NS = "io.github.pebarrosdenashor.mestre-hx";
const MODAL = NS + "/estigma";
const DURACAO = 4400;
const ARQ = { Desejo: "desejo", Rancor: "rancor", Culpa: "culpa", Prazer: "prazer", Orgulho: "orgulho" };

let d = {};
try { d = JSON.parse(decodeURIComponent((location.hash.match(/d=([^&]*)/) || [])[1] || "{}")); } catch { /* */ }
const nome = ARQ[d.e] ? d.e : "Rancor";
const arq = ARQ[nome];

document.body.classList.add(arq);
document.getElementById("img").src = new URL(`estigmas/${arq}.png`, location.href).href;
document.getElementById("nomeTxt").textContent = nome === "Orgulho" ? "do Orgulho" : `d${nome === "Culpa" ? "a" : "o"} ${nome}`;

// brasas que sobem (na Culpa, caem)
const cai = arq === "culpa";
const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduz) {
  const w = innerWidth, h = innerHeight, n = arq === "rancor" ? 46 : 32;
  for (let i = 0; i < n; i++) {
    const b = document.createElement("i"); b.className = "brasa";
    const ang = Math.random() * Math.PI * 2, r = Math.min(w, h) * (0.08 + Math.random() * 0.22);
    b.style.left = `${w / 2 + Math.cos(ang) * r}px`; b.style.top = `${h / 2 + Math.sin(ang) * r}px`;
    b.style.setProperty("--dx", `${(Math.random() - 0.5) * 18}vw`);
    b.style.setProperty("--dy", `${cai ? 30 + Math.random() * 25 : -(25 + Math.random() * 30)}vh`);
    b.style.setProperty("--d", `${1.8 + Math.random() * 1.6}s`);
    b.style.setProperty("--atraso", `${(arq === "rancor" ? 0.35 : 0.6) + Math.random() * 1.6}s`);
    document.body.appendChild(b);
  }
}

function fechar() { try { OBR.modal.close(MODAL); } catch { /* */ } }
OBR.onReady(() => setTimeout(fechar, DURACAO));
// se o OBR não responder (página aberta solta), some sozinha
setTimeout(() => { document.body.style.transition = "opacity .3s"; document.body.style.opacity = "0"; }, DURACAO + 200);
