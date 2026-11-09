/* =========================================================
   Sons de ambientação, sintetizados no navegador (sem arquivos).
   Usado pelo fundo (toca em todos) e pela janela (prévia).
   ========================================================= */

export const EFEITOS = [
  ["porta", "🚪 Porta rangendo"], ["batidas", "✊ Batidas na porta"], ["passos", "👣 Passos"], ["sussurros", "🗣 Sussurros"],
  ["coracao", "❤ Coração"], ["trovao", "⛈ Trovão"], ["estatica", "📻 Estática"], ["sino", "🔔 Sino"],
  ["grito", "😱 Grito distante"], ["vidro", "🪟 Vidro quebrando"], ["corrente", "⛓ Correntes"], ["risada", "🎪 Risada do circo"],
  ["caixinha", "🎶 Caixinha de música"], ["respiracao", "😮‍💨 Respiração na nuca"],
];
/* Sons que as outras extensões pedem (crítico, falha, rituais); não aparecem nos botões */
export const SISTEMA = ["critico", "falha", "ritual-Sangue", "ritual-Morte", "ritual-Conhecimento", "ritual-Energia", "ritual-Medo", "ritual", "revela", "estigma-Desejo", "estigma-Rancor", "estigma-Culpa", "estigma-Prazer", "estigma-Orgulho"];
export const AMBIENTES = [
  ["vento", "🌬 Vento"], ["chuva", "🌧 Chuva"], ["floresta", "🌲 Floresta à noite"], ["drone", "🕯 Tensão"], ["pulso", "💓 Batimento"], ["radio", "📡 Rádio chiando"],
  ["realejo", "🎠 Realejo do circo"], ["goteira", "💧 Goteira"],
];

let ctx = null, master = null, volume = 0.8;
function ac() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = volume; master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}
/* Estado do áudio: "running" quando já dá para ouvir; "suspended" quando o navegador ainda espera um clique */
export function estado() { try { return ac().state; } catch { return "indisponivel"; } }
export function aoMudarEstado(fn) { try { ac().addEventListener("statechange", () => fn(ctx.state)); } catch { /* */ } }
/* Chamar dentro de um clique: libera o som neste quadro (inclusive no iPhone/Safari) */
export async function destravar() {
  try {
    const c = ac();
    const b = c.createBuffer(1, 1, 22050); const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0);
    await c.resume();
    if (faixa && faixa.paused) faixa.play().catch(() => {});
    return c.state === "running";
  } catch { return false; }
}
let musicaVol = 0.6;
export function setVolume(v) {
  volume = Math.max(0, Math.min(1, Number(v) || 0));
  if (master) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
  if (faixa) faixa.volume = Math.max(0, Math.min(1, musicaVol * volume));
}
export function getVolume() { return volume; }

/* ---------- Peças ---------- */
let ruidoBuf = null;
function ruido() {
  const c = ac();
  if (!ruidoBuf) {
    ruidoBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = ruidoBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource(); s.buffer = ruidoBuf; s.loop = true; return s;
}
function env(g, t, a, peak, dec, fim = 0.0001) {
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a); g.gain.exponentialRampToValueAtTime(fim, t + a + dec);
}
function filtro(tipo, f, q = 1) { const x = ac().createBiquadFilter(); x.type = tipo; x.frequency.value = f; x.Q.value = q; return x; }
function ganho(v = 1) { const g = ac().createGain(); g.gain.value = v; return g; }
function osc(tipo, f) { const o = ac().createOscillator(); o.type = tipo; o.frequency.value = f; return o; }
// "Sala": eco curto para dar espaço
function sala(dest, tempo = 0.18, fb = 0.35) {
  const c = ac(); const d = c.createDelay(1); d.delayTime.value = tempo; const g = ganho(fb); const lp = filtro("lowpass", 2200);
  d.connect(lp).connect(g).connect(d); g.connect(dest); return d;
}
function batida(t, f = 90, v = 0.9, dec = 0.18, dest = master) {
  const n = ruido(); const lp = filtro("lowpass", f * 6); const g = ganho(0); n.connect(lp).connect(g).connect(dest); env(g, t, 0.004, v, dec); n.start(t); n.stop(t + dec + 0.05);
  const o = osc("sine", f); const g2 = ganho(0); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + dec); o.connect(g2).connect(dest); env(g2, t, 0.004, v * 0.9, dec); o.start(t); o.stop(t + dec + 0.05);
}

/* ---------- Efeitos de uma vez ---------- */
const UMA = {
  porta(t) {
    const o = osc("sawtooth", 180); const bp = filtro("bandpass", 900, 9); const g = ganho(0); const lfo = osc("sine", 11); const lg = ganho(70);
    lfo.connect(lg).connect(o.frequency); o.connect(bp).connect(g).connect(master);
    o.frequency.setValueAtTime(140, t); o.frequency.linearRampToValueAtTime(320, t + 1.1); o.frequency.linearRampToValueAtTime(210, t + 2.2);
    bp.frequency.setValueAtTime(700, t); bp.frequency.linearRampToValueAtTime(1500, t + 2.2);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.35, t + 0.25); g.gain.linearRampToValueAtTime(0.22, t + 1.8); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    o.start(t); lfo.start(t); o.stop(t + 2.5); lfo.stop(t + 2.5); return 2.6;
  },
  batidas(t) { const e = sala(master, 0.12, 0.3); for (const k of [0, 0.32, 0.64, 1.5, 1.82]) batida(t + k, 85, 1, 0.16, master), batida(t + k, 85, 0.3, 0.16, e); return 2.3; },
  passos(t) { for (let k = 0; k < 8; k++) batida(t + k * 0.55 + (k % 2) * 0.04, 70 + (k % 2) * 15, 0.55 + k * 0.04, 0.12); return 4.6; },
  sussurros(t) {
    const fim = 4.5;
    for (let v = 0; v < 4; v++) {
      const n = ruido(); const bp = filtro("bandpass", 1600 + v * 700, 6); const g = ganho(0); const am = osc("sine", 3 + Math.random() * 5); const amg = ganho(0.12);
      const p = ac().createStereoPanner ? ac().createStereoPanner() : ganho(1); if (p.pan) p.pan.value = (Math.random() * 2 - 1) * 0.8;
      am.connect(amg).connect(g.gain); n.connect(bp).connect(g).connect(p).connect(master);
      const t0 = t + v * 0.6; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.12, t0 + 0.6); g.gain.linearRampToValueAtTime(0.0, t0 + fim - v * 0.6);
      bp.frequency.setValueAtTime(1400 + v * 600, t0); bp.frequency.linearRampToValueAtTime(2600 - v * 300, t0 + 2);
      n.start(t0); am.start(t0); n.stop(t + fim + 0.1); am.stop(t + fim + 0.1);
    }
    return fim + 0.2;
  },
  coracao(t) { for (let k = 0; k < 6; k++) { batida(t + k * 0.85, 55, 1, 0.22); batida(t + k * 0.85 + 0.22, 50, 0.7, 0.2); } return 5.3; },
  trovao(t) {
    const n = ruido(); const lp = filtro("lowpass", 600); const g = ganho(0); n.connect(lp).connect(g).connect(master);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1, t + 0.05); g.gain.exponentialRampToValueAtTime(0.4, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t + 5);
    lp.frequency.setValueAtTime(1800, t); lp.frequency.exponentialRampToValueAtTime(120, t + 4);
    n.start(t); n.stop(t + 5.1); batida(t, 40, 1, 1.4); return 5.2;
  },
  estatica(t) {
    const n = ruido(); const hp = filtro("highpass", 1200); const g = ganho(0); n.connect(hp).connect(g).connect(master);
    for (let k = 0; k < 40; k++) g.gain.setValueAtTime(Math.random() < 0.3 ? 0.02 : 0.18 * Math.random() + 0.05, t + k * 0.07);
    g.gain.setValueAtTime(0, t + 2.9); n.start(t); n.stop(t + 3); return 3;
  },
  sino(t) {
    for (let k = 0; k < 3; k++) {
      const t0 = t + k * 1.6;
      for (const [mult, amp, dec] of [[1, 0.5, 4.5], [2.0, 0.25, 3.5], [2.76, 0.2, 2.5], [5.4, 0.08, 1.2], [0.5, 0.3, 5]]) {
        const o = osc("sine", 98 * mult); const g = ganho(0); o.connect(g).connect(master); env(g, t0, 0.01, amp * 0.6, dec); o.start(t0); o.stop(t0 + dec + 0.1);
      }
    }
    return 8;
  },
  grito(t) {
    const e = sala(master, 0.23, 0.5); const o = osc("sawtooth", 600); const v = osc("sine", 6); const vg = ganho(25); const bp = filtro("bandpass", 1300, 3); const lp = filtro("lowpass", 1800); const g = ganho(0);
    v.connect(vg).connect(o.frequency); o.connect(bp).connect(lp).connect(g); g.connect(master); g.connect(e);
    o.frequency.setValueAtTime(520, t); o.frequency.linearRampToValueAtTime(900, t + 0.5); o.frequency.linearRampToValueAtTime(380, t + 2);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    o.start(t); v.start(t); o.stop(t + 2.3); v.stop(t + 2.3); return 3.5;
  },
  vidro(t) {
    const n = ruido(); const hp = filtro("highpass", 3000); const g = ganho(0); n.connect(hp).connect(g).connect(master); env(g, t, 0.002, 0.8, 0.5); n.start(t); n.stop(t + 0.6);
    for (let k = 0; k < 14; k++) { const t0 = t + 0.05 + Math.random() * 1.1; const o = osc("sine", 2500 + Math.random() * 4000); const g2 = ganho(0); o.connect(g2).connect(master); env(g2, t0, 0.002, 0.08, 0.3); o.start(t0); o.stop(t0 + 0.35); }
    return 1.6;
  },
  corrente(t) {
    for (let k = 0; k < 18; k++) {
      const t0 = t + k * 0.09 + Math.random() * 0.05; const n = ruido(); const bp = filtro("bandpass", 3000 + Math.random() * 2500, 12); const g = ganho(0);
      n.connect(bp).connect(g).connect(master); env(g, t0, 0.002, 0.7, 0.08); n.start(t0); n.stop(t0 + 0.12);
    }
    return 2;
  },
  risada(t) {
    // "Ha-ha-ha" grave e distorcido de alto-falante velho
    const e = sala(master, 0.2, 0.45);
    for (let k = 0; k < 7; k++) {
      const t0 = t + k * 0.24; const f = 210 - k * 9;
      const o = osc("sawtooth", f); const bp = filtro("bandpass", 750, 2); const bp2 = filtro("bandpass", 1150, 4); const g = ganho(0);
      o.connect(bp).connect(g); o.connect(bp2).connect(g); g.connect(master); g.connect(e);
      o.frequency.setValueAtTime(f * 1.15, t0); o.frequency.exponentialRampToValueAtTime(f * 0.85, t0 + 0.18);
      env(g, t0, 0.02, 0.32, 0.17); o.start(t0); o.stop(t0 + 0.22);
    }
    return 3;
  },
  caixinha(t) {
    // Caixinha de música desafinada, que vai perdendo a corda
    const notas = [76, 79, 83, 81, 79, 76, 78, 75, 76, 79, 83, 88, 86, 83, 81, 79];
    const e = sala(master, 0.31, 0.4); let tt = t;
    notas.forEach((m, i) => {
      const f = 440 * Math.pow(2, (m - 69) / 12) * (1 + (Math.random() - 0.5) * 0.012);
      for (const [mult, amp, dec] of [[1, 0.16, 1.6], [3.01, 0.05, 0.5], [5.2, 0.02, 0.25]]) {
        const o = osc("sine", f * mult); const g = ganho(0); o.connect(g); g.connect(master); g.connect(e); env(g, tt, 0.003, amp, dec); o.start(tt); o.stop(tt + dec + 0.05);
      }
      tt += 0.28 + i * i * 0.0016; // corda acabando: cada nota um pouco mais lenta
    });
    return tt - t + 1.8;
  },
  respiracao(t) {
    for (let k = 0; k < 2; k++) {
      const t0 = t + k * 2.1; const n = ruido(); const bp = filtro("bandpass", 700, 1.2); const g = ganho(0);
      const p = ac().createStereoPanner ? ac().createStereoPanner() : ganho(1); if (p.pan) p.pan.value = 0.7;
      n.connect(bp).connect(g).connect(p).connect(master);
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.22, t0 + 0.9); g.gain.linearRampToValueAtTime(0.03, t0 + 1.05);
      g.gain.linearRampToValueAtTime(0.16, t0 + 1.4); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.95);
      bp.frequency.setValueAtTime(500, t0); bp.frequency.linearRampToValueAtTime(1100, t0 + 0.9); bp.frequency.linearRampToValueAtTime(600, t0 + 1.9);
      n.start(t0); n.stop(t0 + 2);
    }
    return 4.4;
  },
  /* ----- pedidos pelas fichas ----- */
  critico(t) {
    // acorde que sobe e brilha, com um baque grave
    batida(t, 45, 1, 0.9);
    [60, 64, 67, 72, 76].forEach((m, i) => {
      const f = 440 * Math.pow(2, (m - 69) / 12); const t0 = t + 0.08 + i * 0.07;
      for (const [mult, amp, dec] of [[1, 0.13, 1.8], [2, 0.05, 1.2], [3.01, 0.03, 0.7]]) { const o = osc("sine", f * mult); const g = ganho(0); o.connect(g).connect(master); env(g, t0, 0.01, amp, dec); o.start(t0); o.stop(t0 + dec + 0.05); }
    });
    const n = ruido(); const hp = filtro("highpass", 6000); const g = ganho(0); n.connect(hp).connect(g).connect(master);
    g.gain.setValueAtTime(0.0001, t + 0.3); g.gain.linearRampToValueAtTime(0.05, t + 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8); n.start(t + 0.3); n.stop(t + 1.9);
    return 2.4;
  },
  falha(t) {
    // "uó-uó" desafinado caindo e um baque seco
    const o = osc("sawtooth", 330); const o2 = osc("sawtooth", 338); const lp = filtro("lowpass", 1400, 2); const g = ganho(0);
    o.connect(lp); o2.connect(lp); lp.connect(g).connect(master);
    o.frequency.setValueAtTime(330, t); o.frequency.exponentialRampToValueAtTime(70, t + 1.3); o2.frequency.setValueAtTime(338, t); o2.frequency.exponentialRampToValueAtTime(66, t + 1.3);
    lp.frequency.setValueAtTime(1600, t); lp.frequency.exponentialRampToValueAtTime(200, t + 1.3);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.16, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    o.start(t); o2.start(t); o.stop(t + 1.45); o2.stop(t + 1.45);
    batida(t + 1.3, 60, 0.9, 0.3);
    return 2;
  },
  revela(t) {
    // pancada grave + cordas tensas (descoberta)
    batida(t, 38, 1, 1.2);
    for (const f of [55, 58.3, 82.4, 116.5]) { const o = osc("sawtooth", f); const lp = filtro("lowpass", 900); const g = ganho(0); o.connect(lp).connect(g).connect(master); env(g, t, 0.02, 0.07, 2.2); o.start(t); o.stop(t + 2.3); }
    return 2.6;
  },
  ritual(t) { return UMA["ritual-Conhecimento"](t); },
  "ritual-Sangue"(t) {
    // pulsação e rosnado grave
    for (let k = 0; k < 3; k++) batida(t + k * 0.42, 50, 0.9 - k * 0.15, 0.25);
    const o = osc("sawtooth", 55); const bp = filtro("bandpass", 300, 3); const g = ganho(0); const lfo = osc("sine", 9); const lg = ganho(8);
    lfo.connect(lg).connect(o.frequency); o.connect(bp).connect(g).connect(master);
    bp.frequency.setValueAtTime(200, t); bp.frequency.linearRampToValueAtTime(700, t + 1.4); bp.frequency.linearRampToValueAtTime(250, t + 2.4);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.3, t + 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
    o.start(t); lfo.start(t); o.stop(t + 2.6); lfo.stop(t + 2.6);
    return 2.8;
  },
  "ritual-Morte"(t) {
    // relógio que desacelera e um vazio que puxa
    let tt = t; for (let k = 0; k < 7; k++) { const o = osc("square", 1900); const bp = filtro("bandpass", 1900, 20); const g = ganho(0); o.connect(bp).connect(g).connect(master); env(g, tt, 0.001, 0.25, 0.04); o.start(tt); o.stop(tt + 0.06); tt += 0.22 + k * 0.07; }
    const n = ruido(); const lp = filtro("lowpass", 400); const g = ganho(0); n.connect(lp).connect(g).connect(master);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.25, t + 2.4); g.gain.setValueAtTime(0.0001, t + 2.45); n.start(t); n.stop(t + 2.5);
    lp.frequency.setValueAtTime(150, t); lp.frequency.exponentialRampToValueAtTime(1600, t + 2.4);
    return 2.8;
  },
  "ritual-Conhecimento"(t) {
    // sinos dourados em sequência sobre um coro grave
    [84, 88, 91, 96, 91, 95].forEach((m, i) => { const f = 440 * Math.pow(2, (m - 69) / 12); const t0 = t + i * 0.16; const o = osc("sine", f); const g = ganho(0); o.connect(g).connect(master); env(g, t0, 0.005, 0.07, 1.2); o.start(t0); o.stop(t0 + 1.3); });
    for (const f of [110, 164.8, 220]) { const o = osc("triangle", f); const g = ganho(0); o.connect(g).connect(master); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6); o.start(t); o.stop(t + 2.7); }
    return 2.8;
  },
  "ritual-Energia"(t) {
    // estalos elétricos e um "zap" que sobe
    for (let k = 0; k < 16; k++) { const t0 = t + Math.random() * 1.6; const n = ruido(); const hp = filtro("highpass", 2500 + Math.random() * 4000); const g = ganho(0); n.connect(hp).connect(g).connect(master); env(g, t0, 0.001, 0.3 * Math.random() + 0.1, 0.03); n.start(t0); n.stop(t0 + 0.05); }
    const o = osc("sawtooth", 80); const bp = filtro("bandpass", 1200, 4); const g = ganho(0); o.connect(bp).connect(g).connect(master);
    o.frequency.setValueAtTime(80, t + 0.4); o.frequency.exponentialRampToValueAtTime(1800, t + 1.8);
    g.gain.setValueAtTime(0.0001, t + 0.4); g.gain.linearRampToValueAtTime(0.12, t + 1.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 2);
    o.start(t + 0.4); o.stop(t + 2.1);
    return 2.3;
  },
  "ritual-Medo"(t) {
    // acorde dissonante que cresce e treme
    for (const f of [220, 233.1, 246.9, 311.1]) {
      const o = osc("sine", f); const g = ganho(0); const tr = osc("sine", 6 + Math.random() * 3); const tg = ganho(0.03);
      tr.connect(tg).connect(g.gain); o.connect(g).connect(master);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + 1.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 3);
      o.start(t); tr.start(t); o.stop(t + 3.1); tr.stop(t + 3.1);
    }
    return 3.2;
  },
};

/* ---------- Estigmas dos sacrifícios (tocam junto com a animação) ----------
   Todos seguem a mesma forma: um puxão de ar que carrega (≈0,3 s), a explosão de poder
   (grave que afunda, estouro distorcido, rugido) e uma cauda com a cor de cada estigma. */
function distorcer(k = 40) {
  const w = ac().createWaveShaper(); const n = 2048; const cv = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = (i * 2) / n - 1; cv[i] = ((3 + k) * x * 20 * Math.PI / 180) / (Math.PI + k * Math.abs(x)); }
  w.curve = cv; w.oversample = "4x"; return w;
}
// eco grande de caverna, gerado na hora
let caverna = null;
function grandeSala() {
  const c = ac();
  if (!caverna) {
    const len = Math.floor(c.sampleRate * 2.8); const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const cv = c.createConvolver(); cv.buffer = ir; const g = ganho(0.55); cv.connect(g).connect(master); caverna = cv;
  }
  return caverna;
}
// tudo do estigma passa por aqui: deixa alto sem estourar
function barramento() {
  const c = ac(); const comp = c.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 6; comp.ratio.value = 6; comp.attack.value = 0.003; comp.release.value = 0.25;
  const g = ganho(1.15); comp.connect(g); g.connect(master); g.connect(grandeSala()); return comp;
}
const IMP = 0.3; // momento da explosão (a animação bate junto)
function surto(t, bus, { grave = 62, rugido = 55, forca = 1 } = {}) {
  const ti = t + IMP;
  // 1) carga: ar sugado para dentro, subindo
  const n = ruido(); const hp = filtro("bandpass", 400, 1.2); const gn = ganho(0); n.connect(hp).connect(gn).connect(bus);
  hp.frequency.setValueAtTime(300, t); hp.frequency.exponentialRampToValueAtTime(5000, ti);
  gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(0.5 * forca, ti - 0.01); gn.gain.linearRampToValueAtTime(0.0001, ti + 0.02);
  n.start(t); n.stop(ti + 0.05);
  const sb = osc("sawtooth", 60); const sbl = filtro("lowpass", 800); const sg = ganho(0); sb.connect(sbl).connect(sg).connect(bus);
  sb.frequency.setValueAtTime(40, t); sb.frequency.exponentialRampToValueAtTime(220, ti);
  sg.gain.setValueAtTime(0.0001, t); sg.gain.exponentialRampToValueAtTime(0.18 * forca, ti - 0.01); sg.gain.linearRampToValueAtTime(0.0001, ti + 0.02);
  sb.start(t); sb.stop(ti + 0.05);
  // 2) explosão: grave que afunda
  const sub = osc("sine", grave); const gs = ganho(0); sub.connect(gs).connect(bus);
  sub.frequency.setValueAtTime(grave * 1.6, ti); sub.frequency.exponentialRampToValueAtTime(grave * 0.42, ti + 1.4);
  gs.gain.setValueAtTime(0.0001, ti); gs.gain.exponentialRampToValueAtTime(0.95 * forca, ti + 0.01); gs.gain.exponentialRampToValueAtTime(0.0001, ti + 1.7);
  sub.start(ti); sub.stop(ti + 1.8);
  // estouro distorcido
  const nb = ruido(); const dz = distorcer(80); const lp = filtro("lowpass", 6000, 0.7); const gb = ganho(0); nb.connect(dz).connect(lp).connect(gb).connect(bus);
  lp.frequency.setValueAtTime(7000, ti); lp.frequency.exponentialRampToValueAtTime(180, ti + 1.1);
  gb.gain.setValueAtTime(0.0001, ti); gb.gain.exponentialRampToValueAtTime(0.55 * forca, ti + 0.006); gb.gain.exponentialRampToValueAtTime(0.0001, ti + 1.2);
  nb.start(ti); nb.stop(ti + 1.3);
  // rugido: serra grave distorcida que treme
  for (const [f, v] of [[rugido, 0.3], [rugido * 1.5, 0.16], [rugido * 1.012, 0.2]]) {
    const o = osc("sawtooth", f); const tr = osc("sine", 7.5); const tg = ganho(f * 0.03); const d = distorcer(50); const l = filtro("lowpass", 1600, 1.5); const g = ganho(0);
    tr.connect(tg).connect(o.frequency); o.connect(d).connect(l).connect(g).connect(bus);
    o.frequency.setValueAtTime(f * 1.25, ti); o.frequency.exponentialRampToValueAtTime(f * 0.8, ti + 1.6);
    l.frequency.setValueAtTime(2400, ti); l.frequency.exponentialRampToValueAtTime(300, ti + 1.6);
    g.gain.setValueAtTime(0.0001, ti); g.gain.exponentialRampToValueAtTime(v * forca, ti + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ti + 1.8);
    o.start(ti); tr.start(ti); o.stop(ti + 1.9); tr.stop(ti + 1.9);
  }
  return ti;
}
Object.assign(UMA, {
  "estigma-Desejo"(t) {
    // explosão + um enxame de vozes de vidro que sobe e não para de querer mais
    const bus = barramento(); const ti = surto(t, bus, { grave: 58, rugido: 52 });
    [622.3, 659.3, 739.9, 830.6, 880, 987.8].forEach((f, i) => {
      const o = osc("sawtooth", f); const bp = filtro("bandpass", f * 2, 8); const vib = osc("sine", 6 + i * 0.7); const vg = ganho(f * 0.02); const g = ganho(0);
      vib.connect(vg).connect(o.frequency); o.connect(bp).connect(g).connect(bus);
      o.frequency.setValueAtTime(f, ti + 0.05); o.frequency.exponentialRampToValueAtTime(f * 1.5, ti + 1.8);
      g.gain.setValueAtTime(0.0001, ti + 0.05); g.gain.exponentialRampToValueAtTime(0.09, ti + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, ti + 1.9);
      o.start(ti + 0.05); vib.start(ti + 0.05); o.stop(ti + 2); vib.stop(ti + 2);
    });
    const n = ruido(); const bp = filtro("bandpass", 2500, 3); const lfo = osc("sine", 3); const lg = ganho(1800); const g = ganho(0);
    lfo.connect(lg).connect(bp.frequency); n.connect(bp).connect(g).connect(bus); env(g, ti + 0.1, 0.2, 0.25, 1.4); n.start(ti + 0.1); lfo.start(ti + 0.1); n.stop(ti + 1.8); lfo.stop(ti + 1.8);
    return 3.2;
  },
  "estigma-Rancor"(t) {
    // a mais bruta: duas pancadas, rugido no máximo e metal raspando
    const bus = barramento(); const ti = surto(t, bus, { grave: 52, rugido: 41, forca: 1.15 });
    batida(ti + 0.22, 45, 1, 0.5, bus); batida(ti + 0.22, 140, 0.6, 0.1, bus);
    const m = osc("square", 1900); const bp = filtro("bandpass", 2600, 14); const g = ganho(0); const d = distorcer(30);
    m.connect(d).connect(bp).connect(g).connect(bus);
    m.frequency.setValueAtTime(1900, ti); m.frequency.exponentialRampToValueAtTime(700, ti + 1.2);
    env(g, ti, 0.01, 0.14, 1.2); m.start(ti); m.stop(ti + 1.3);
    for (let k = 0; k < 14; k++) { const t0 = ti + Math.random() * 0.9; const n = ruido(); const h = filtro("highpass", 3000 + Math.random() * 4000); const gg = ganho(0); n.connect(h).connect(gg).connect(bus); env(gg, t0, 0.001, 0.25, 0.04); n.start(t0); n.stop(t0 + 0.06); }
    return 3;
  },
  "estigma-Culpa"(t) {
    // explosão abafada que vira um sino enorme e um coro que afunda
    const bus = barramento(); const ti = surto(t, bus, { grave: 48, rugido: 46, forca: 0.95 });
    for (const [f, v, dec] of [[73.4, 0.45, 3.2], [146.8 * 1.01, 0.22, 2.6], [196, 0.15, 2.2], [277.2, 0.1, 1.8], [349.2 * 1.02, 0.06, 1.4]]) {
      const o = osc("sine", f); const g = ganho(0); o.connect(g).connect(bus);
      o.frequency.setValueAtTime(f, ti); o.frequency.linearRampToValueAtTime(f * 0.94, ti + dec);
      env(g, ti, 0.005, v, dec); o.start(ti); o.stop(ti + dec + 0.1);
    }
    for (const f of [220, 261.6, 311.1, 233.1]) {
      const o = osc("sawtooth", f); const o2 = osc("sawtooth", f * 1.008); const lp = filtro("lowpass", 900, 1); const g = ganho(0);
      o.connect(lp); o2.connect(lp); lp.connect(g).connect(bus);
      o.frequency.setValueAtTime(f, ti + 0.2); o.frequency.exponentialRampToValueAtTime(f * 0.7, ti + 2.4); o2.frequency.setValueAtTime(f * 1.008, ti + 0.2); o2.frequency.exponentialRampToValueAtTime(f * 0.7, ti + 2.4);
      g.gain.setValueAtTime(0.0001, ti + 0.2); g.gain.linearRampToValueAtTime(0.06, ti + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, ti + 2.6);
      o.start(ti + 0.2); o2.start(ti + 0.2); o.stop(ti + 2.7); o2.stop(ti + 2.7);
    }
    return 3.6;
  },
  "estigma-Prazer"(t) {
    // o coração dispara antes e depois da explosão; um acorde doce e podre se abre
    const bus = barramento();
    [0, 0.12, 0.2, 0.26].forEach((k) => batida(t + k, 55, 0.7, 0.12, bus));
    const ti = surto(t, bus, { grave: 60, rugido: 49 });
    [0.35, 0.53, 0.72, 0.88, 1.08, 1.22, 1.42, 1.55].forEach((k) => batida(ti + k, 52, 0.85, 0.16, bus));
    const lp = filtro("lowpass", 400, 4); const g = ganho(0); lp.connect(g).connect(bus);
    lp.frequency.setValueAtTime(400, ti); lp.frequency.exponentialRampToValueAtTime(3200, ti + 0.6); lp.frequency.exponentialRampToValueAtTime(500, ti + 2.2);
    g.gain.setValueAtTime(0.0001, ti); g.gain.exponentialRampToValueAtTime(0.16, ti + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, ti + 2.4);
    for (const f of [220, 277.2, 329.6, 415.3, 466.2]) { for (const dt of [1, 1.011]) { const o = osc("sawtooth", f * dt); o.connect(lp); o.start(ti); o.stop(ti + 2.5); } }
    return 3.1;
  },
  "estigma-Orgulho"(t) {
    // explosão que vira um acorde de metais rasgado, solene, e um gongo enorme
    const bus = barramento(); const ti = surto(t, bus, { grave: 55, rugido: 49 });
    const lp = filtro("lowpass", 600, 3); const g = ganho(0); const d = distorcer(18); d.connect(lp).connect(g).connect(bus);
    lp.frequency.setValueAtTime(600, ti); lp.frequency.exponentialRampToValueAtTime(3500, ti + 0.25); lp.frequency.exponentialRampToValueAtTime(700, ti + 2.4);
    g.gain.setValueAtTime(0.0001, ti); g.gain.exponentialRampToValueAtTime(0.22, ti + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, ti + 2.6);
    for (const f of [73.4, 110, 146.8, 220, 293.7]) { const o = osc("sawtooth", f); o.frequency.setValueAtTime(f * 0.97, ti); o.frequency.linearRampToValueAtTime(f, ti + 0.15); o.connect(d); o.start(ti); o.stop(ti + 2.7); }
    for (const [f, v] of [[82.4, 0.3], [113.6, 0.18], [152.4, 0.12], [207, 0.08], [281.6, 0.06]]) {
      const o = osc("sine", f); const gg = ganho(0); o.connect(gg).connect(bus); env(gg, ti + 0.05, 0.01, v, 3); o.start(ti + 0.05); o.stop(ti + 3.2);
    }
    return 3.5;
  },
});

export function tocar(nome) {
  const f = UMA[nome]; if (!f) return 0;
  try { ac(); return f(ctx.currentTime + 0.05); } catch { return 0; }
}

/* ---------- Ambientes em laço ---------- */
const LACO = {
  vento() {
    const n = ruido(); const lp = filtro("bandpass", 500, 0.8); const g = ganho(0.35); const lfo = osc("sine", 0.13); const lg = ganho(350); const lfo2 = osc("sine", 0.07); const lg2 = ganho(0.2);
    lfo.connect(lg).connect(lp.frequency); lfo2.connect(lg2).connect(g.gain); n.connect(lp).connect(g);
    return { out: g, start() { n.start(); lfo.start(); lfo2.start(); }, stop(t) { n.stop(t); lfo.stop(t); lfo2.stop(t); } };
  },
  chuva() {
    const n = ruido(); const hp = filtro("highpass", 900); const lp = filtro("lowpass", 7000); const g = ganho(0.22);
    const n2 = ruido(); const lp2 = filtro("lowpass", 300); const g2 = ganho(0.25); n2.connect(lp2).connect(g2).connect(g);
    n.connect(hp).connect(lp).connect(g);
    return { out: g, start() { n.start(); n2.start(); }, stop(t) { n.stop(t); n2.stop(t); } };
  },
  floresta() {
    const out = ganho(1); const v = LACO.vento(); v.out.gain.value = 0.15; v.out.connect(out);
    const o = osc("sine", 4600); const cg = ganho(0); const pul = osc("square", 18); const pg = ganho(0.03); const lfo = osc("sine", 0.5); const lgg = ganho(0.03);
    pul.connect(pg).connect(cg.gain); lfo.connect(lgg).connect(cg.gain); o.connect(cg).connect(out);
    const o2 = osc("sine", 3900); const cg2 = ganho(0); const pul2 = osc("square", 15); const pg2 = ganho(0.02); pul2.connect(pg2).connect(cg2.gain); o2.connect(cg2).connect(out);
    return { out, start() { v.start(); o.start(); pul.start(); lfo.start(); o2.start(); pul2.start(); }, stop(t) { v.stop(t); for (const x of [o, pul, lfo, o2, pul2]) x.stop(t); } };
  },
  drone() {
    const out = ganho(0.12); const lp = filtro("lowpass", 400, 4); const lfo = osc("sine", 0.05); const lg = ganho(250); lfo.connect(lg).connect(lp.frequency);
    const os = [55, 55.4, 82.4, 110.6].map((f) => { const o = osc("sawtooth", f); o.connect(lp); return o; }); lp.connect(out);
    return { out, start() { os.forEach((o) => o.start()); lfo.start(); }, stop(t) { os.forEach((o) => o.stop(t)); lfo.stop(t); } };
  },
  pulso() {
    const out = ganho(1); let timer = null; let vivo = true;
    const bater = () => { if (!vivo) return; const t = ctx.currentTime + 0.05; batida(t, 52, 0.8, 0.22, out); batida(t + 0.24, 48, 0.55, 0.2, out); timer = setTimeout(bater, 950); };
    return { out, start() { bater(); }, stop() { vivo = false; clearTimeout(timer); } };
  },
  radio() {
    const n = ruido(); const bp = filtro("bandpass", 2400, 0.7); const g = ganho(0.06); const o = osc("sine", 1000); const og = ganho(0); const lfo = osc("square", 0.3); const lg = ganho(0.015);
    lfo.connect(lg).connect(og.gain); o.connect(og).connect(g); n.connect(bp).connect(g);
    return { out: g, start() { n.start(); o.start(); lfo.start(); }, stop(t) { n.stop(t); o.stop(t); lfo.stop(t); } };
  },
  realejo() {
    // valsa de realejo em tom menor, desafinando aos poucos
    const out = ganho(0.5); let vivo = true, timer = null, passo = 0;
    const lfo = osc("sine", 0.23); const lg = ganho(9); lfo.connect(lg);
    const mel = [69, 72, 76, 74, 72, 71, 72, 69, 67, 69, 71, 72, 74, 72, 71, 68];
    const bai = [45, 40, 45, 40, 47, 40, 45, 40];
    const nota = (m, t, dur, tipo, vol, freqLp) => {
      const o = osc(tipo, 440 * Math.pow(2, (m - 69) / 12)); lg.connect(o.detune); const lp = filtro("lowpass", freqLp, 1); const g = ganho(0);
      o.connect(lp).connect(g).connect(out); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.setValueAtTime(vol, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.02);
    };
    const compasso = () => {
      if (!vivo) return;
      const t = ctx.currentTime + 0.06; const b = 0.33;
      nota(bai[passo % bai.length], t, b * 0.9, "triangle", 0.18, 600);
      for (const k of [1, 2]) for (const m of [57, 60, 64]) nota(m + (passo % 4 === 2 ? -2 : 0), t + k * b, b * 0.6, "square", 0.025, 1300);
      for (let k = 0; k < 2; k++) nota(mel[(passo * 2 + k) % mel.length], t + k * b * 1.5, b * 1.4, "sawtooth", 0.045, 2200);
      passo++; timer = setTimeout(compasso, b * 3 * 1000);
    };
    return { out, start() { lfo.start(); compasso(); }, stop(t) { vivo = false; clearTimeout(timer); try { lfo.stop(t); } catch { /* */ } } };
  },
  goteira() {
    const out = ganho(1); let vivo = true, timer = null; const e = sala(out, 0.27, 0.45);
    const pingo = () => {
      if (!vivo) return;
      const t = ctx.currentTime + 0.05; const f = 900 + Math.random() * 700; const o = osc("sine", f); const g = ganho(0);
      o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.9, t + 0.06);
      o.connect(g); g.connect(out); g.connect(e); env(g, t, 0.002, 0.18, 0.12); o.start(t); o.stop(t + 0.15);
      timer = setTimeout(pingo, 700 + Math.random() * 2200);
    };
    return { out, start() { pingo(); }, stop() { vivo = false; clearTimeout(timer); } };
  },
};
const ativos = {};
/* vol: volume próprio deste ambiente (0 a 1), além do volume geral de cada pessoa */
export function laco(nome, ligar, vol = 1) {
  try {
    ac();
    vol = Math.max(0, Math.min(1, Number(vol ?? 1)));
    if (ligar && ativos[nome]) { volLaco(nome, vol); return; }
    if (ligar && !ativos[nome] && LACO[nome]) {
      const l = LACO[nome](); const fade = ganho(0); l.out.connect(fade).connect(master);
      fade.gain.setValueAtTime(0, ctx.currentTime); fade.gain.linearRampToValueAtTime(vol, ctx.currentTime + 2.5);
      l.start(); ativos[nome] = { l, fade, vol };
    } else if (!ligar && ativos[nome]) {
      const { l, fade } = ativos[nome]; delete ativos[nome]; const t = ctx.currentTime;
      fade.gain.cancelScheduledValues(t); fade.gain.setValueAtTime(fade.gain.value, t); fade.gain.linearRampToValueAtTime(0, t + 1.5);
      setTimeout(() => { try { l.stop(ctx.currentTime); fade.disconnect(); } catch { /* */ } }, 1700);
    }
  } catch { /* sem áudio */ }
}
export function volLaco(nome, vol) {
  const a = ativos[nome]; if (!a || !ctx) return;
  vol = Math.max(0, Math.min(1, Number(vol) || 0)); if (Math.abs(vol - a.vol) < 0.01) return;
  a.vol = vol; const t = ctx.currentTime; a.fade.gain.cancelScheduledValues(t); a.fade.gain.setValueAtTime(a.fade.gain.value, t); a.fade.gain.linearRampToValueAtTime(vol, t + 0.6);
}
export function lacosAtivos() { return Object.keys(ativos); }
export function pararLacos() { for (const k of Object.keys(ativos)) laco(k, false); }

/* ---------- Áudio por link (mp3/ogg) ---------- */
let faixa = null, faixaUrl = "", faixaErro = "";
export function musicaComErro() { return faixa && faixaErro === faixaUrl; }
export function musica(url, vol = 0.6) {
  musicaVol = Number(vol) || 0;
  if (!url) { if (faixa) { faixa.pause(); faixa = null; faixaUrl = ""; } return; }
  if (faixa && faixaUrl === url) { faixa.volume = Math.max(0, Math.min(1, vol * volume)); return; }
  if (faixa) faixa.pause();
  // sem crossOrigin: com ele, links de servidores sem CORS (a maioria) não tocam
  faixa = new Audio(url); faixa.loop = true; faixa.preload = "auto"; faixaUrl = url; faixa.volume = Math.max(0, Math.min(1, vol * volume));
  faixa.onerror = () => { faixaErro = url; };
  faixa.play().catch(() => {});
}

/* ---------- Efeito por link (toca uma vez) ---------- */
const avulsos = new Set();
export function tocarUrl(url, vol = 1) {
  if (!/^https:\/\//i.test(String(url || ""))) return;
  try {
    const a = new Audio(url); a.volume = Math.max(0, Math.min(1, (Number(vol) || 1) * volume)); avulsos.add(a);
    a.onended = a.onerror = () => avulsos.delete(a);
    a.play().catch(() => avulsos.delete(a));
  } catch { /* */ }
}
export function pararAvulsos() { for (const a of avulsos) { try { a.pause(); } catch { /* */ } } avulsos.clear(); }
