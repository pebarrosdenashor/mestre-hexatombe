/* =========================================================
   Gerador rápido de NPCs e criaturas.
   Os números são aproximados: seguem a escala das ameaças do
   Hexatombe e do livro básico (Defesa, PV e testes por VD),
   para improvisar. Confira com o livro quando importar.
   ========================================================= */

export const VDS = [10, 20, 40, 60, 80, 100, 120, 160];
const TAB = {
  10: { def: 12, pv: 12, t: "2d20+5", dano: "1d6+2", bom: "2d20+5", ruim: "1d20", per: "1d20+5", pp: "" },
  20: { def: 14, pv: 25, t: "2d20+7", dano: "1d8+3", bom: "2d20+7", ruim: "1d20+2", per: "2d20+5", pp: "DT 15 · 1d6 mental · NEX 15% imune" },
  40: { def: 17, pv: 50, t: "2d20+8", dano: "2d6+4", bom: "2d20+8", ruim: "1d20+3", per: "2d20+5", pp: "DT 17 · 2d6 mental · NEX 25% imune" },
  60: { def: 19, pv: 85, t: "3d20+8", dano: "2d8+5", bom: "3d20+8", ruim: "2d20", per: "2d20+5", pp: "DT 18 · 2d8 mental · NEX 30% imune" },
  80: { def: 22, pv: 130, t: "3d20+10", dano: "2d8+8", bom: "3d20+10", ruim: "2d20+5", per: "2d20+10", pp: "DT 20 · 3d8 mental · NEX 40% imune" },
  100: { def: 24, pv: 170, t: "4d20+10", dano: "3d8+8", bom: "4d20+10", ruim: "2d20+5", per: "3d20+10", pp: "DT 22 · 4d6 mental · NEX 45% imune" },
  120: { def: 27, pv: 225, t: "4d20+12", dano: "3d10+10", bom: "4d20+12", ruim: "2d20+8", per: "3d20+10", pp: "DT 23 · 4d6 mental · NEX 50% imune" },
  160: { def: 30, pv: 320, t: "5d20+15", dano: "4d10+12", bom: "5d20+15", ruim: "3d20+10", per: "4d20+15", pp: "DT 26 · 5d8 mental · NEX 65% imune" },
};
export const TIPOS = [
  ["humano", "Pessoa armada"], ["cultista", "Cultista"], ["animal", "Animal"],
  ["Sangue", "Criatura de Sangue"], ["Morte", "Criatura de Morte"], ["Conhecimento", "Criatura de Conhecimento"], ["Energia", "Criatura de Energia"], ["Medo", "Criatura de Medo"],
];
export const PAPEIS = [["lacaio", "Lacaio (fraco, em bando)"], ["comum", "Comum"], ["chefe", "Chefe"]];

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const NOMES = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Glória", "Hugo", "Iara", "João", "Kátia", "Lucas", "Marta", "Nilo", "Olga", "Paulo", "Rafael", "Sônia", "Túlio", "Vítor", "Wanda", "Zeca", "Benedita", "Caetano", "Dalva", "Ernesto", "Irineu", "Jussara", "Mirela", "Odete"];
const SOBRENOMES = ["Silva", "Souza", "Pereira", "Costa", "Nogueira", "Barros", "Ferraz", "Rocha", "Moraes", "Prado", "Siqueira", "Fonseca", "Lacerda"];
const ANIMAIS = [["Cão selvagem", "Mordida", "corte"], ["Javali", "Presas", "perfuração"], ["Onça", "Garras", "corte"], ["Urubu gigante", "Bicada", "perfuração"], ["Jacaré", "Mordida", "perfuração"], ["Lobo-guará", "Mordida", "corte"]];
const NOME_CRI = {
  Sangue: ["Carniçal", "Devorador", "Retalhado", "Bocarra", "Abatedor", "Costurado"],
  Morte: ["Lodento", "Ampulheta", "Apodrecido", "Cinzento", "Esquecido", "Espiral"],
  Conhecimento: ["Sigilado", "Escriba", "Olho-Dourado", "Traçado", "Sem-Rosto", "Lente"],
  Energia: ["Estático", "Faísca", "Distorcido", "Glitch", "Caleidoscópio", "Ruído"],
  Medo: ["Inominável", "Vulto", "O Que Espera", "Silhueta", "Impossível", "Lacuna"],
};
const FRACO = { Sangue: "Morte", Morte: "Energia", Energia: "Conhecimento", Conhecimento: "Sangue", Medo: "" };
const DADO_EL = { 10: "1d4", 20: "1d6", 40: "1d6", 60: "1d8", 80: "1d8", 100: "2d6", 120: "1d10", 160: "2d10" };
const HAB_EL = {
  Sangue: ["Frenesi: abaixo da metade dos PV, +1 dado nos ataques.", "Banquete: ao deixar um alvo morrendo, recupera PV iguais ao dano do golpe."],
  Morte: ["Lodo: alvo atingido fica lento por 1 rodada (Fortitude evita).", "Tempo roubado: uma vez por cena, age novamente logo após o próprio turno."],
  Conhecimento: ["Sigilos: alvo atingido faz Vontade ou fica esmorecido até o fim da cena.", "Leitura: sabe o próximo passo dos agentes; o primeiro ataque contra ela na cena sofre −1 dado."],
  Energia: ["Instável: no início do turno, role 1d6; com 5 ou 6, teleporta-se até 9m.", "Sobrecarga: ao sofrer dano de Energia, cura metade em vez de sofrer."],
  Medo: ["Impossível: ataques contra ela sofrem −1 dado na primeira rodada.", "Presença absoluta: quem a vê pela primeira vez faz Vontade ou fica apavorado por 1 rodada."],
};

function ajusta(expr, extra) { // "2d20+8" com +2
  const m = /^(\d+d20)([+-]\d+)?$/.exec(expr); if (!m) return expr;
  const b = (Number(m[2]) || 0) + extra; return `${m[1]}${b ? (b > 0 ? "+" : "") + b : ""}`;
}
function maisDado(expr, d) { const m = /^(\d+)d(\d+)(.*)$/.exec(expr); return m ? `${Number(m[1]) + d}d${m[2]}${m[3]}` : expr; }

export function gerarNpc({ tipo = "humano", vd = 40, papel = "comum" } = {}) {
  vd = TAB[vd] ? vd : 40; const T = TAB[vd];
  let pv = T.pv, def = T.def, atqT = T.t, dano = T.dano;
  if (papel === "lacaio") { pv = Math.max(4, Math.round(pv * 0.4)); def -= 2; atqT = ajusta(atqT, -3); }
  if (papel === "chefe") { pv = Math.round(pv * 1.7); def += 2; atqT = ajusta(atqT, 3); dano = maisDado(dano, 1); }
  const cri = { tipo: "", vd, per: T.per, ini: T.bom, res: { Fortitude: T.ruim, Reflexos: T.ruim, Vontade: T.ruim }, atq: [], extra: [], hab: [], pp: "", rd: "", vuln: "", desl: "9m" };
  let nome;
  if (tipo === "humano" || tipo === "cultista") {
    nome = `${pick(NOMES)} ${pick(SOBRENOMES)}`;
    cri.res = { Fortitude: T.bom, Reflexos: T.bom, Vontade: T.ruim };
    if (tipo === "humano") {
      cri.tipo = "Pessoa Média";
      const arma = pick([["Pistola", "balístico"], ["Escopeta", "balístico"], ["Revólver", "balístico"], ["Fuzil de caça", "balístico"]]);
      cri.atq.push([arma[0], atqT, dano, arma[1]], ["Coronhada", ajusta(atqT, -2), maisDado(dano, -1).replace(/^0d\d+/, "1d4"), "impacto"]);
      cri.hab.push(pick(["Cobertura: +5 de Defesa atrás de cobertura.", "Tiro certeiro: uma vez por cena, +5 no dano de um ataque.", "Ataque em dupla: +2 no ataque se um aliado estiver adjacente ao alvo."]));
    } else {
      cri.tipo = "Ocultista Média"; nome = `${pick(["Irmão", "Irmã", "Discípulo", "Devota"])} ${nome.split(" ")[0]}`;
      const el = pick(["Sangue", "Morte", "Conhecimento", "Energia"]);
      cri.res.Vontade = T.bom;
      cri.atq.push(["Adaga ritual", atqT, dano, `corte + ${el}`]);
      const rit = { 10: "2d6", 20: "3d6", 40: "3d8", 60: "4d8", 80: "6d6", 100: "6d8", 120: "8d8", 160: "10d8" }[vd];
      cri.extra.push([`Ritual de ${el} (${rit})`, rit]);
      cri.hab.push(`Conjura rituais de ${el} (DT ${10 + Math.round(vd / 10)}). Custa a própria vida: perde 1d6 PV por ritual.`, "Fanatismo: imune a ficar apavorado.");
    }
  } else if (tipo === "animal") {
    const [n, golpe, td] = pick(ANIMAIS); nome = n;
    cri.tipo = "Animal Médio"; cri.res = { Fortitude: T.bom, Reflexos: T.bom, Vontade: T.ruim }; cri.desl = "12m";
    cri.atq.push([golpe, atqT, dano, td]);
    cri.hab.push(pick(["Faro: +5 em Percepção para rastrear.", "Investida: se mover 6m em linha reta antes de atacar, +1 dado de dano.", "Matilha: +2 no ataque por aliado adjacente ao alvo."]));
  } else {
    const el = tipo; nome = `${pick(NOME_CRI[el])} de ${el}`;
    const tam = vd >= 120 ? "Grande" : "Média";
    cri.tipo = `Criatura de ${el} ${tam}`; cri.desl = el === "Energia" ? "12m" : "9m";
    cri.res = el === "Sangue" ? { Fortitude: T.bom, Reflexos: T.bom, Vontade: T.ruim } : el === "Conhecimento" ? { Fortitude: T.ruim, Reflexos: T.bom, Vontade: T.bom } : { Fortitude: T.bom, Reflexos: T.ruim, Vontade: T.bom };
    const x = vd >= 120 ? 10 : vd >= 40 ? 5 : 2;
    cri.rd = `Balístico, corte, impacto e perfuração ${x} · ${el} ${x * 2}`;
    cri.vuln = FRACO[el];
    cri.pp = T.pp;
    const golpes = { Sangue: ["Garras", "corte"], Morte: ["Toque do lodo", "Morte"], Conhecimento: ["Lâmina de sigilos", "corte + Conhecimento"], Energia: ["Descarga", "Energia"], Medo: ["Toque impossível", "Medo"] }[el];
    cri.atq.push([golpes[0], atqT, `${dano}+${DADO_EL[vd]}`, golpes[1]]);
    if (vd >= 60) cri.atq.push(["Golpe secundário", ajusta(atqT, -5), maisDado(dano, -1).replace(/^0d\d+/, "1d6"), "impacto"]);
    cri.hab.push(pick(HAB_EL[el]));
  }
  if (papel === "chefe") cri.hab.push("Chefe: age duas vezes por rodada (some 10 à iniciativa para a segunda ação).");
  if (papel === "lacaio") cri.hab.push("Lacaio: cai ao sofrer qualquer dano que passe da metade dos PV de uma vez.");
  return { nome, pv, def, cri };
}
