/* =========================================================
   Gerador de equipes rivais para o Hexatombe.
   Cada equipe sai com nome, conceito, o que querem pedir no
   desejo, estratégia no ritual, segredo, tensões internas e
   3 a 5 agentes NPC prontos (no formato da aba NPCs do
   Hexatombe: PV, PE, Defesa, perícias, ataques, habilidades
   e uma pequena história). Números aproximados, para improvisar.
   ========================================================= */
import { pick, sortear, chance, nomePessoa, DANO_HAB, CURA } from "./gerador.js?v=1.3.1";

export const NEXS = [5, 10, 20, 35, 50, 65, 80, 99];
const VD_DO_NEX = { 5: 10, 10: 10, 20: 20, 35: 40, 50: 60, 65: 80, 80: 100, 99: 120 };
const DT_DO_NEX = { 5: 12, 10: 13, 20: 14, 35: 16, 50: 18, 65: 20, 80: 22, 99: 25 };

export const TEMAS = [
  ["sorteio", "🎲 Qualquer um"], ["ordem", "Ex-agentes da Ordem"], ["cultistas", "Cultistas dissidentes"], ["familia", "Família"],
  ["mercenarios", "Mercenários"], ["circo", "Trupe do circo"], ["civis", "Civis que caíram no ritual"], ["policia", "Força policial"],
];

/* ---------- Temas ---------- */
const T = {
  ordem: {
    nomes: ["Célula Ômega", "Equipe Vigília", "Os Remanescentes", "Esquadrão Lanterna", "Grupo Sentinela", "Os Desligados"],
    lema: ["“A Ordem nos esqueceu. Nós não esquecemos dela.”", "“Ninguém fica para trás. Quase ninguém.”", "“Conhecimento é a única arma que não enferruja.”"],
    conceito: ["Agentes que deixaram a Ordem depois de uma missão que deu errado e agora caçam o paranormal por conta própria.", "Uma célula que a Ordem mandou investigar o circo e nunca mais recebeu ordens de volta.", "Veteranos aposentados que receberam um convite impossível de recusar."],
    desejo: ["trazer de volta o agente que perderam na última missão", "apagar da história a missão que os expulsou da Ordem", "fechar para sempre a passagem que abriu o circo"],
    funcoes: ["lider", "atirador", "batedor", "medico", "ritualista", "tecnico"],
  },
  cultistas: {
    nomes: ["Filhos da Lona", "Círculo Escarlate", "Os Que Ouvem", "Irmandade do Relógio Parado", "Seita dos Sete Sinos"],
    lema: ["“O picadeiro escolhe. Nós obedecemos.”", "“Sangue pela lona, lona pelo sangue.”", "“A Coroa de Espinhos sabe nossos nomes.”"],
    conceito: ["Uma seita que rompeu com o culto principal porque quer o desejo só para si.", "Devotos que entraram no Hexatombe de propósito, acreditando que morrer ali é uma bênção.", "Ocultistas que estudaram o ritual por anos e acham que sabem como trapaceá-lo."],
    desejo: ["atravessar o Outro Lado sem morrer", "trazer a entidade do circo para o mundo", "ganhar o poder do líder do culto que os traiu"],
    funcoes: ["lider", "ritualista", "ritualista", "vidente", "brutamontes", "trapaceiro"],
  },
  familia: {
    nomes: ["Família {S}", "Os {S}", "Clã {S}", "Herdeiros {S}"],
    lema: ["“Sangue do nosso sangue.”", "“Família é quem volta para casa.”", "“O sobrenome é o que sobra.”"],
    conceito: ["Uma família inteira que acordou dentro do circo depois de um almoço de domingo.", "Parentes que herdaram uma dívida com o Outro Lado e vieram pagá-la.", "Irmãos e primos que vieram buscar alguém da família que sumiu ali anos atrás."],
    desejo: ["trazer de volta a mãe que morreu no incêndio do circo", "quebrar a maldição que mata um deles a cada geração", "que a família inteira saia viva, nem que custe os outros"],
    funcoes: ["lider", "brutamontes", "medico", "batedor", "trapaceiro", "vidente"],
    sobrenome: true,
  },
  mercenarios: {
    nomes: ["Companhia Ferro-Velho", "Os Cães de Aluguel", "Grupo Tarja Preta", "Brigada do Último Pagamento"],
    lema: ["“Pagou, levou.”", "“Ninguém é leal a um morto.”", "“Primeiro o serviço, depois a reza.”"],
    conceito: ["Mercenários contratados por alguém de fora para trazer um objeto do circo.", "Soldados de aluguel que acham que é só mais um trabalho estranho.", "Um grupo de segurança privada que foi pago adiantado e não sabe por quem."],
    desejo: ["dinheiro suficiente para nunca mais trabalhar", "o nome de quem os contratou", "sair do contrato com quem os contratou"],
    funcoes: ["lider", "atirador", "atirador", "brutamontes", "tecnico", "batedor"],
  },
  circo: {
    nomes: ["Trupe Itinerante Estrela", "Os Últimos do Picadeiro", "Companhia Lona Azul", "Os Artistas do Trem 7"],
    lema: ["“O show não pode parar.”", "“Respeitável público, ninguém sai.”", "“Rimos por último.”"],
    conceito: ["Artistas de um circo rival que sabem mais sobre a lona do que contam.", "A trupe original, presa entre a vida e a morte desde 1993.", "Artistas que fugiram do circo há anos e foram puxados de volta."],
    desejo: ["a última apresentação, com a plateia inteira de volta", "desfazer o incêndio", "ser lembrados para sempre"],
    funcoes: ["lider", "brutamontes", "trapaceiro", "batedor", "vidente", "atirador"],
    circo: true,
  },
  civis: {
    nomes: ["Sobreviventes do Ônibus 47", "Turma da Faculdade", "Os Vizinhos da Rua 9", "Grupo da Excursão"],
    lema: ["“A gente só quer ir pra casa.”", "“Ninguém aqui pediu pra estar aqui.”", "“Se correr o bicho pega.”"],
    conceito: ["Pessoas comuns que estavam no lugar errado e não entendem as regras.", "Estudantes que fizeram um ritual por brincadeira na noite errada.", "Vizinhos que seguiram uma luz estranha até o circo."],
    desejo: ["voltar para casa e esquecer tudo", "salvar um amigo que já morreu no primeiro dia", "nunca mais ter medo"],
    funcoes: ["lider", "medico", "tecnico", "batedor", "trapaceiro", "brutamontes"],
    fracos: true,
  },
  policia: {
    nomes: ["Força-Tarefa Lâmpada", "Delegacia 13", "Operação Lona", "Patrulha Noturna"],
    lema: ["“Mãos onde eu possa ver.”", "“A lei vale aqui também.”", "“Servir e proteger. Principalmente proteger.”"],
    conceito: ["Policiais que investigavam desaparecimentos no circo e entraram para não sair.", "Uma operação oficial que ninguém lá fora sabe que existe.", "Policiais corruptos que vinham cobrar uma dívida do dono do circo."],
    desejo: ["que os desaparecidos voltem para as famílias", "apagar os próprios crimes", "a promoção que nunca veio, e um pouco mais"],
    funcoes: ["lider", "atirador", "atirador", "batedor", "tecnico", "medico"],
  },
};
const ESTRATEGIAS = [
  "Se esconder, montar uma base forte e deixar as outras equipes se matarem.",
  "Caçar a equipe mais fraca logo no primeiro dia.",
  "Fingir aliança com uma equipe e trair na hora do sacrifício.",
  "Juntar informação e vender segredos na troca de informações.",
  "Sabotar as bases dos rivais à noite.",
  "Proteger um dos integrantes a qualquer custo: só ele precisa chegar ao fim.",
  "Explorar o mapa o mais rápido possível atrás dos melhores recursos.",
  "Negociar com todo mundo e não confiar em ninguém.",
];
const SEGREDOS = [
  "um dos integrantes já esteve num Hexatombe antes",
  "eles trouxeram escondido um item paranormal que não deveriam ter",
  "o líder fez um acordo com o culto e vai entregar um dos próprios companheiros",
  "eles sabem onde fica uma área com comida e água sobrando",
  "um deles é parente de alguém de outra equipe",
  "um deles já está marcado pelo Outro Lado e vai se transformar se ficar morrendo",
];
const FRAQUEZAS = ["pouca comida", "brigam entre si quando estão com fome", "o líder não aguenta ver ninguém sofrer", "não sabem nada de ocultismo", "um deles está ferido desde antes de começar", "confiam demais em quem oferece ajuda"];

/* ---------- Funções na equipe ---------- */
const F = {
  lider: { nome: ["Líder", "Líder"], classe: null, per: ["Diplomacia", "Tática", "Intimidação", "Percepção"],
    hab: ["Comando (2 PE, padrão): um aliado em alcance médio faz uma ação de movimento ou um ataque agora.", "Plano de contingência (1×/cena): quando um aliado falha num teste, ele rola de novo.", "Voz firme: aliados em alcance curto recebem +2 em Vontade."] },
  atirador: { nome: ["Atirador", "Atiradora"], classe: "Combatente", per: ["Pontaria", "Percepção", "Reflexos", "Tática"], arma: ["Fuzil", "2d10", "balístico", "Pontaria"],
    hab: ["Mira (movimento): +5 no próximo ataque à distância.", "Tiro de cobertura (2 PE): um alvo atacado não pode se mover até o próximo turno.", "Atirador de elite: ignora camuflagem leve."] },
  brutamontes: { nome: ["Brutamontes", "Brutamontes"], classe: "Combatente", per: ["Luta", "Atletismo", "Fortitude", "Intimidação"], arma: ["Machado", "1d12", "corte", "Luta"],
    hab: ["Golpe pesado (2 PE): +1 dado de dano e o alvo faz Fortitude DT {dt} ou cai.", "Escudo humano (reação): recebe no lugar de um aliado adjacente o dano de um ataque.", "Aguenta firme: uma vez por cena, ao ficar morrendo, continua de pé com 1 PV."] },
  batedor: { nome: ["Batedor", "Batedora"], classe: "Especialista", per: ["Furtividade", "Sobrevivência", "Percepção", "Atletismo"], arma: ["Arco", "1d8", "perfuração", "Pontaria"],
    hab: ["Rastreador: +1 dado em Sobrevivência para explorar áreas e seguir rastros.", "Sombra: pode se esconder mesmo sendo observado (Furtividade com −5).", "Ataque furtivo (2 PE): +{d} de dano contra alvo desprevenido."] },
  medico: { nome: ["Médico", "Médica"], classe: "Especialista", per: ["Medicina", "Intuição", "Ciências", "Vontade"], arma: ["Pistola", "1d12", "balístico", "Pontaria"],
    hab: ["Socorro rápido (2 PE, padrão): um aliado adjacente recupera {c} PV.", "Estabilizar: tira um aliado da condição morrendo sem teste, uma vez por cena.", "Triagem: sabe quantos PV faltam para cada pessoa que examina."] },
  tecnico: { nome: ["Técnico", "Técnica"], classe: "Especialista", per: ["Tecnologia", "Investigação", "Crime", "Profissão"], arma: ["Taser", "1d6", "eletricidade", "Pontaria"],
    hab: ["Armadilha (completa): prepara uma armadilha num ponto; quem passar faz Reflexos DT {dt} ou sofre {h} e fica imóvel 1 rodada.", "Sucateiro: com 1 sucata, conserta ou melhora um item até o fim do dia.", "Gambiarra: uma vez por cena, um item quebrado volta a funcionar."] },
  trapaceiro: { nome: ["Trapaceiro", "Trapaceira"], classe: "Especialista", per: ["Enganação", "Crime", "Diplomacia", "Furtividade"], arma: ["Faca", "1d4", "corte", "Luta"],
    hab: ["Lábia: +1 dado em Enganação e Diplomacia na troca de informações.", "Mão leve: pode roubar um item de alguém adjacente (Crime contra Percepção).", "Sempre tem uma saída: uma vez por cena, sai de um combate sem sofrer ataques."] },
  ritualista: { nome: ["Ritualista", "Ritualista"], classe: "Ocultista", per: ["Ocultismo", "Vontade", "Religião", "Intuição"], arma: ["Adaga ritual", "1d4", "corte", "Luta"],
    hab: ["Ritual de {el} (custa PE): {h} de {el} num alvo em alcance médio (Vontade DT {dt} reduz à metade).", "Proteção ({el}): aliados em alcance curto recebem RD 5 contra {el} até o fim da cena (2 PE).", "Componentes guardados: começa o dia com 2 componentes ritualísticos."] },
  vidente: { nome: ["Vidente", "Vidente"], classe: "Ocultista", per: ["Ocultismo", "Intuição", "Percepção", "Investigação"], arma: ["Revólver", "2d6", "balístico", "Pontaria"],
    hab: ["Pressentimento (reação, 2 PE): impõe −1 dado num ataque contra um aliado.", "Ler a área: uma vez por dia, descobre o perigo maior de uma área antes de entrar.", "Olhos do Outro Lado: vê criaturas invisíveis ou camufladas por {el}."] },
};
const PERSONALIDADE = ["Leal até o fim.", "Desconfia de todos.", "Faz piada quando está com medo.", "Fala pouco e observa muito.", "Não sabe recuar de uma briga.", "Tem medo de tudo, mas nunca mente.", "Reza o tempo todo.", "Pensa friamente antes de agir.", "Acredita que todos vão sair vivos.", "Perde a paciência com facilidade."];
const MEDOS = ["ficar sozinho no escuro", "palhaços", "morrer esquecido", "ver a família sofrer", "sinos", "perder o controle", "fogo", "lugares fechados", "espelhos"];
const LEALDADE = [["leal", 5], ["hesitante", 3], ["pode desertar", 2]];
const ATTR_DE = { Pontaria: "AGI", Luta: "FOR", Atletismo: "FOR", Furtividade: "AGI", Reflexos: "AGI", Acrobacia: "AGI", Crime: "AGI", Iniciativa: "AGI", Pilotagem: "AGI",
  Fortitude: "VIG", Vontade: "PRE", Percepção: "PRE", Diplomacia: "PRE", Enganação: "PRE", Intimidação: "PRE", Intuição: "PRE", Religião: "PRE", Adestramento: "PRE", Artes: "PRE",
  Investigação: "INT", Medicina: "INT", Ocultismo: "INT", Tecnologia: "INT", Ciências: "INT", Sobrevivência: "INT", Tática: "INT", Profissão: "INT", Atualidades: "INT" };

function pesado(lista) { const tot = lista.reduce((s, [, p]) => s + p, 0); let r = Math.random() * tot; for (const [v, p] of lista) { r -= p; if (r <= 0) return v; } return lista[0][0]; }
const ELEMENTOS = ["Sangue", "Morte", "Conhecimento", "Energia"];

function agente({ funcao, nex, g, sobrenome, fracos, circo }) {
  const f = F[funcao];
  const classe = f.classe || pick(["Combatente", "Especialista", "Ocultista"]);
  const n = Math.max(1, Math.round(nex / 5)); // nível de NEX
  // atributos: 1 em tudo, +4 pontos conforme a função, +1 nos patamares de NEX
  const a = { AGI: 1, FOR: 1, INT: 1, PRE: 1, VIG: 1 };
  const principais = [...new Set(f.per.map((p) => ATTR_DE[p]).filter(Boolean))];
  const prin = principais[0] || "AGI"; const seg = principais[1] || "VIG";
  a[prin] += 2; a[seg] += 1; a[pick(Object.keys(a))] += 1;
  if (chance(0.35)) { const baixo = pick(Object.keys(a).filter((k) => k !== prin && k !== seg && a[k] === 1)); if (baixo) { a[baixo] = 0; a[prin] += 1; } }
  for (const lim of [20, 50, 80, 95]) if (nex >= lim) a[prin] = Math.min(5, a[prin] + 1);
  if (fracos) for (const k of Object.keys(a)) a[k] = Math.max(0, a[k] - (chance(0.4) ? 1 : 0));
  const K = { Combatente: [20, 4, 2, 2, 5], Especialista: [16, 3, 3, 3, 3], Ocultista: [12, 2, 4, 4, 0] }[classe]; // PV base, PV/nível, PE base, PE/nível, Defesa extra
  const pv = Math.max(4, K[0] + a.VIG + (n - 1) * (K[1] + a.VIG));
  const pe = Math.max(1, K[2] + a.PRE + (n - 1) * (K[3] + a.PRE));
  const def = 10 + a.AGI + K[4];
  const grau = (i) => (nex >= 70 && i === 0 ? 15 : nex >= 35 && i < 2 ? 10 : 5);
  const teste = (per, bonus) => `${Math.max(1, a[ATTR_DE[per]] ?? 1)}d20${bonus ? `+${bonus}` : ""}`;
  const treinadas = f.per.slice(0, 3 + (chance(0.5) ? 1 : 0));
  const pericias = treinadas.filter((p) => !["Reflexos", "Fortitude", "Vontade", "Percepção"].includes(p)).map((p) => [p, teste(p, grau(treinadas.indexOf(p)))]);
  const tr = (p) => (treinadas.includes(p) ? grau(treinadas.indexOf(p)) : 0);
  const res = {
    Fortitude: teste("Fortitude", tr("Fortitude") || (classe === "Combatente" ? 5 : 0)),
    Reflexos: teste("Reflexos", tr("Reflexos") || (classe !== "Ocultista" ? 5 : 0)),
    Vontade: teste("Vontade", tr("Vontade") || (classe === "Ocultista" ? 5 : 0)),
  };
  const el = pick(ELEMENTOS);
  const ctx = { dt: DT_DO_NEX[nex], h: DANO_HAB[VD_DO_NEX[nex]], c: CURA[VD_DO_NEX[nex]], d: nex >= 50 ? "2d6" : "1d6", el };
  const sub = (t) => t.replaceAll("{dt}", ctx.dt).replaceAll("{h}", ctx.h).replaceAll("{c}", ctx.c).replaceAll("{d}", ctx.d).replaceAll("{el}", ctx.el);
  // ataques
  const atq = [];
  const arma = f.arma || (classe === "Combatente" ? ["Espada", "1d10", "corte", "Luta"] : classe === "Ocultista" ? ["Adaga", "1d4", "corte", "Luta"] : ["Pistola", "1d12", "balístico", "Pontaria"]);
  const bonusArma = arma[3] === "Luta" ? a.FOR : 0;
  atq.push([arma[0], teste(arma[3], tr(arma[3]) || 5), `${arma[1]}${bonusArma ? `+${bonusArma}` : ""}`, arma[2]]);
  if (arma[3] === "Pontaria" && classe !== "Ocultista") atq.push(["Coronhada", teste("Luta", 0), `1d4${a.FOR ? `+${a.FOR}` : ""}`, "impacto"]);
  const extra = [];
  const hab = [];
  // habilidades de classe
  if (classe === "Combatente") hab.push("Ataque especial (2 PE): +5 no teste de ataque ou no dano.");
  if (classe === "Especialista") hab.push(`Perito (2 PE): +1d6 num teste de ${treinadas[0]} ou ${treinadas[1] || treinadas[0]}.`);
  if (classe === "Ocultista") { hab.push(sub(`Escolhido pelo Outro Lado: conjura rituais de {el} (DT {dt}).`)); extra.push([`Ritual de ${el}`, ctx.h]); }
  if (circo) hab.push(pick(["Artista: +1 dado nos jogos do circo.", "Conhece a lona: não se perde dentro do circo.", "Plateia invisível: uma vez por dia, recupera 1d6 PE com aplausos que ninguém mais ouve."]));
  hab.push(...sortear(f.hab, nex >= 50 ? 2 : 1).map(sub));
  if (nex >= 65) hab.push(pick(["Veterano: uma vez por cena, rola de novo um teste que falhou.", "Instinto de sobrevivência: +5 na Defesa quando estiver com menos da metade dos PV.", `Afinidade com ${el}: +1 dado em testes de Ocultismo envolvendo ${el}.`]));

  const nome = sobrenome ? `${nomePessoa(g).split(" ")[0]} ${sobrenome}` : nomePessoa(g);
  const funcNome = f.nome[g === "f" ? 1 : 0];
  const lealdade = funcao === "lider" ? "leal" : pesado(LEALDADE);
  const historia = [
    `${funcNome} da equipe. ${pick(PERSONALIDADE)} Tem medo de ${pick(MEDOS)}.`,
    `Desejo pessoal: ${pick(["sair vivo", "vingar alguém que morreu no primeiro dia", "provar que não é um peso morto", "o desejo da equipe, mas por outro motivo", "ficar com o desejo só para si", "proteger o mais novo do grupo"])}.`,
    `Lealdade: ${lealdade}${lealdade === "pode desertar" ? ` (${pick(["se ficar com fome por um dia", "se o líder sacrificar alguém", "se outra equipe oferecer comida e abrigo", "se descobrir o segredo da equipe"])})` : ""}.`,
  ];
  return {
    custom: true, nome, tipo: `${funcNome} · ${classe}`, vd: `NEX ${nex}%`, def: String(def), pv: String(pv), pvAtual: String(pv), pe: String(pe), peAtual: String(pe),
    maq: String(Math.floor(pv / 2)), desl: "9m", attrs: Object.entries(a).map(([k, v]) => `${k} ${v}`).join(" · "),
    per: teste("Percepção", tr("Percepção")), ini: teste("Iniciativa", classe === "Especialista" ? 5 : 0), res, pp: "", rd: "", vuln: "",
    pericias, atq, extra, hab, historia, funcao, classe, lealdade,
  };
}

export function gerarEquipe({ nex = 35, tam = 4, tema = "sorteio" } = {}) {
  if (!NEXS.includes(Number(nex))) nex = 35; nex = Number(nex);
  tam = Math.max(2, Math.min(6, Number(tam) || 4));
  const chave = T[tema] ? tema : pick(Object.keys(T)); const t = T[chave];
  const sobrenome = t.sobrenome ? pick(["Albuquerque", "Bittencourt", "Damasceno", "Galvão", "Mendonça", "Queiroz", "Vasconcelos", "Siqueira", "Prado"]) : "";
  const nome = pick(t.nomes).replace("{S}", sobrenome);
  // o líder sempre, depois as funções do tema, sem repetir enquanto der
  const fun = ["lider", ...sortear(t.funcoes.filter((x) => x !== "lider"), tam - 1)];
  while (fun.length < tam) fun.push(pick(t.funcoes));
  const membros = fun.map((funcao) => agente({ funcao, nex, g: chance(0.5) ? "f" : "m", sobrenome, fracos: !!t.fracos, circo: !!t.circo }));
  // sem apelidos nem primeiros nomes repetidos na mesma equipe
  const vistos = new Set();
  for (const m of membros) {
    const ap = /“([^”]+)”/.exec(m.nome)?.[1];
    if (ap && vistos.has(ap)) m.nome = m.nome.replace(/ “[^”]+”/, "");
    if (ap) vistos.add(ap);
  }
  const eq = { nome, tema: chave, temaNome: (TEMAS.find(([k]) => k === chave) || [, chave])[1], nex, lema: pick(t.lema), conceito: pick(t.conceito), desejo: pick(t.desejo),
    estrategia: pick(ESTRATEGIAS), segredo: pick(SEGREDOS), fraqueza: pick(FRAQUEZAS), tensoes: [], membros };
  eq.tensoes = tensoes(membros);
  return eq;
}
function tensoes(ms) {
  if (ms.length < 2) return [];
  const out = []; const [a, b] = sortear(ms, 2); const p1 = (m) => m.nome.split(" ")[0];
  out.push(pick([`${p1(a)} e ${p1(b)} se conhecem de antes e não se suportam.`, `${p1(a)} deve a vida a ${p1(b)}.`, `${p1(a)} e ${p1(b)} são um casal, e escondem isso dos outros.`, `${p1(a)} desconfia que ${p1(b)} é um traidor.`, `${p1(a)} e ${p1(b)} são irmãos.`]));
  const desertor = ms.find((m) => m.lealdade === "pode desertar");
  if (desertor) out.push(`${p1(desertor)} é quem mais pode abandonar a equipe.`);
  return out;
}
/* Sorteia de novo um integrante, mantendo a função */
export function outroMembro(eq, i) {
  const m = eq.membros[i]; if (!m) return eq;
  const t = T[eq.tema] || {};
  const sob = t.sobrenome ? m.nome.split(" ").slice(1).join(" ") : "";
  eq.membros[i] = agente({ funcao: m.funcao, nex: eq.nex, g: chance(0.5) ? "f" : "m", sobrenome: sob, fracos: !!t.fracos, circo: !!t.circo });
  eq.tensoes = tensoes(eq.membros);
  return eq;
}
export function outraHistoriaEquipe(eq) {
  const t = T[eq.tema]; if (!t) return eq;
  Object.assign(eq, { lema: pick(t.lema), conceito: pick(t.conceito), desejo: pick(t.desejo), estrategia: pick(ESTRATEGIAS), segredo: pick(SEGREDOS), fraqueza: pick(FRAQUEZAS), tensoes: tensoes(eq.membros) });
  return eq;
}
export function equipeTexto(eq) {
  return [
    `${eq.nome} — ${eq.temaNome}, NEX ${eq.nex}%`, eq.lema, eq.conceito,
    `Desejo: ${eq.desejo}.`, `Estratégia: ${eq.estrategia}`, `Segredo: ${eq.segredo}.`, `Ponto fraco: ${eq.fraqueza}.`, ...eq.tensoes,
  ];
}
export function membroTexto(m) {
  return `${m.nome} — ${m.tipo}, ${m.vd}\nDefesa ${m.def} · PV ${m.pv} · PE ${m.pe} · ${m.attrs}\nPercepção ${m.per} · Iniciativa ${m.ini} · Fort ${m.res.Fortitude} · Ref ${m.res.Reflexos} · Von ${m.res.Vontade}\nPerícias: ${m.pericias.map((p) => `${p[0]} ${p[1]}`).join(", ")}\n${m.atq.map((a) => `${a[0]}: ${a[1]} (${a[2]} ${a[3]})`).join("\n")}\n${m.hab.join("\n")}\n${m.historia.join("\n")}`;
}
