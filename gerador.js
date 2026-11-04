/* =========================================================
   Gerador de NPCs e criaturas (v3).
   Os números são aproximados: seguem a escala das ameaças do
   Hexatombe e do livro básico (Defesa, PV e testes por VD),
   para improvisar. Cada NPC sai com habilidades sorteadas de
   listas próprias do tipo, atributos e uma pequena história.
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
const DT = { 10: 13, 20: 15, 40: 17, 60: 18, 80: 20, 100: 22, 120: 23, 160: 26 };
const DADO_EL = { 10: "1d4", 20: "1d6", 40: "1d6", 60: "1d8", 80: "1d8", 100: "2d6", 120: "1d10", 160: "2d10" };
export const DANO_HAB = { 10: "2d6", 20: "3d6", 40: "3d8", 60: "4d8", 80: "6d6", 100: "6d8", 120: "8d8", 160: "10d8" };
export const CURA = { 10: "1d8", 20: "2d8", 40: "3d8", 60: "4d8", 80: "5d8", 100: "6d8", 120: "7d8", 160: "9d8" };

export const TIPOS = [
  ["humano", "Pessoa armada"], ["civil", "Civil / testemunha"], ["cultista", "Cultista"], ["circo", "Artista do circo"],
  ["agente", "Agente rival / caçador do oculto"], ["possuido", "Pessoa tomada pelo Outro Lado"], ["assombracao", "Assombração"], ["animal", "Animal"],
  ["Sangue", "Criatura de Sangue"], ["Morte", "Criatura de Morte"], ["Conhecimento", "Criatura de Conhecimento"], ["Energia", "Criatura de Energia"], ["Medo", "Criatura de Medo"],
];
export const PAPEIS = [["lacaio", "Lacaio (fraco, em bando)"], ["comum", "Comum"], ["chefe", "Chefe"]];
const PESSOAS = ["humano", "civil", "cultista", "circo", "agente", "possuido"];
const ELEMENTOS = ["Sangue", "Morte", "Conhecimento", "Energia"];
const FRACO = { Sangue: "Morte", Morte: "Energia", Energia: "Conhecimento", Conhecimento: "Sangue", Medo: "" };

export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export function sortear(a, n) { const c = [...a]; const out = []; while (c.length && out.length < n) out.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]); return out; }
export const chance = (p) => Math.random() < p;

/* ---------- Nomes ---------- */
const NOMES = {
  m: ["Adalberto", "Clóvis", "Everaldo", "Juvenal", "Lindomar", "Raimundo", "Wanderley", "Bruno", "Diego", "Fábio", "Hugo", "João", "Lucas", "Nilo", "Paulo", "Rafael", "Túlio", "Vítor", "Zeca", "Caetano", "Ernesto", "Irineu", "Aurélio", "Dirceu", "Gerson", "Jairo", "Moacir", "Osvaldo", "Sebastião", "Valdemar", "Benedito"],
  f: ["Aparecida", "Celeste", "Doralice", "Francisca", "Leonor", "Marlene", "Socorro", "Ana", "Carla", "Elisa", "Glória", "Iara", "Kátia", "Marta", "Olga", "Sônia", "Wanda", "Benedita", "Dalva", "Jussara", "Mirela", "Odete", "Cida", "Edite", "Heloísa", "Ivone", "Lurdes", "Neusa", "Quitéria", "Rosângela", "Tereza", "Zuleide"],
};
const gen = (ctx, m, f) => (ctx.g === "f" ? f : m);
const SOBRENOMES = ["Silva", "Souza", "Pereira", "Costa", "Nogueira", "Barros", "Ferraz", "Rocha", "Moraes", "Prado", "Siqueira", "Fonseca", "Lacerda", "Albuquerque", "Bittencourt", "Cardoso", "Damasceno", "Esteves", "Galvão", "Mendonça", "Queiroz", "Teixeira", "Vasconcelos", "Aragão", "Brandão", "Coutinho", "Falcão", "Medeiros", "Paiva", "Sampaio", "Tavares"];
const APELIDOS = ["Dente-de-Ouro", "Tição", "Ferrugem", "Mão-Leve", "Corvo", "Baixinho", "Cicatriz", "Doutor", "Vela", "Coruja", "Fumaça", "Navalha", "Padre", "Sorriso", "Bigode", "Fantasma", "Gaguinho", "Pólvora", "Sete-Dedos", "Tamanduá", "Vaga-Lume"];
const LUGARES = ["da Lona Rasgada", "do Picadeiro", "do Poço Seco", "da Estrada Velha", "da Mata Fechada", "do Necrotério", "do Trem Parado", "das Jaulas", "do Lago Escuro", "da Capela", "do Galpão", "da Roda-Gigante", "do Porão", "da Rodovia"];
export function nomePessoa(g) {
  const pn = pick(NOMES[g] || NOMES.m); const sn = pick(SOBRENOMES);
  return chance(0.3) ? `${pn} “${pick(APELIDOS)}” ${sn}` : `${pn} ${sn}`;
}

/* ---------- Atributos ---------- */
function atributos(vd, foco) {
  const base = Math.min(4, 1 + Math.floor(vd / 50));
  const a = { AGI: base, FOR: base, INT: Math.max(0, base - 1), PRE: base, VIG: base };
  for (const [k, d] of Object.entries(foco || {})) a[k] = Math.max(0, Math.min(6, a[k] + d));
  if (chance(0.5)) { const k = pick(Object.keys(a)); a[k] = Math.min(6, a[k] + 1); }
  return Object.entries(a).map(([k, v]) => `${k} ${v}`).join(" · ");
}

/* ---------- Habilidades ----------
   Cada uma: [nome, ação, texto]. No texto: {dt} vira a DT, {d} o dado elemental,
   {h} o dano de habilidade e {c} a cura, todos pela escala do VD. */
export const H = {
  humano: [
    ["Cobertura", "passiva", "+5 na Defesa enquanto estiver atrás de cobertura."],
    ["Tiro certeiro", "1×/cena", "Soma +{d} ao dano de um ataque à distância."],
    ["Fogo de supressão", "padrão", "Escolhe uma área de 3m: quem estiver nela faz Reflexos DT {dt} ou fica desprevenido e não pode se mover até o fim do próximo turno."],
    ["Recarga rápida", "passiva", "Recarrega a arma como ação livre."],
    ["Ataque em dupla", "passiva", "+2 no ataque se um aliado estiver adjacente ao alvo."],
    ["Granada de fumaça", "1×/cena", "Cria uma nuvem de 6m de raio que dá camuflagem total por 2 rodadas."],
    ["Algemas", "padrão", "Contra um alvo agarrado ou caído: Reflexos DT {dt} ou fica imóvel até gastar uma ação completa para se soltar."],
    ["Pedir reforço", "1×/cena", "Grita no rádio: chegam 1d4 lacaios no início da próxima rodada."],
    ["Tiro na perna", "padrão", "Ataque com −5: se acertar, o alvo fica lento até o fim da cena."],
    ["Treinado para isso", "passiva", "Não fica abalado nem apavorado por presença perturbadora de VD até {vd}."],
    ["Colete à prova de balas", "passiva", "RD 5 contra balístico."],
    ["Lanterna no rosto", "movimento", "Cega um alvo em alcance curto até o início do próximo turno (Reflexos DT {dt} evita)."],
    ["Atirar e correr", "passiva", "Pode se mover depois de atacar à distância sem sofrer ataques de oportunidade."],
    ["Refém", "padrão", "Agarra alguém adjacente e o usa de escudo: ataques contra ele têm 50% de chance de acertar o refém."],
  ],
  civil: [
    ["Grito de socorro", "livre", "Todos num raio de 30m ouvem; quem estiver por perto vem ver o que houve."],
    ["Implorar", "reação", "Ao ser atacado, Diplomacia contra a Vontade do agressor: se vencer, o ataque é desviado ou não acontece."],
    ["Conhece o lugar", "passiva", "+5 em testes para se esconder ou fugir no local onde vive ou trabalha."],
    ["Pânico", "passiva", "Ao ver algo paranormal, Vontade DT {dt}: se falhar, foge e não ajuda ninguém por 1d4 rodadas."],
    ["Testemunha-chave", "—", "Viu algo importante; só conta depois de convencido (Diplomacia DT {dt}) ou de ser salvo."],
    ["Primeiros socorros", "padrão", "Estabiliza alguém que esteja morrendo; o alvo recupera 1d4 PV."],
    ["Arma improvisada", "passiva", "Pega o que estiver por perto: faca de cozinha, extintor, cadeira (dano 1d6 impacto ou corte)."],
    ["Sabe de uma passagem", "—", "Conhece um atalho, porão ou saída que não aparece no mapa."],
    ["Coragem de última hora", "1×/cena", "Quando um agente cai perto dele, para de fugir e ajuda: arrasta, distrai ou estabiliza."],
    ["Mentira nervosa", "passiva", "Mente mal: Intuição DT {dt} percebe que está escondendo algo."],
  ],
  cultista: [
    ["Fanatismo", "passiva", "Imune a ficar abalado ou apavorado."],
    ["Sacrifício de sangue", "reação", "Ao ficar morrendo, faz um último corte: um aliado em alcance curto recupera {c} PV ou ganha +2 nos testes até o fim da cena."],
    ["Cântico", "movimento", "Enquanto cantar, cultistas aliados em alcance curto recebem +2 em ataques e na DT dos rituais."],
    ["Marca do Outro Lado", "passiva", "Tem um sigilo gravado na pele: rituais contra ele exigem teste de Ocultismo DT {dt} ou falham."],
    ["Oferenda", "completa", "Corta a própria mão e gasta 1d6 PV para conjurar um ritual sem gastar ação no próximo turno."],
    ["Olhos vazios", "1×/cena", "Encara um alvo: Vontade DT {dt} ou perde 1d6 de Sanidade e fica pasmo por 1 rodada."],
    ["Lâmina consagrada", "passiva", "Ataques corpo a corpo causam +{d} do elemento do culto."],
    ["Seguidores", "1×/cena", "Grita uma ordem: 1d4 lacaios fanáticos aparecem das sombras."],
    ["Último segredo", "reação", "Ao morrer, o corpo se desfaz em cinzas e símbolos; quem examinar acha uma pista do culto (Investigação DT {dt})."],
    ["Círculo de proteção", "completa", "Desenha um círculo de 3m: aliados dentro dele recebem RD 5 contra o elemento oposto ao do culto até o fim da cena."],
    ["Vozes em coro", "padrão", "Todos os agentes em alcance curto fazem Vontade DT {dt} ou perdem 1d4 de Sanidade."],
    ["Sangue no altar", "reação", "Quando um aliado morre em alcance curto, recebe +2 na DT do próximo ritual."],
  ],
  circo: [
    ["Facas de arremesso", "padrão", "Dois ataques à distância contra alvos diferentes em alcance curto."],
    ["Contorcionismo", "reação", "Ao ser agarrado ou preso, escapa automaticamente uma vez por cena."],
    ["Truque de mágica", "movimento", "Desaparece numa nuvem de fumaça colorida e reaparece até 9m dali, com camuflagem até o próximo turno."],
    ["Força de picadeiro", "padrão", "Ergue e arremessa um alvo Médio: {h} de impacto e ele fica caído (Fortitude DT {dt} evita a queda)."],
    ["Domador", "movimento", "Um animal ou criatura aliada em alcance curto age imediatamente."],
    ["Risada contagiante", "padrão", "Quem ouvir faz Vontade DT {dt} ou fica frustrado até o fim da cena, rindo sem querer."],
    ["Respeitável público", "1×/cena", "Chama a atenção de todos: até o próximo turno, ataques contra outros alvos sofrem −1 dado."],
    ["Corda bamba", "passiva", "Não fica desprevenido em superfícies estreitas e se move por cordas, mastros e vigas sem teste."],
    ["Fogo do engolidor", "padrão", "Cone de 4,5m: {h} de fogo (Reflexos DT {dt} reduz à metade) e o alvo pode ficar em chamas."],
    ["Nariz vermelho", "passiva", "Sempre sorri. Quem o vê ferido pela primeira vez faz Vontade DT {dt} ou fica abalado."],
    ["Trapézio", "movimento", "Balança de um ponto alto a outro até 15m, sem pisar no chão; ataques de quem está no chão sofrem −2 contra ele neste turno."],
    ["Cartola sem fundo", "1×/cena", "Tira da cartola algo útil para a cena: uma chave, uma corda, um coelho que distrai, uma pomba que voa até um aliado."],
    ["Ilusão de espelhos", "reação", "Ao ser alvo de um ataque, o atacante rola 1d6: com 1–3, acerta um reflexo."],
  ],
  animal: [
    ["Faro", "passiva", "+5 em Percepção para rastrear; não sofre penalidade por escuridão para achar presas."],
    ["Investida", "padrão", "Se mover 6m em linha reta antes de atacar, +1 dado de dano e o alvo faz Fortitude DT {dt} ou cai."],
    ["Matilha", "passiva", "+2 no ataque por aliado adjacente ao alvo."],
    ["Agarrar", "livre", "Ao acertar a mordida, pode agarrar o alvo."],
    ["Pele grossa", "passiva", "RD 2 contra corte e impacto."],
    ["Fuga", "reação", "Abaixo de um quarto dos PV, foge com o dobro do deslocamento."],
    ["Uivo", "1×/cena", "Animais aliados em alcance médio recebem +1 dado no próximo ataque."],
    ["Emboscada", "passiva", "Na primeira rodada, se não foi percebido, o primeiro ataque causa +{d} de dano."],
    ["Derrubar", "livre", "Ao acertar, o alvo faz Fortitude DT {dt} ou fica caído."],
    ["Veneno", "passiva", "Quem sofrer a mordida faz Fortitude DT {dt} ou fica envenenado (1d6 por rodada, até passar no teste)."],
    ["Sentido do Outro Lado", "passiva", "Fica agitado perto de criaturas paranormais: os agentes podem usá-lo como alarme se o domarem."],
  ],
  Sangue: [
    ["Frenesi", "passiva", "Abaixo da metade dos PV, +1 dado nos ataques e −2 na Defesa."],
    ["Banquete", "reação", "Ao deixar um alvo morrendo, recupera PV iguais ao dano do golpe."],
    ["Regeneração carnal", "passiva", "Recupera {d} PV no início de cada turno, exceto se sofreu dano de Morte desde o último turno."],
    ["Sangue fervente", "reação", "Quem a acertar corpo a corpo sofre {d} de Sangue."],
    ["Carne que se abre", "padrão", "A pele rasga em bocas: todos adjacentes sofrem {h} de Sangue (Reflexos DT {dt} reduz à metade)."],
    ["Fome de vínculo", "1×/cena", "Escolhe quem mais ama algo na mesa: Vontade DT {dt} ou ataca o aliado mais próximo no próximo turno."],
    ["Coágulo", "movimento", "Cospe sangue espesso numa área de 3m: terreno difícil e quem estiver nela fica enredado (Reflexos DT {dt} evita)."],
    ["Dor compartilhada", "passiva", "Quando sofre dano, o agente mais próximo sofre 1d4 de dano mental."],
    ["Abraço de carne", "padrão", "Agarra e espreme: {h} de impacto e o alvo fica agarrado (Fortitude DT {dt} reduz à metade e evita agarrar)."],
    ["Cheiro de sangue", "passiva", "Sabe onde está qualquer criatura ferida em alcance longo."],
  ],
  Morte: [
    ["Lodo", "passiva", "Alvo atingido fica lento por 1 rodada (Fortitude DT {dt} evita)."],
    ["Tempo roubado", "1×/cena", "Age de novo logo após o próprio turno."],
    ["Envelhecer", "padrão", "Toque: o alvo envelhece anos em segundos, sofre {h} de Morte e fica fraco até o fim da cena (Fortitude DT {dt} reduz à metade e evita)."],
    ["Espiral", "movimento", "Cria uma espiral no chão de 6m: quem entrar faz Vontade DT {dt} ou perde a próxima ação."],
    ["Já estava morto", "reação", "A primeira vez que chegaria a 0 PV, fica com 1 PV e se desfaz em lodo, reaparecendo adjacente."],
    ["Putrefação", "passiva", "Itens orgânicos e comida em alcance curto apodrecem; curas com remédios recuperam metade."],
    ["Relógio parado", "1×/cena", "Até o fim da rodada, ninguém em alcance médio recupera PV."],
    ["Cinzas", "padrão", "Sopro de cinzas em cone de 6m: {h} de Morte e cego por 1 rodada (Reflexos DT {dt} reduz à metade e evita)."],
    ["Pele de lodo", "passiva", "Ataques corpo a corpo contra ela deixam a arma grudada: Força DT {dt} para soltar."],
    ["Hora marcada", "1×/cena", "Escolhe um alvo e conta 3 rodadas: no fim, ele sofre {h} de Morte se não estiver fora de alcance longo."],
  ],
  Conhecimento: [
    ["Sigilos", "passiva", "Alvo atingido faz Vontade DT {dt} ou fica esmorecido até o fim da cena."],
    ["Leitura", "passiva", "Sabe o próximo passo dos agentes: o primeiro ataque contra ela na cena sofre −1 dado."],
    ["Apagar memória", "padrão", "Um alvo em alcance curto esquece a última rodada (Vontade DT {dt}): perde a ação de movimento e qualquer preparação."],
    ["Palavra proibida", "padrão", "Sussurra um nome que não deveria existir: todos em alcance curto sofrem {h} mental (Vontade DT {dt} reduz à metade)."],
    ["Biblioteca de carne", "passiva", "Sabe tudo o que suas vítimas sabiam; pode falar com a voz delas."],
    ["Olho dourado", "reação", "Ao ser alvo de um ritual, faz Ocultismo contra a DT: se vencer, devolve o ritual para quem conjurou."],
    ["Enigma", "1×/cena", "Propõe uma charada. Quem errar (Intelecto DT {dt}) fica pasmo por 1 rodada; quem acertar ganha +1 dado contra ela."],
    ["Escrita na pele", "padrão", "Marca um alvo com um sigilo: até o fim da cena, ele sofre −2 em todos os testes e a criatura sabe onde ele está."],
    ["Pergunta", "reação", "Quando um agente fala com ela, faz uma pergunta. Se ele mentir, sofre {d} mental; se disser a verdade, ela ganha +2 no próximo ataque."],
    ["Página arrancada", "padrão", "Rouba uma perícia treinada de um alvo até o fim da cena (Vontade DT {dt} evita)."],
  ],
  Energia: [
    ["Instável", "passiva", "No início do turno, role 1d6; com 5 ou 6, teleporta-se até 9m."],
    ["Sobrecarga", "passiva", "Ao sofrer dano de Energia, cura metade em vez de sofrer."],
    ["Pane", "padrão", "Aparelhos eletrônicos e armas de fogo em alcance médio falham até o fim do próximo turno (Tecnologia DT {dt} evita para cada item)."],
    ["Descarga em cadeia", "padrão", "{h} de Energia num alvo e metade em até dois outros adjacentes a ele (Reflexos DT {dt} reduz à metade)."],
    ["Glitch", "reação", "Ao ser acertada, role 1d6: com 4 ou mais, o ataque a atravessa sem efeito."],
    ["Caos", "1×/cena", "Cada agente em alcance curto role 1d6: 1–2 fica atordoado 1 rodada, 3–4 recupera 1d6 PV, 5–6 é empurrado 6m."],
    ["Corpo de estática", "passiva", "Quem a tocar ou agarrar sofre {d} de Energia."],
    ["Faísca viva", "movimento", "Divide-se por um instante: até o próximo turno, ataques contra ela têm 50% de chance de errar."],
    ["Apagão", "1×/cena", "Todas as luzes em alcance longo se apagam até alguém religar (Tecnologia DT {dt})."],
    ["Música alta", "padrão", "Um rádio ou caixa de som explode em ruído: quem estiver em alcance curto faz Fortitude DT {dt} ou fica surdo e desprevenido 1 rodada."],
  ],
  Medo: [
    ["Impossível", "passiva", "Ataques contra ela sofrem −1 dado na primeira rodada."],
    ["Presença absoluta", "passiva", "Quem a vê pela primeira vez faz Vontade DT {dt} ou fica apavorado por 1 rodada."],
    ["Lacuna", "movimento", "Some e reaparece em qualquer ponto que nenhum agente esteja olhando."],
    ["Pesadelo real", "padrão", "Um alvo vê seu maior medo: {h} mental (Vontade DT {dt} reduz à metade) e fica abalado."],
    ["Não está aqui", "reação", "Uma vez por rodada, um ataque contra ela erra se o atacante não passar em Vontade DT {dt}."],
    ["Silêncio", "1×/cena", "Por 1 rodada, ninguém em alcance médio consegue falar nem conjurar rituais."],
    ["Fome do medo", "passiva", "Recupera {d} PV sempre que um agente perde Sanidade em alcance médio."],
    ["Rosto conhecido", "padrão", "Assume o rosto de alguém que um agente ama: ele faz Vontade DT {dt} ou não consegue atacá-la nesta rodada."],
    ["Atrás de você", "reação", "Quando um agente fica sozinho, aparece adjacente a ele e faz um ataque."],
  ],
  agente: [
    ["Treinamento da Ordem", "passiva", "Não fica abalado com presença perturbadora e soma +2 em Vontade."],
    ["Munição amaldiçoada", "passiva", "Os tiros causam +{d} de {el}."],
    ["Ritual aprendido", "padrão", "Conjura um ritual de {el}: {h} num alvo em alcance médio (Vontade DT {dt} reduz à metade). Perde 1d4 de Sanidade."],
    ["Kit de investigação", "—", "Sempre tem lanterna UV, luvas e sacos de evidência; +5 para achar pistas."],
    ["Interrogatório", "completa", "Intimidação contra a Vontade de um prisioneiro: se vencer, ele conta o que sabe."],
    ["Plano B", "1×/cena", "Quando as coisas dão errado, revela uma saída preparada: granada de fumaça, carro ligado, porta destrancada."],
    ["Olhar treinado", "passiva", "+5 em Intuição; percebe disfarces e possessões em quem examinar por 1 rodada."],
    ["Componentes", "livre", "Gasta um componente ritualístico para somar +5 na DT de um ritual."],
    ["Fuga calculada", "reação", "Abaixo da metade dos PV, recua até 9m sem sofrer ataques de oportunidade."],
    ["Selo de contenção", "completa", "Prende uma criatura de VD até {vd} num círculo de sigilos por 1d4 rodadas (Vontade da criatura contra DT {dt})."],
  ],
  assombracao: [
    ["Incorpórea", "passiva", "Atravessa paredes e objetos. Só sofre metade do dano que não seja paranormal."],
    ["Reviver a morte", "padrão", "Um alvo em alcance curto sente como ela morreu: {h} mental (Vontade DT {dt} reduz à metade)."],
    ["Frio da cova", "passiva", "Quem começar o turno adjacente a ela sofre {d} de frio."],
    ["Poltergeist", "padrão", "Arremessa objetos do lugar contra até dois alvos: {h} de impacto dividido entre eles (Reflexos DT {dt} reduz à metade)."],
    ["Possessão", "1×/cena", "Entra no corpo de alguém adjacente (Vontade DT {dt}): controla as ações dele por 1 rodada."],
    ["Grito do fim", "1×/cena", "Grita como no dia em que morreu: todos em alcance médio fazem Vontade DT {dt} ou ficam apavorados por 1 rodada."],
    ["Presa ao lugar", "passiva", "Não sai do local onde morreu; quem a atrai para longe dali a enfraquece (−5 na Defesa)."],
    ["Some e volta", "movimento", "Desaparece e reaparece em qualquer ponto do lugar onde morreu."],
    ["Mensagem", "livre", "Escreve no vapor, na poeira ou no sangue uma palavra que é uma pista (ou uma ameaça)."],
  ],
};
const CHEFE = [
  ["Ação de chefe", "passiva", "Age duas vezes por rodada (some 10 à iniciativa para a segunda ação)."],
  ["Recusa a cair", "1×/cena", "Ao chegar a 0 PV, volta com {c} PV e fica imune a condições por 1 rodada."],
  ["Comando", "livre", "Uma vez por rodada, um aliado em alcance médio faz um ataque ou se move como reação."],
  ["Segunda forma", "—", "Ao ficar abaixo de um quarto dos PV, se transforma: +2 na Defesa, +1 dado nos ataques e um novo golpe ({h})."],
  ["Lendário", "3×/cena", "No fim do turno de um agente, faz um ataque ou se move até metade do deslocamento."],
];
const LACAIO = ["Lacaio", "passiva", "Cai ao sofrer qualquer dano que passe da metade dos PV de uma vez."];

export function habTxt([n, a, t], ctx) {
  const txt = t.replaceAll("{dt}", ctx.dt).replaceAll("{d}", ctx.d).replaceAll("{h}", ctx.h).replaceAll("{c}", ctx.c).replaceAll("{vd}", ctx.vd).replaceAll("{el}", ctx.el || "Sangue");
  return `${n}${a && a !== "—" ? ` (${a})` : ""}: ${txt}`;
}
function sortearHabs(ctx) {
  const pool = H[ctx.base] || H.humano;
  const n = ctx.papel === "lacaio" ? 1 : ctx.papel === "chefe" ? 3 : 2;
  let hs = sortear(pool, n);
  // artista do circo: o número dele sempre entra
  const ass = ctx.assinatura && pool.find(([nm]) => nm === ctx.assinatura);
  if (ass) hs = [ass, ...sortear(pool.filter((h) => h !== ass), n - 1)];
  // pessoa tomada pelo Outro Lado: uma habilidade humana e as outras do elemento
  if (ctx.tipo === "possuido") hs = [...sortear(H.humano, 1), ...sortear(H[ctx.el], n)];
  const out = hs.map((h) => habTxt(h, ctx));
  if (ctx.papel === "chefe") out.push(habTxt(pick(CHEFE), ctx));
  if (ctx.papel === "lacaio") out.push(habTxt(LACAIO, ctx));
  return out;
}

/* ---------- História ---------- */
export const L = {
  humano: {
    quem: [["Policial militar", "Policial militar", "Pistola"], ["Segurança particular", "Segurança particular", "Revólver"], ["Caçador da região", "Caçadora da região", "Fuzil de caça"], ["Mercenário contratado", "Mercenária contratada", "Submetralhadora"], ["Capanga de fazendeiro", "Capanga de fazendeiro", "Escopeta"], ["Investigador de uma organização rival", "Investigadora de uma organização rival", "Pistola"], ["Ex-agente que abandonou a Ordem", "Ex-agente que abandonou a Ordem", "Pistola"], ["Contrabandista", "Contrabandista", "Revólver"]],
    aparencia: ["colete surrado e botas enlameadas", "óculos escuros mesmo à noite", "uma cicatriz que atravessa a boca", "terno barato com manchas de graxa", "boné de time e um crucifixo no pescoço", "tatuagem de cadeia nos dedos", "farda impecável demais para o lugar", "mãos trêmulas e cheiro de cachaça"],
    quer: ["receber o pagamento e sumir antes do amanhecer", "provar para o chefe que é confiável", "proteger a família que mora ali perto", "encobrir o que viu na semana passada", "vingar um parceiro que sumiu no circo", "pegar o que os agentes estão procurando antes deles", "esquecer o barulho que ouve toda noite"],
    segredo: ["foi pago pelo culto, mas não sabe quem eles são de verdade", "tem um bilhete com um símbolo estranho no bolso", "já viu uma criatura e ninguém acreditou", "está sendo marcado: um sigilo aparece na pele dele há dias", "sabe onde fica a entrada do porão", "o chefe dele morreu, e ele ainda recebe ordens pelo rádio"],
    fala: ["“Isso aqui não é lugar pra curioso.”", "“Eu só faço o meu trabalho, tá?”", "“Mais um passo e eu atiro. Juro por Deus.”", "“Vocês também ouviram isso?”", "“Ninguém me pagou pra isso. Ninguém.”"],
    tatica: ["Procura cobertura e atira em quem estiver mais exposto.", "Ataca em dupla e tenta cercar quem estiver sozinho.", "Começa ameaçando; só atira se for encurralado.", "Mira primeiro em quem parece liderar o grupo."],
    ferido: ["Larga a arma e implora.", "Foge e volta mais tarde com reforços.", "Luta até o fim por medo de quem o contratou.", "Se rende e oferece informação em troca da vida."],
    saque: ["carteira com uma foto antiga e R$ 80", "rádio comunicador ainda chiando", "chave de um galpão", "munição e um mapa rabiscado", "um ingresso do circo de 1993"],
  },
  civil: {
    quem: [["Vendedor de pipoca", "Vendedora de pipoca"], ["Motorista de caminhão", "Motorista de caminhão"], ["Morador da vila", "Moradora da vila"], ["Zelador do lugar", "Zeladora do lugar"], ["Criança perdida", "Criança perdida"], ["Enfermeiro de plantão", "Enfermeira de plantão"], ["Padre da capela", "Beata da capela"], ["Turista que entrou no lugar errado", "Turista que entrou no lugar errado"], ["Dono da lanchonete da estrada", "Dona da lanchonete da estrada"]],
    aparencia: ["avental sujo de óleo", "roupa de domingo amarrotada", "olhos inchados de chorar", "chinelo e lanterna fraca", "terço enrolado na mão", "jaqueta grande demais"],
    quer: ["voltar para casa", "encontrar alguém que sumiu", "não se envolver em nada", "contar o que viu para alguém que acredite", "vender alguma coisa aos agentes", "esconder um erro que cometeu"],
    segredo: ["deixou alguém entrar onde não devia", "recebe visitas à noite de alguém que já morreu", "guarda um objeto amaldiçoado sem saber", "é parente de um cultista", "viu o rosto do responsável"],
    fala: ["“Eu não vi nada… quer dizer, vi.”", "“Por favor, me tira daqui.”", "“Vocês são da polícia?”", "“Ele voltou. Eu sei que voltou.”", "“Isso acontece todo ano nessa época.”"],
    tatica: ["Corre e se esconde.", "Fica paralisado de medo.", "Tenta ajudar e atrapalha.", "Grita por socorro sem parar."],
    ferido: ["Desmaia.", "Implora pelos filhos.", "Corre para o lugar mais perigoso possível."],
    saque: ["uma chave sem etiqueta", "um caderno de anotações", "remédios controlados", "uma foto de alguém desaparecido"],
  },
  cultista: {
    quem: [["Irmão da Seita do Picadeiro", "Irmã da Seita do Picadeiro"], ["Discípulo da Lona Escarlate", "Discípula da Lona Escarlate"], ["Devoto do Relógio Parado", "Devota do Relógio Parado"], ["Escriba dos Sigilos Dourados", "Escriba dos Sigilos Dourados"], ["Filho da Estática", "Filha da Estática"], ["Iniciado da Ordem das Máscaras", "Iniciada da Ordem das Máscaras"]],
    aparencia: ["manto vermelho remendado com lona de circo", "rosto pintado de palhaço, borrado de lágrimas", "máscara de porcelana rachada", "braços cobertos de sigilos cicatrizados", "olhos pintados de dourado", "pés descalços e unhas pretas"],
    quer: ["completar o ritual antes da última noite", "entregar um sacrifício ao Outro Lado", "ser escolhido para receber um desejo", "trazer de volta alguém que perdeu", "provar a fé diante do líder", "fugir do culto, mas tem medo"],
    segredo: ["entrou para o culto há poucos meses e ainda tem família lá fora", "sabe o nome verdadeiro da entidade", "está marcado para ser o próximo sacrifício", "anotou o ritual inteiro num caderno escondido", "duvida do líder e pode virar informante"],
    fala: ["“O picadeiro está faminto.”", "“A lona vai se fechar sobre todos vocês.”", "“Ele me prometeu. Ele PROMETEU.”", "“Vocês chegaram tarde. Sempre chegam tarde.”", "“Sangue pela lona, lona pelo sangue.”"],
    tatica: ["Fica atrás dos outros e conjura rituais.", "Se joga em combate sem medo da morte.", "Protege o altar acima de tudo.", "Tenta capturar alguém vivo para o ritual."],
    ferido: ["Se sacrifica para fortalecer o ritual.", "Ri e cita escrituras até morrer.", "Foge para avisar o líder.", "Se arrepende e implora por ajuda."],
    saque: ["adaga ritual com o cabo gasto", "pergaminho com metade de um ritual", "frasco de sangue coagulado", "chave do baú do líder", "componentes ritualísticos (1 uso)"],
  },
  circo: {
    quem: [["Atirador de facas", "Atiradora de facas", "Facas", "Facas de arremesso"], ["Palhaço", "Palhaça", "Martelo de borracha… com pregos", "Nariz vermelho"], ["Contorcionista", "Contorcionista", "Arame", "Contorcionismo"], ["Domador de feras", "Domadora de feras", "Chicote", "Domador"], ["Mágico decadente", "Mágica decadente", "Bengala", "Truque de mágica"], ["Homem mais forte do mundo", "Mulher mais forte do mundo", "Halteres", "Força de picadeiro"], ["Engolidor de fogo", "Engolidora de fogo", "Tocha", "Fogo do engolidor"], ["Equilibrista", "Equilibrista", "Sombrinha de ferro", "Corda bamba"], ["Apresentador do picadeiro", "Apresentadora do picadeiro", "Bengala de prata", "Respeitável público"]],
    aparencia: ["figurino de lantejoulas apagadas", "maquiagem que não sai mais da pele", "sorriso costurado nos cantos", "cartola amassada e luvas brancas sujas", "colã rasgado e muitos hematomas", "nariz vermelho de borracha derretida"],
    quer: ["fazer a última apresentação", "ser aplaudido mais uma vez", "sair do circo, mas a lona não deixa", "proteger os outros artistas", "servir ao dono do circo para sempre", "encontrar o filho que fugiu com a trupe rival"],
    segredo: ["morreu em 1993 e não sabe", "conhece o caminho para fora da lona", "foi quem acendeu o incêndio", "vê o futuro nas cartas, mas sempre erra o final", "é a única pessoa viva da trupe original"],
    fala: ["“Respeitável público!”", "“Riam. RIAM!”", "“O show não pode parar. Ele não deixa.”", "“Vocês compraram ingresso? Todos compraram.”", "“Mais um número e eu descanso.”"],
    tatica: ["Faz do combate um espetáculo: sempre busca o alvo que a plateia veria.", "Ataca de cima: vigas, cordas e trapézios.", "Usa truques para separar o grupo.", "Luta sorrindo, mesmo quando sangra."],
    ferido: ["Faz uma reverência e cai.", "Pede um último aplauso.", "Some numa nuvem de fumaça.", "Chama os outros artistas para o picadeiro."],
    saque: ["ingressos amarelados com datas impossíveis", "baralho marcado", "chave da jaula dos leões", "um nariz vermelho que ainda está quente", "fotografia da trupe com um rosto riscado"],
  },
  agente: {
    quem: [["Agente de uma organização rival", "Agente de uma organização rival", "Pistola"], ["Caçador de recompensas do oculto", "Caçadora de recompensas do oculto", "Escopeta"], ["Investigador particular do paranormal", "Investigadora particular do paranormal", "Revólver"], ["Agente da Ordem infiltrado", "Agente da Ordem infiltrada", "Pistola"], ["Ex-agente da Ordem que virou mercenário", "Ex-agente da Ordem que virou mercenária", "Submetralhadora"], ["Ocultista independente", "Ocultista independente", "Adaga ritual"], ["Repórter que investiga o circo", "Repórter que investiga o circo", "Revólver"]],
    aparencia: ["sobretudo cheio de bolsos e cheiro de vela", "luvas de couro e um caderno de capa preta", "óculos remendados com fita", "um colar de chaves antigas", "terno escuro e um distintivo sem nome", "mochila de acampamento com sigilos pintados à mão"],
    quer: ["chegar ao centro do ritual antes dos agentes", "recuperar um item paranormal para quem o contratou", "provar que a Ordem está errada sobre o circo", "salvar alguém que está preso na lona", "registrar tudo para uma reportagem que ninguém vai publicar", "destruir o culto, custe o que custar"],
    segredo: ["trabalha para o culto sem saber", "já matou um agente da Ordem", "tem um diário com o mapa da lona", "está perdendo a Sanidade e esconde isso", "é parente do dono do circo", "foi expulso da Ordem por usar rituais proibidos"],
    fala: ["“Vocês ainda acham que a Ordem tem as respostas?”", "“Eu cheguei primeiro. A pista é minha.”", "“Posso ajudar. Por um preço.”", "“Não toquem nisso. Sério.”", "“Já vi coisa pior. Acho.”"],
    tatica: ["Evita confronto direto e usa rituais de longe.", "Atira primeiro, pergunta depois.", "Tenta negociar e só luta se for traído.", "Prepara o terreno com armadilhas e espera."],
    ferido: ["Propõe uma trégua com informação valiosa.", "Usa o Plano B e some.", "Fica desesperado e usa um ritual perigoso demais.", "Se rende, mas guarda uma carta na manga."],
    saque: ["diário com anotações sobre o circo", "componentes ritualísticos (2 usos)", "munição amaldiçoada (1 pente)", "um mapa da lona com rotas marcadas", "uma foto de um agente da Ordem com um X vermelho"],
  },
  assombracao: {
    quem: [["Trapezista", "Trapezista"], ["Palhaço da trupe original", "Palhaça da trupe original"], ["Espectador da última noite", "Espectadora da última noite"], ["Bilheteiro", "Bilheteira"], ["Domador devorado pelas feras", "Domadora devorada pelas feras"], ["Agente da Ordem que morreu no circo", "Agente da Ordem que morreu no circo"], ["Cultista sacrificado", "Cultista sacrificada"], ["Dono do circo", "Dona do circo"]],
    morte: ["no incêndio de 1993, preso atrás da lona", "numa queda do trapézio sem rede", "afogado no lago atrás das jaulas", "num sacrifício do culto, sem entender por quê", "durante um Hexatombe anterior", "de fome, trancado num vagão do trem"],
    prende: ["um objeto que perdeu: um anel, um nariz vermelho, uma foto", "a última apresentação, que nunca terminou", "o nome de quem o matou, que ninguém sabe", "uma promessa que fez a alguém da família", "o corpo, que nunca foi enterrado", "o próprio medo de seguir em frente"],
    fala: ["“Vocês também não conseguem sair?”", "“Ainda falta o último número.”", "“Está tão frio aqui…”", "“Quem trancou a porta? QUEM TRANCOU?”", "“Eu conheço vocês. Vocês já morreram aqui.”"],
    tatica: ["Assusta primeiro; só ataca quem mexe no que é dela.", "Possui o agente mais fraco e o faz atacar os outros.", "Apaga as luzes e ataca no escuro.", "Repete a própria morte e arrasta os agentes junto."],
    ferido: ["Some e volta mais forte na próxima noite.", "Implora para que terminem o que a prende.", "Grita, e todas as luzes do lugar estouram.", "Se acalma e aponta uma pista."],
  },
  animal: {
    aparencia: ["pelagem falhada e olhos turvos", "costelas aparentes de fome", "cicatrizes de corrente no pescoço", "dentes manchados de vermelho", "comportamento estranhamente silencioso"],
    quer: ["proteger os filhotes", "comer", "defender o território", "fugir do que está na mata"],
    segredo: ["fugiu das jaulas do circo", "foi tocado pelo Outro Lado e está mudando", "segue alguém que o alimenta à noite", "carrega no estômago algo que um cultista engoliu"],
    tatica: ["Circula e ataca quem fica para trás.", "Ataca o mais fraco do grupo.", "Embosca de cima ou da vegetação."],
    ferido: ["Foge mancando.", "Fica mais agressivo.", "Uiva chamando outros."],
    saque: ["coleira com uma plaqueta do circo", "pegadas que levam a um esconderijo", "um osso humano roído"],
  },
  criatura: {
    origem: {
      Sangue: ["nasceu do ódio acumulado no picadeiro depois do incêndio", "é o que sobrou de um artista que se alimentou da plateia", "surgiu da paixão de um casal que morreu brigando", "foi alimentada por anos de sacrifícios do culto"],
      Morte: ["surgiu de um relógio que parou na hora do acidente", "é o luto de uma cidade que esqueceu seus mortos", "nasceu do lodo do lago onde jogaram os corpos", "é alguém que se recusou a morrer na hora certa"],
      Conhecimento: ["saiu das páginas de um diário de ocultista", "é um segredo que ninguém deveria saber, com corpo", "foi invocada por engano durante um estudo", "nasceu de uma pessoa que leu sigilos demais"],
      Energia: ["apareceu num apagão que durou três dias", "vive na fiação do parque de diversões", "é o caos de uma noite de festa que deu errado", "saiu de uma televisão ligada num canal que não existe"],
      Medo: ["ninguém sabe; ninguém deveria saber", "é o medo que toda criança tem do palhaço", "estava ali antes do circo, antes da cidade, antes de tudo", "é o que se vê no canto do olho"],
    },
    sinais: {
      Sangue: ["cheiro de ferro e pipoca queimada", "manchas de sangue que pulsam", "batimentos que se ouvem pelas paredes", "comida estragando em minutos"],
      Morte: ["relógios parados todos na mesma hora", "lodo escuro nas frestas", "plantas murchando em espiral", "um frio que vem de dentro"],
      Conhecimento: ["símbolos dourados aparecendo em papéis", "sussurros em línguas que quase se entende", "livros abertos na mesma página", "pessoas esquecendo o próprio nome"],
      Energia: ["lâmpadas piscando em ritmo de música", "rádios ligando sozinhos", "cheiro de ozônio e queimado", "objetos trocando de lugar"],
      Medo: ["silêncio absoluto, nem os grilos", "a sensação de estar sendo observado de todos os lados", "sombras que não batem com nada", "todos ouvem o próprio nome ao mesmo tempo"],
    },
    quer: ["devorar quem se aproximar do picadeiro", "manter os agentes presos até a última noite", "cumprir a vontade do culto que a chamou", "voltar a ser o que era antes", "atravessar para o nosso lado de vez", "ser vista e lembrada"],
    tatica: ["Ataca quem estiver isolado e some antes de ser cercada.", "Avança direto no agente mais ferido.", "Brinca com as presas antes de atacar de verdade.", "Protege um lugar específico e não sai dele."],
    ferido: ["Foge para o Outro Lado e volta na próxima noite.", "Fica mais rápida e mais cruel.", "Se divide, e um pedaço tenta fugir.", "Grita, e todos os sinais do lugar se intensificam."],
    fraqueza: {
      Sangue: ["não atravessa terra de cemitério", "se acalma com música de circo antiga", "perde força longe do lugar onde nasceu"],
      Morte: ["um relógio funcionando a incomoda", "não suporta fogo vivo", "precisa voltar ao lago antes do amanhecer"],
      Conhecimento: ["ignora quem não sabe ler", "fica presa em espelhos cobertos de sigilos", "se confunde com mentiras bem contadas"],
      Energia: ["desaparece no escuro total", "água corrente a enfraquece", "segue padrões; quebre o ritmo e ela hesita"],
      Medo: ["ninguém descobriu ainda", "talvez a coragem de olhar de frente", "existe enquanto alguém acreditar nela"],
    },
  },
};

function loreDe(ctx) { return { ...loreBase(ctx), ...social(ctx) }; }
function loreBase(ctx) {
  const t = ctx.tipo === "possuido" ? "possuido" : ctx.base;
  if (t === "assombracao") {
    const A = L.assombracao; const C = L.criatura;
    return {
      resumo: `${ctx.quem} que morreu ${pick(A.morte)}. O que ${gen(ctx, "o", "a")} prende aqui: ${pick(A.prende)}.`,
      sinais: pick(C.sinais[ctx.el] || C.sinais.Morte), tatica: pick(A.tatica), ferido: pick(A.ferido),
      segredo: `Segredo: ${pick(["sabe quem começou o incêndio", "viu o primeiro Hexatombe", "conhece a saída da lona, mas não pode passar por ela", "ainda tem família viva entre os sobreviventes", "não morreu sozinho: há outros presos aqui"])}.`,
      fala: pick(A.fala), saque: "",
    };
  }
  if (t === "Sangue" || t === "Morte" || t === "Conhecimento" || t === "Energia" || t === "Medo") {
    const C = L.criatura; const el = t;
    return {
      resumo: `Dizem que ${pick(C.origem[el])}. Quer ${pick(C.quer)}.`,
      sinais: pick(C.sinais[el]), tatica: pick(C.tatica), ferido: pick(C.ferido),
      segredo: `Fraqueza: ${pick(C.fraqueza[el])}.`, fala: "", saque: el === "Medo" ? "" : `Restos da criatura (componente de ${el})`,
    };
  }
  if (t === "possuido") {
    const B = L.humano; const C = L.criatura; const el = ctx.el;
    return {
      resumo: `${ctx.quem}, com ${pick(B.aparencia)}, que foi ${gen(ctx, "tocado", "tocada")} por ${el}: por onde passa há ${pick(C.sinais[el])}. Ainda quer ${pick(B.quer)}, mas algo dentro ${gen(ctx, "dele", "dela")} quer outra coisa.`,
      sinais: pick(C.sinais[el]), tatica: pick(C.tatica), ferido: pick(["Por um instante volta a si e pede ajuda.", "A transformação se completa.", ...B.ferido]),
      segredo: `Ainda dá para salvar? ${pick(["Talvez, se o ritual que causou isso for desfeito.", "Não. A pessoa já morreu; isso só usa o corpo.", "Sim, se alguém disser o nome verdadeiro dela em voz alta.", "Só se a criatura que tomou o corpo for destruída."])}`,
      fala: pick(["“Me ajuda… não, FIQUEM LONGE!”", "“Eu consigo ouvir. Ele está tão perto.”", "“Não sou mais eu.”"]),
      saque: pick(B.saque),
    };
  }
  const B = L[t] || L.humano;
  return {
    resumo: t === "animal" ? `${ctx.nome}, com ${pick(B.aparencia)}. Quer ${pick(B.quer)}.`
      : `${ctx.quem}, com ${pick(B.aparencia)}. Quer ${pick(B.quer)}.`,
    sinais: "", tatica: pick(B.tatica), ferido: pick(B.ferido),
    segredo: `Segredo: ${pick(B.segredo)}.`, fala: B.fala ? pick(B.fala) : "", saque: pick(B.saque),
  };
}

/* ---------- Atitude e gancho (pessoas e assombrações) ---------- */
export const ATITUDES = [
  ["Hostil", "ataca ou foge assim que vê os agentes", 1], ["Desconfiada", "fala pouco e quer saber quem mandou os agentes", 3],
  ["Indiferente", "não quer se envolver, mas pode ser convencida", 3], ["Curiosa", "faz perguntas e oferece algo em troca de respostas", 2],
  ["Prestativa", "ajuda, mas pede algo depois", 1],
];
const GANCHOS = [
  "uma pista sobre onde fica o altar do culto", "comida e água para um dia, em troca de proteção", "um atalho por baixo da lona",
  "o nome de um cultista infiltrado entre os sobreviventes", "uma chave que ninguém sabe o que abre", "o horário em que as criaturas saem",
  "um item paranormal que não sabe usar", "o paradeiro de uma pessoa desaparecida", "um segredo de outra equipe do Hexatombe",
  "o caminho para um lugar seguro para passar a noite",
];
const PEDIDOS = [
  "que levem uma carta para alguém lá fora", "que encontrem uma pessoa da família", "que destruam um objeto amaldiçoado",
  "que não contem a ninguém que {o} viram", "que matem uma criatura que {o} persegue", "que {o} deixem ir junto",
  "remédio para um ferimento que está infeccionando", "que recuperem algo que ficou num lugar perigoso",
];
function pesado(l) { const tot = l.reduce((s, x) => s + x[2], 0); let r = Math.random() * tot; for (const x of l) { r -= x[2]; if (r <= 0) return x; } return l[0]; }
function social(ctx) {
  if (ctx.tipo === "assombracao") return { atitude: `${pick(["Confusa", "Triste", "Furiosa", "Assustada"])}: não sabe que morreu, ou sabe bem demais.`, gancho: `Pode mostrar ${pick(GANCHOS)}.`, pedido: `Para descansar, precisa que resolvam o que a prende.` };
  if (!PESSOAS.includes(ctx.tipo)) return {};
  let at = pesado(ATITUDES);
  if (ctx.tipo === "cultista" && chance(0.7)) at = ATITUDES[0];
  if (ctx.tipo === "possuido" && chance(0.5)) at = ATITUDES[0];
  return { atitude: `${at[0]}: ${at[1]} (Diplomacia DT ${ctx.dt} para melhorar um passo).`, gancho: `Pode oferecer ${pick(GANCHOS)}.`, pedido: `Pede ${pick(PEDIDOS).replaceAll("{o}", gen(ctx, "o", "a"))}.` };
}

/* ---------- Traços especiais (opcional) ---------- */
export const TRACOS = [
  // [nome, efeito, aplicar, só para pessoas]
  ["Blindado", "+3 na Defesa e RD 3 contra corte e impacto.", (g) => { g.def += 3; }],
  ["Enorme", "Uma categoria de tamanho maior: +50% de PV, −2 na Defesa e alcance de 3m.", (g) => { g.pv = Math.round(g.pv * 1.5); g.def -= 2; }],
  ["Veloz", "+6m de deslocamento e +5 na Iniciativa.", (g) => { g.cri.desl = g.cri.desl.replace(/^(\d+)m/, (_, n) => `${Number(n) + 6}m`); g.cri.ini = maisBonus(g.cri.ini, 5); }],
  ["Ferido", "Começa a cena com metade dos PV e luta com desespero (+1 dado no dano).", (g) => { g.pvInicial = Math.ceil(g.pv / 2); }],
  ["Esperto", "Antecipa os agentes: +5 em Percepção e não pode ser flanqueado.", (g) => { g.cri.per = maisBonus(g.cri.per, 5); }],
  ["Marcado pelo Outro Lado", "Tem um sigilo que brilha: rituais contra ele custam +1 PE e ele tem RD 5 contra o elemento do sigilo.", () => {}],
  ["Faminto", "Só pensa em comer: se oferecerem comida, para de lutar por 1 rodada (Vontade DT 15 para resistir).", () => {}, "vivo"],
  ["Covarde", "Foge na primeira rodada em que sofrer dano; se cercado, se rende.", () => {}],
  ["Imparável", "Ignora a primeira condição que sofreria em cada cena.", () => {}],
  ["Sanguinário", "Ataca sempre quem estiver caído ou morrendo, se puder.", () => {}],
  ["Duas armas", "Faz um ataque extra a cada turno com −5.", (g) => { const a = g.cri.atq[0]; if (a) g.cri.atq.push([`${a[0]} (2ª arma)`, ajusta(a[1], -5), a[2], a[3]]); }, "pessoa"],
  ["Carrega um tesouro", "Leva algo valioso: um item paranormal, comida para dois dias ou a chave de uma área trancada.", () => {}, "pessoa"],
];
function maisBonus(expr, n) { const m = /^(\d+d20)([+-]\d+)?$/.exec(expr || ""); if (!m) return expr; const b = (Number(m[2]) || 0) + n; return `${m[1]}${b ? (b > 0 ? "+" : "") + b : ""}`; }
export function aplicarTraco(g, nome) {
  const tp = g._ctx?.tipo || "";
  const ok = (x) => !x[3] || (x[3] === "pessoa" ? PESSOAS.includes(tp) : PESSOAS.includes(tp) || tp === "animal");
  const t = nome ? TRACOS.find((x) => x[0] === nome) : pick(TRACOS.filter(ok)); if (!t) return g;
  if (g.traco) return g; // um traço por NPC
  t[2](g); g.traco = t[0];
  g.cri.hab = [`Traço — ${t[0]}: ${t[1]}`, ...g.cri.hab];
  return g;
}

/* ---------- Números ---------- */
function ajusta(expr, extra) { // "2d20+8" com +2
  const m = /^(\d+d20)([+-]\d+)?$/.exec(expr); if (!m) return expr;
  const b = (Number(m[2]) || 0) + extra; return `${m[1]}${b ? (b > 0 ? "+" : "") + b : ""}`;
}
function maisDado(expr, d) { const m = /^(\d+)d(\d+)(.*)$/.exec(expr); return m ? `${Math.max(1, Number(m[1]) + d)}d${m[2]}${m[3]}` : expr; }

export function gerarNpc({ tipo = "humano", vd = 40, papel = "comum", el: elFixo = "", traco = "" } = {}) {
  vd = TAB[vd] ? vd : 40; const T = TAB[vd];
  if (!TIPOS.some(([k]) => k === tipo)) tipo = "humano";
  let pv = T.pv, def = T.def, atqT = T.t, dano = T.dano;
  if (papel === "lacaio") { pv = Math.max(4, Math.round(pv * 0.4)); def -= 2; atqT = ajusta(atqT, -3); }
  if (papel === "chefe") { pv = Math.round(pv * 1.7); def += 2; atqT = ajusta(atqT, 3); dano = maisDado(dano, 1); }
  const ctx = { g: chance(0.5) ? "f" : "m", tipo, vd, papel, base: tipo, el: "", quem: "", nome: "", dt: DT[vd] + (papel === "chefe" ? 2 : 0), d: DADO_EL[vd], h: DANO_HAB[vd], c: CURA[vd] };
  const cri = { tipo: "", vd, per: T.per, ini: T.bom, res: { Fortitude: T.ruim, Reflexos: T.ruim, Vontade: T.ruim }, atq: [], extra: [], hab: [], pp: "", rd: "", vuln: "", desl: "9m", attrs: "", lore: null };
  const fixas = [];
  let nome;

  const elDe = () => (ELEMENTOS.includes(elFixo) ? elFixo : pick(ELEMENTOS));
  if (tipo === "humano" || tipo === "civil" || tipo === "circo") {
    const q = pick(L[tipo].quem); const quem = gen(ctx, q[0], q[1]); const arma = q[2]; ctx.quem = quem; ctx.assinatura = q[3] || "";
    nome = nomePessoa(ctx.g);
    cri.tipo = `${quem} (Pessoa Média)`;
    cri.res = { Fortitude: T.bom, Reflexos: T.bom, Vontade: T.ruim };
    if (tipo === "civil") {
      pv = Math.max(4, Math.round(pv * 0.5)); def -= 3; atqT = ajusta(atqT, -5);
      cri.res = { Fortitude: T.ruim, Reflexos: T.bom, Vontade: T.ruim };
      cri.atq.push(["Arma improvisada", atqT, maisDado(dano, -1), "impacto"]);
      cri.attrs = atributos(vd, { FOR: -1, INT: 1, PRE: 1 });
    } else if (tipo === "circo") {
      const td = /Faca|Arame|Chicote/.test(arma) ? "corte" : /Tocha/.test(arma) ? "fogo" : "impacto";
      cri.atq.push([arma, atqT, dano, td]);
      if (/Atirador/.test(quem)) cri.atq.push(["Faca arremessada", ajusta(atqT, 2), maisDado(dano, -1), "perfuração"]);
      cri.attrs = atributos(vd, /forte/.test(quem) ? { FOR: 2, AGI: -1 } : { AGI: 2, PRE: 1, INT: -1 });
      cri.desl = /Contorcionista|Equilibrista/.test(quem) ? "12m" : "9m";
    } else {
      const td = "balístico";
      cri.atq.push([arma, atqT, dano, td], ["Coronhada", ajusta(atqT, -2), maisDado(dano, -1), "impacto"]);
      cri.attrs = atributos(vd, { AGI: 1, INT: -1 });
    }
  } else if (tipo === "cultista") {
    const q = pick(L.cultista.quem); const quem = gen(ctx, q[0], q[1]); ctx.quem = quem;
    const el = elDe(); ctx.el = el;
    nome = `${pick(gen(ctx, ["Irmão", "Discípulo", "Escolhido", "Devoto"], ["Irmã", "Discípula", "Escolhida", "Devota", "Iniciada"]))} ${pick(NOMES[ctx.g])}`;
    cri.tipo = `${quem} (Ocultista de ${el})`;
    cri.res = { Fortitude: T.ruim, Reflexos: T.ruim, Vontade: T.bom };
    cri.atq.push(["Adaga ritual", atqT, dano, `corte + ${el}`]);
    const rit = DANO_HAB[vd];
    cri.extra.push([`Ritual de ${el} (${rit})`, rit]);
    fixas.push(`Conjura rituais de ${el} (DT ${ctx.dt}). Custa a própria vida: perde 1d6 PV por ritual.`);
    cri.attrs = atributos(vd, { INT: 1, PRE: 1, FOR: -1 });
  } else if (tipo === "agente") {
    const q = pick(L.agente.quem); const quem = gen(ctx, q[0], q[1]); const arma = q[2]; ctx.quem = quem;
    const el = elDe(); ctx.el = el;
    nome = nomePessoa(ctx.g);
    cri.tipo = `${quem} (Pessoa Média)`;
    cri.res = { Fortitude: T.ruim, Reflexos: T.bom, Vontade: T.bom };
    cri.ini = ajusta(T.bom, 2);
    if (/Adaga/.test(arma)) { cri.atq.push([arma, atqT, dano, `corte + ${el}`]); cri.extra.push([`Ritual de ${el} (${DANO_HAB[vd]})`, DANO_HAB[vd]]); }
    else cri.atq.push([arma, atqT, dano, "balístico"], ["Faca de combate", ajusta(atqT, -2), maisDado(dano, -1), "corte"]);
    fixas.push(`Conhece o paranormal: rituais e criaturas de ${el} não o pegam de surpresa.`);
    cri.attrs = atributos(vd, { INT: 1, AGI: 1, FOR: -1 });
  } else if (tipo === "assombracao") {
    const el = pick(["Morte", "Morte", "Sangue", "Energia", "Conhecimento"]); ctx.el = el;
    const q = pick(L.assombracao.quem); const quem = gen(ctx, q[0], q[1]); ctx.quem = quem;
    nome = `${gen(ctx, "O", "A")} ${pick(gen(ctx, ["Pálido", "Molhado", "Queimado", "Sem Olhos", "que Chora", "que Bate à Porta", "Sorridente", "Sem Voz"], ["Pálida", "Molhada", "Queimada", "Sem Olhos", "que Chora", "que Bate à Porta", "Sorridente", "Sem Voz"]))}${chance(0.5) ? ` ${pick(LUGARES)}` : ""}`;
    cri.tipo = `Assombração de ${el} (${quem})`;
    cri.res = { Fortitude: T.ruim, Reflexos: T.bom, Vontade: T.bom };
    pv = Math.round(pv * 0.8); def += 1;
    const x = vd >= 120 ? 10 : vd >= 40 ? 5 : 2;
    cri.rd = `Todo dano não paranormal ${x} · ${el} ${x * 2}`; cri.vuln = FRACO[el]; cri.pp = T.pp; cri.desl = "9m, voo, atravessa paredes";
    cri.atq.push(["Toque gelado", atqT, `${maisDado(dano, -1)}+${DADO_EL[vd]}`, `frio + ${el}`]);
    fixas.push("Incorpórea: atravessa paredes; dano não paranormal é reduzido à metade.");
    cri.attrs = atributos(vd, { PRE: 2, FOR: -2, VIG: -1 });
  } else if (tipo === "possuido") {
    const el = elDe(); ctx.el = el;
    const q = pick(L.humano.quem); const quem = gen(ctx, q[0], q[1]); ctx.quem = quem;
    nome = `${nomePessoa(ctx.g)}, ${pick(gen(ctx, ["o que volta", "o marcado", "o que sorri", "o sem sombra", "o que não dorme"], ["a que volta", "a marcada", "a que sorri", "a sem sombra", "a que não dorme"]))}`;
    cri.tipo = `${quem} ${gen(ctx, "tomado", "tomada")} por ${el} (Pessoa Média)`;
    cri.res = { Fortitude: T.bom, Reflexos: T.ruim, Vontade: T.bom };
    const x = vd >= 120 ? 5 : vd >= 40 ? 2 : 0;
    if (x) cri.rd = `${el} ${x * 2}`;
    cri.vuln = FRACO[el];
    cri.pp = vd >= 40 ? T.pp : "";
    const golpe = { Sangue: "Garras que rasgam a pele", Morte: "Toque apodrecido", Conhecimento: "Unhas de sigilo", Energia: "Choque" }[el];
    cri.atq.push([golpe, atqT, `${dano}+${DADO_EL[vd]}`, el]);
    cri.attrs = atributos(vd, { VIG: 1, INT: -1 });
  } else if (tipo === "animal") {
    const ANIMAIS = [["Cão selvagem", "Mordida", "corte"], ["Javali", "Presas", "perfuração"], ["Onça", "Garras", "corte"], ["Urubu gigante", "Bicada", "perfuração"], ["Jacaré", "Mordida", "perfuração"], ["Lobo-guará", "Mordida", "corte"], ["Leão do circo", "Garras", "corte"], ["Urso de picadeiro", "Patada", "impacto"], ["Cobra-d'água", "Picada", "perfuração"], ["Bando de ratos", "Mordidas", "corte"], ["Elefante do circo", "Pisão", "impacto"], ["Tigre de picadeiro", "Garras", "corte"], ["Enxame de corvos", "Bicadas", "perfuração"], ["Cavalo assustado", "Coice", "impacto"], ["Macaco do realejo", "Mordida", "corte"]];
    const [n, golpe, td] = pick(ANIMAIS); nome = n; ctx.nome = n;
    cri.tipo = /Bando|Enxame/.test(n) ? "Bando de animais Pequenos" : /Leão|Urso|Jacaré|Tigre|Cavalo/.test(n) ? "Animal Grande" : /Elefante/.test(n) ? "Animal Enorme" : /Macaco/.test(n) ? "Animal Pequeno" : "Animal Médio";
    if (/Elefante/.test(n)) { pv = Math.round(pv * 1.6); def -= 3; }
    cri.res = { Fortitude: T.bom, Reflexos: T.bom, Vontade: T.ruim }; cri.desl = /Urubu|corvos/.test(n) ? "3m, voo 12m" : /Cobra|Jacaré/.test(n) ? "6m, natação 12m" : "12m";
    cri.atq.push([golpe, atqT, dano, td]);
    cri.attrs = atributos(vd, { AGI: 1, FOR: 1, INT: -3, PRE: -1 });
  } else {
    const el = tipo; ctx.el = el;
    if (tipo === "Medo") ctx.el = "Medo";
    const NOME_CRI = {
      Sangue: ["Carniçal", "Devorador", "Retalhado", "Bocarra", "Abatedor", "Costurado", "Coração Aberto", "Mandíbula"],
      Morte: ["Lodento", "Ampulheta", "Apodrecido", "Cinzento", "Esquecido", "Espiral", "Enlutado", "Ponteiro"],
      Conhecimento: ["Sigilado", "Escriba", "Olho-Dourado", "Traçado", "Sem-Rosto", "Lente", "Bibliotecário", "Enigma"],
      Energia: ["Estático", "Faísca", "Distorcido", "Glitch", "Caleidoscópio", "Ruído", "Curto-Circuito", "Néon"],
      Medo: ["Inominável", "Vulto", "O Que Espera", "Silhueta", "Impossível", "Lacuna", "Canto do Olho", "Ninguém"],
    };
    nome = `${pick(NOME_CRI[el])} ${pick(LUGARES)}`;
    const tam = vd >= 120 ? "Grande" : "Média";
    cri.tipo = `Criatura de ${el} ${tam}`; cri.desl = el === "Energia" ? "12m" : el === "Medo" ? "9m, atravessa paredes" : "9m";
    cri.res = el === "Sangue" ? { Fortitude: T.bom, Reflexos: T.bom, Vontade: T.ruim } : el === "Conhecimento" ? { Fortitude: T.ruim, Reflexos: T.bom, Vontade: T.bom } : { Fortitude: T.bom, Reflexos: T.ruim, Vontade: T.bom };
    const x = vd >= 120 ? 10 : vd >= 40 ? 5 : 2;
    cri.rd = el === "Medo" ? `Todo dano não paranormal ${x} · Medo ${x * 2}` : `Balístico, corte, impacto e perfuração ${x} · ${el} ${x * 2}`;
    cri.vuln = FRACO[el];
    cri.pp = T.pp;
    const golpes = { Sangue: ["Garras", "corte"], Morte: ["Toque do lodo", "Morte"], Conhecimento: ["Lâmina de sigilos", "corte + Conhecimento"], Energia: ["Descarga", "Energia"], Medo: ["Toque impossível", "Medo"] }[el];
    cri.atq.push([golpes[0], atqT, `${dano}+${DADO_EL[vd]}`, golpes[1]]);
    if (vd >= 60) cri.atq.push(["Golpe secundário", ajusta(atqT, -5), maisDado(dano, -1), "impacto"]);
    cri.extra.push([`Habilidade (${ctx.h})`, ctx.h]);
    cri.attrs = atributos(vd, { Sangue: { FOR: 1, VIG: 1, INT: -2 }, Morte: { VIG: 2, AGI: -1 }, Conhecimento: { INT: 2, FOR: -1 }, Energia: { AGI: 2, VIG: -1 }, Medo: { PRE: 2, INT: 1 } }[el]);
  }
  ctx.nome ||= nome;
  const g = { nome, pv, def, cri, _ctx: ctx, _fixas: fixas };
  cri.hab = [...fixas, ...sortearHabs(ctx)];
  cri.lore = loreDe(ctx);
  if (traco === "sortear" || (traco && traco !== "nenhum")) aplicarTraco(g, traco === "sortear" ? "" : traco);
  ctx.traco = g.traco || "";
  return g;
}
/* Sorteia de novo só uma parte, mantendo o resto */
export function outrasHabilidades(g) {
  if (!g?._ctx) return g;
  const tr = g.cri.hab.find((h) => String(h).startsWith("Traço — "));
  g.cri.hab = [...(tr ? [tr] : []), ...(g._fixas || []), ...sortearHabs(g._ctx)]; return g;
}
export function outraHistoria(g) { if (!g?._ctx) return g; g.cri.lore = loreDe({ ...g._ctx, nome: g.nome }); return g; }
export function outroNome(g) {
  if (!g?._ctx || g._ctx.tipo === "animal") return g; // o nome do animal é a espécie
  let novo; // mesmo gênero, para combinar com a profissão e a história
  for (let i = 0; i < 30; i++) { novo = gerarNpc({ tipo: g._ctx.tipo, vd: g._ctx.vd, papel: g._ctx.papel }); if (novo._ctx.g === g._ctx.g) break; }
  g.nome = novo.nome; g._ctx.nome = g.nome;
  return g;
}
/* Texto da história, para copiar e para mostrar no combate */
export function loreTexto(l) {
  if (!l) return [];
  return [l.resumo, l.sinais && `Sinais: ${l.sinais}`, l.fala && `Fala: ${l.fala}`, l.atitude && `Atitude: ${l.atitude}`, l.gancho, l.pedido, l.tatica && `Em combate: ${l.tatica}`, l.ferido && `Ferido: ${l.ferido}`, l.segredo, l.saque && `Carrega: ${l.saque}`].filter(Boolean);
}
