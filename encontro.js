/* =========================================================
   Gerador de encontros.
   Monta um grupo coerente de inimigos (chefe, comuns e lacaios
   do mesmo tema e, quando faz sentido, do mesmo elemento) e uma
   cena pronta: o que estão fazendo, onde, uma complicação, como
   resolver sem luta e o que se ganha. Usa o gerador de NPC para
   cada grupo. Números aproximados, para improvisar.
   ========================================================= */
import { gerarNpc, pick, sortear, chance } from "./gerador.js?v=1.8.0";

export const TEMAS_ENC = [
  ["sorteio", "🎲 Qualquer um"], ["culto", "Culto em ritual"], ["circo", "Artistas do circo"], ["armados", "Pessoas armadas"],
  ["criaturas", "Criaturas do Outro Lado"], ["animais", "Animais"], ["assombrado", "Lugar assombrado"], ["agentes", "Agentes rivais"],
  ["possuidos", "Pessoas tomadas"], ["civis", "Civis em perigo"],
];
export const DIFICULDADES = [["facil", "Fácil"], ["medio", "Médio"], ["dificil", "Difícil"], ["mortal", "Mortal"]];
export const ELEMENTOS_ENC = [["sorteio", "🎲 Elemento"], ["Sangue", "Sangue"], ["Morte", "Morte"], ["Conhecimento", "Conhecimento"], ["Energia", "Energia"], ["Medo", "Medo"]];

/* Quantos de cada papel, por dificuldade */
const COMP = {
  facil: [["comum", 1], ["lacaio", 2]],
  medio: [["comum", 2], ["lacaio", 3]],
  dificil: [["chefe", 1], ["comum", 1], ["lacaio", 3]],
  mortal: [["chefe", 1], ["comum", 2], ["lacaio", 4]],
};
const ELS = ["Sangue", "Morte", "Conhecimento", "Energia"];

/* Que tipo de NPC ocupa cada papel em cada tema. Pode ser uma lista (sorteia). */
const QUEM = {
  culto: { chefe: ["cultista", "possuido"], comum: ["cultista"], lacaio: ["cultista"] },
  circo: { chefe: ["circo"], comum: ["circo", "circo", "animal"], lacaio: ["circo"] },
  armados: { chefe: ["humano", "agente"], comum: ["humano"], lacaio: ["humano"] },
  criaturas: { chefe: ["EL"], comum: ["EL"], lacaio: ["EL"] },
  animais: { chefe: ["animal"], comum: ["animal"], lacaio: ["animal"] },
  assombrado: { chefe: ["assombracao"], comum: ["assombracao", "EL"], lacaio: ["EL"] },
  agentes: { chefe: ["agente"], comum: ["agente", "humano"], lacaio: ["humano"] },
  possuidos: { chefe: ["EL"], comum: ["possuido"], lacaio: ["possuido"] },
  civis: { chefe: ["EL", "cultista"], comum: ["EL", "animal"], lacaio: ["EL"], civis: true },
};

const CENA = {
  culto: {
    titulo: ["O ritual da meia-noite", "Velas no picadeiro", "A oferenda", "Cântico na capela", "O altar de lona"],
    situacao: ["estão no meio de um ritual e falta pouco para terminar", "arrastam uma pessoa amarrada até o altar", "pintam sigilos com sangue no chão do picadeiro", "rezam em volta de um caixão aberto", "discutem quem será o próximo sacrifício"],
    objetivo: ["terminar o ritual antes que os sinos toquem", "entregar o sacrifício vivo ao líder", "proteger o altar a qualquer custo", "capturar um dos agentes para o ritual"],
    semLuta: ["Interromper o ritual (Ocultismo DT {dt}) faz os lacaios fugirem em pânico.", "Um cultista arrependido aceita trair os outros se os agentes prometerem tirá-lo dali.", "Derrubar as velas apaga o círculo: o chefe perde a vantagem e negocia.", "Fingir ser um mensageiro do líder (Enganação DT {dt})."],
    recompensa: ["o caderno com o ritual completo", "componentes ritualísticos (1d4)", "a chave do baú do líder", "a pessoa salva, que sabe onde fica a saída", "comida guardada para as oferendas"],
  },
  circo: {
    titulo: ["O último número", "Ensaio geral", "Respeitável público", "A trupe não dorme", "Show particular"],
    situacao: ["ensaiam um número para uma plateia vazia", "esperam os agentes sentados na arquibancada, como se fossem plateia", "brigam por causa de um figurino roubado", "alimentam as feras com algo que não é carne de boi", "preparam uma armadilha disfarçada de apresentação"],
    objetivo: ["fazer os agentes participarem do número", "impedir que alguém saia antes do fim do show", "capturar alguém para a trupe", "recuperar algo que os agentes pegaram"],
    semLuta: ["Aplaudir de verdade no fim do número (Artes ou Diplomacia DT {dt}) os acalma.", "Aceitar participar do número: um teste de Acrobacia ou Artes DT {dt} e eles deixam passar.", "Lembrar o apresentador da plateia de 1993 (Investigação antes) faz ele chorar e parar.", "Soltar as feras das jaulas cria confusão para fugir."],
    recompensa: ["ingressos que abrem uma área trancada", "a chave da jaula dos leões", "um baralho que prevê a próxima ameaça (1 uso)", "comida da barraca de pipoca", "um figurino que dá +2 em Enganação"],
  },
  armados: {
    titulo: ["Posto de controle", "Os capangas", "Tocaia na estrada", "O acerto de contas", "Guarda noturna"],
    situacao: ["montaram uma barricada e vigiam a passagem", "revistam um civil de forma violenta", "contam dinheiro e bebem em volta de uma fogueira", "esperam escondidos alguém que deveria passar por ali", "estão nervosos: ouviram algo e atiram em qualquer barulho"],
    objetivo: ["ninguém passa sem pagar", "levar o que os agentes carregam", "cumprir uma ordem que nem entendem direito", "sair vivos dessa noite"],
    semLuta: ["Pagar o pedágio: comida, água ou um item.", "Convencer que o patrão mandou deixar passar (Enganação DT {dt}).", "Mostrar a eles a criatura que vem vindo: viram aliados por uma cena.", "Esperar a troca de turno e passar escondido (Furtividade DT {dt})."],
    recompensa: ["munição e uma arma sobrando", "rádio comunicador", "comida para dois dias", "o nome de quem os contratou", "a chave de um veículo"],
  },
  criaturas: {
    titulo: ["O ninho", "A coisa no escuro", "Caçada", "Passagem aberta", "Sinais"],
    situacao: ["se alimentam de algo que ainda se mexe", "dormem num ninho feito de restos e lona", "rondam uma base, esperando alguém sair", "atravessam uma fenda para o nosso lado agora mesmo", "brincam com uma vítima antes de terminar"],
    objetivo: ["comer", "proteger o ninho", "abrir a passagem por completo", "seguir o cheiro de quem tem a marca do sacrifício"],
    semLuta: ["Usar a fraqueza delas (Ocultismo DT {dt} para descobrir) faz o bando recuar.", "Deixar comida ou um animal como isca para passar enquanto comem.", "Fechar a fenda com um ritual (Ocultismo DT {dt}) faz as menores sumirem.", "Ficar imóvel no escuro (Furtividade DT {dt}): elas seguem o movimento."],
    recompensa: ["restos da criatura (componente do elemento)", "um objeto da vítima com uma pista", "o caminho que elas protegiam", "um item paranormal no ninho"],
  },
  animais: {
    titulo: ["As feras soltas", "Matilha", "O bando", "Fome", "Território"],
    situacao: ["fugiram das jaulas e estão famintos", "disputam uma carcaça", "protegem filhotes num canto", "foram tocados pelo Outro Lado e estão mudando", "seguem o grupo há horas, sem pressa"],
    objetivo: ["comer", "defender o território", "fugir do que está na mata", "proteger os filhotes"],
    semLuta: ["Jogar comida e se afastar devagar.", "Acalmar com Adestramento DT {dt}.", "Fogo os espanta por uma rodada.", "Deixar o caminho livre: eles só querem passar."],
    recompensa: ["um animal domado (Adestramento DT {dt})", "uma coleira com uma pista do circo", "o caminho que guardavam", "carne para dois dias, se tiver coragem"],
  },
  assombrado: {
    titulo: ["A sala que lembra", "Ecos de 1993", "O vagão frio", "Quem bate na porta", "O camarim"],
    situacao: ["as luzes piscam e a cena da morte se repete", "uma voz chama um dos agentes pelo nome", "objetos flutuam e se arrumam como estavam naquela noite", "uma música de circo toca de uma vitrola sem disco", "a temperatura cai e o vapor da respiração forma palavras"],
    objetivo: ["que alguém termine o que ficou pela metade", "expulsar quem mexer nas coisas dela", "mostrar quem foi o culpado", "não ficar sozinha de novo"],
    semLuta: ["Descobrir e resolver o que a prende (Investigação DT {dt}).", "Devolver o objeto que ela perdeu.", "Dizer o nome dela em voz alta.", "Sair antes da terceira vez que as luzes apagarem."],
    recompensa: ["uma pista sobre o incêndio de 1993", "o objeto que a prendia, agora um item paranormal", "uma passagem que só ela conhecia", "um aviso sobre o que vem na próxima noite"],
  },
  agentes: {
    titulo: ["Concorrência", "A outra investigação", "Encontro na encruzilhada", "Mesma pista", "Os profissionais"],
    situacao: ["investigam a mesma pista que os agentes", "interrogam um civil com métodos pesados", "montam um selo de contenção em volta de algo", "esperam os agentes chegarem, armados e calmos", "acabaram de sair de uma briga com uma criatura e estão feridos"],
    objetivo: ["chegar primeiro ao item que todos procuram", "apagar as provas", "recrutar os agentes, ou eliminá-los", "sair do circo com o que vieram buscar"],
    semLuta: ["Propor uma trégua e dividir a informação (Diplomacia DT {dt}).", "Mostrar que o contratante deles mentiu (Investigação antes).", "Ajudar com a criatura que os persegue.", "Trocar a pista por comida, água ou passagem."],
    recompensa: ["um diário com anotações sobre o circo", "componentes ritualísticos", "munição amaldiçoada", "o nome de quem os mandou", "um aliado improvável para a próxima cena"],
  },
  possuidos: {
    titulo: ["Os que voltaram", "A procissão", "Rostos conhecidos", "A família", "Contágio"],
    situacao: ["andam em fila, cantando baixinho, em direção ao picadeiro", "fingem ser sobreviventes e pedem ajuda", "rodeiam alguém que ainda resiste", "estão parados, de olhos fechados, esperando uma ordem", "uma pessoa ainda está mudando, e implora para morrer"],
    objetivo: ["levar mais gente para a coisa que os controla", "proteger quem os controla", "voltar para casa, sem saber que não podem", "achar o próximo corpo"],
    semLuta: ["Destruir a criatura que os controla liberta os outros.", "Chamar cada um pelo nome (Diplomacia DT {dt}) faz um deles voltar a si por uma rodada.", "Um ritual de proteção (Ocultismo DT {dt}) os mantém afastados.", "Seguir a fila em silêncio leva até quem os controla."],
    recompensa: ["alguém salvo, que lembra de tudo", "o objeto que fazia a ligação com o Outro Lado", "o caminho até a criatura", "documentos de pessoas desaparecidas"],
  },
  civis: {
    titulo: ["Socorro!", "Encurralados", "A família na barraca", "Sobreviventes", "Alguém grita"],
    situacao: ["civis estão encurralados numa barraca e as ameaças cercam a porta", "um grupo de civis foge e as ameaças vêm atrás", "civis escondidos fazem barulho demais", "um civil ferido serve de isca sem saber", "os civis brigam entre si enquanto o perigo se aproxima"],
    objetivo: ["pegar os civis", "usar os civis como isca para os agentes", "proteger o lugar onde os civis entraram", "seguir o sangue do ferido"],
    semLuta: ["Distrair as ameaças enquanto os civis fogem (Atletismo ou Enganação DT {dt}).", "Levar todos para um lugar seguro por um caminho escondido.", "Fazer barulho do outro lado para atrair as ameaças.", "Acalmar os civis (Diplomacia DT {dt}) para que fiquem em silêncio."],
    recompensa: ["os civis salvos, que viram algo importante", "comida e água dos civis", "um civil que se junta aos agentes por um tempo", "um mapa rabiscado por um dos civis"],
  },
};
const LOCAIS = [
  "no picadeiro principal, sob a lona rasgada", "na fileira de jaulas atrás do circo", "dentro do trem parado, no vagão-dormitório", "na roda-gigante enferrujada",
  "na capela no fim da estrada", "no lago escuro atrás das barracas", "no galpão das lonas", "no labirinto de espelhos", "na barraca do tiro ao alvo",
  "no camarim dos artistas", "na casa do dono do circo", "na mata fechada que cerca o terreno", "no túnel do trem fantasma", "na bilheteria e no estacionamento",
];
const COMPLICACOES = [
  "Os sinos tocam no meio da cena: todos fazem Vontade DT {dt} ou ficam abalados.", "As luzes se apagam na segunda rodada.", "Começa uma chuva forte: terreno difícil e −5 em Percepção.",
  "Outra equipe do Hexatombe aparece na terceira rodada, sem ninguém saber de que lado está.", "O chão cede em um ponto: Reflexos DT {dt} ou cai 3m.", "Um incêndio começa e se espalha 3m por rodada.",
  "Um civil aparece correndo e grita, atraindo atenção.", "A neblina dá camuflagem a todos que estiverem a mais de 9m.", "A lona começa a se fechar: em 5 rodadas, a saída some.",
  "Uma assombração assiste e interfere em quem estiver perdendo.", "Os relógios param: rituais custam +1 PE nesta cena.", "Nada demais. Por enquanto.",
];
const DT_DO_VD = { 10: 13, 20: 15, 40: 17, 60: 18, 80: 20, 100: 22, 120: 23, 160: 26 };

function tipoReal(t, el) {
  if (t === "EL") return el;
  return t;
}
export function gerarEncontro({ tema = "sorteio", vd = 40, dif = "medio", el = "sorteio" } = {}) {
  vd = Number(vd) || 40; if (!COMP[dif]) dif = "medio";
  const chave = QUEM[tema] ? tema : pick(Object.keys(QUEM));
  const Q = QUEM[chave];
  const elemento = ELS.includes(el) || el === "Medo" ? el : pick(chave === "criaturas" || chave === "assombrado" ? [...ELS, "Medo"] : ELS);
  const grupos = [];
  for (const [papel, qtd] of COMP[dif]) {
    // comuns podem ser dois tipos diferentes; lacaios formam um só bando
    const vezes = papel === "comum" ? qtd : 1;
    const q = papel === "comum" ? 1 : qtd;
    for (let i = 0; i < vezes; i++) {
      const t = tipoReal(pick(Q[papel]), elemento);
      const g = gerarNpc({ tipo: t, vd, papel, el: elemento, traco: papel === "chefe" || (papel === "comum" && chance(0.25)) ? "sortear" : "" });
      // comuns iguais viram um grupo de 2
      const igual = grupos.find((x) => x.papel === papel && x.g._ctx.tipo === t && papel === "comum" && chance(0.5));
      if (igual) { igual.qtd++; continue; }
      grupos.push({ papel, qtd: q, g });
    }
  }
  if (Q.civis) {
    for (let i = 0, n = 1 + Math.floor(Math.random() * 3); i < n; i++) grupos.push({ papel: "civil", qtd: 1, g: gerarNpc({ tipo: "civil", vd: vd >= 40 ? 20 : 10, papel: "comum" }), aliado: true });
  }
  const enc = { tema: chave, temaNome: (TEMAS_ENC.find(([k]) => k === chave) || [, chave])[1], vd, dif, difNome: (DIFICULDADES.find(([k]) => k === dif) || [, dif])[1], el: elemento, grupos };
  cenaEncontro(enc);
  return enc;
}
export function cenaEncontro(enc) {
  const C = CENA[enc.tema] || CENA.criaturas; const dt = DT_DO_VD[enc.vd] || 17;
  const sub = (t) => t.replaceAll("{dt}", dt);
  Object.assign(enc, {
    titulo: pick(C.titulo), local: pick(LOCAIS), situacao: pick(C.situacao), objetivo: pick(C.objetivo),
    complicacao: sub(pick(COMPLICACOES)), semLuta: sub(pick(C.semLuta)), recompensa: sub(pick(C.recompensa)),
    gatilho: pick(["Se os agentes forem vistos, o chefe dá a ordem de ataque.", "Eles só atacam se alguém se aproximar a menos de 9m.", "Atacam assim que veem luz.", "Primeiro falam; atacam se a conversa der errado.", "Atacam de surpresa: Percepção DT " + dt + " para não ficar desprevenido."]),
    fuga: pick(["Fogem quando o chefe cai.", "Fogem quando metade cair.", "Lutam até o fim.", "Os lacaios fogem na primeira baixa; os outros ficam.", "Recuam para o local de onde vieram e chamam reforços."]),
  });
  return enc;
}
/* Sorteia de novo um grupo, mantendo papel, tipo e quantidade */
export function outroGrupo(enc, i) {
  const x = enc.grupos[i]; if (!x) return enc;
  const c = x.g._ctx;
  x.g = gerarNpc({ tipo: c.tipo, vd: c.vd, papel: c.papel, el: c.el || enc.el, traco: c.traco ? "sortear" : "" });
  return enc;
}
export function encontroTexto(enc) {
  const linhas = [
    `${enc.titulo} — ${enc.temaNome}, ${enc.difNome}, VD ${enc.vd}`,
    `Onde: ${enc.local}.`, `O que estão fazendo: ${enc.situacao}.`, `O que querem: ${enc.objetivo}.`,
    `Quando atacam: ${enc.gatilho}`, `Quando fogem: ${enc.fuga}`, `Complicação: ${enc.complicacao}`,
    `Sem luta: ${enc.semLuta}`, `Recompensa: ${enc.recompensa}.`, "",
    ...enc.grupos.map((x) => `${x.qtd > 1 ? `${x.qtd}× ` : ""}${x.g.nome} (${PAPEL_NOME[x.papel]}) — ${x.g.cri.tipo}, Def ${x.g.def}, PV ${x.g.pv}`),
  ];
  return linhas;
}
export const PAPEL_NOME = { chefe: "chefe", comum: "comum", lacaio: "lacaio", civil: "civil para proteger" };
