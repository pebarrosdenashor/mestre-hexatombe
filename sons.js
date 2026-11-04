/* =========================================================
   Sons de ambientação, sintetizados no navegador (sem arquivos).
   Usado pelo fundo (toca em todos) e pela janela (prévia).
   ========================================================= */

export const EFEITOS = [
  ["porta", "🚪 Porta rangendo"], ["batidas", "✊ Batidas na porta"], ["passos", "👣 Passos"], ["sussurros", "🗣 Sussurros"],
  ["coracao", "❤ Coração"], ["trovao", "⛈ Trovão"], ["estatica", "📻 Estática"], ["sino", "🔔 Sino"],
  ["grito", "😱 Grito distante"], ["vidro", "🪟 Vidro quebrando"], ["corrente", "⛓ Correntes"], ["risada", "🎪 Risada do circo"],
];
export const AMBIENTES = [
  ["vento", "🌬 Vento"], ["chuva", "🌧 Chuva"], ["floresta", "🌲 Floresta à noite"], ["drone", "🕯 Tensão"], ["pulso", "💓 Batimento"], ["radio", "📡 Rádio chiando"],
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
export function setVolume(v) { volume = Math.max(0, Math.min(1, Number(v) || 0)); if (master) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05); }
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
};

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
};
const ativos = {};
export function laco(nome, ligar) {
  try {
    ac();
    if (ligar && !ativos[nome] && LACO[nome]) {
      const l = LACO[nome](); const fade = ganho(0); l.out.connect(fade).connect(master);
      fade.gain.setValueAtTime(0, ctx.currentTime); fade.gain.linearRampToValueAtTime(1, ctx.currentTime + 2.5);
      l.start(); ativos[nome] = { l, fade };
    } else if (!ligar && ativos[nome]) {
      const { l, fade } = ativos[nome]; delete ativos[nome]; const t = ctx.currentTime;
      fade.gain.cancelScheduledValues(t); fade.gain.setValueAtTime(fade.gain.value, t); fade.gain.linearRampToValueAtTime(0, t + 1.5);
      setTimeout(() => { try { l.stop(ctx.currentTime); fade.disconnect(); } catch { /* */ } }, 1700);
    }
  } catch { /* sem áudio */ }
}
export function lacosAtivos() { return Object.keys(ativos); }
export function pararLacos() { for (const k of Object.keys(ativos)) laco(k, false); }

/* ---------- Áudio por link (mp3/ogg) ---------- */
let faixa = null, faixaUrl = "";
export function musica(url, vol = 0.6) {
  if (!url) { if (faixa) { faixa.pause(); faixa = null; faixaUrl = ""; } return; }
  if (faixa && faixaUrl === url) { faixa.volume = Math.max(0, Math.min(1, vol * volume)); return; }
  if (faixa) faixa.pause();
  faixa = new Audio(url); faixa.loop = true; faixa.crossOrigin = "anonymous"; faixaUrl = url; faixa.volume = Math.max(0, Math.min(1, vol * volume));
  faixa.play().catch(() => {});
}
