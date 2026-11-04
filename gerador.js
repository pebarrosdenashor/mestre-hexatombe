/* =========================================================
   Gerador de NPCs e criaturas (v2).
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
const DANO_HAB = { 10: "2d6", 20: "3d6", 40: "3d8", 60: "4d8", 80: "6d6", 100: "6d8", 120: "8d8", 160: "10d8" };
const CURA = { 10: "1d8", 20: "2d8", 40: "3d8", 60: "4d8", 80: "5d8", 100: "6d8", 120: "7d8", 160: "9d8" };

export const TIPOS = [
  ["humano", "Pessoa armada"], ["civil", "Civil / testemunha"], ["cultista", "Cultista"], ["circo", "Artista do circo"],
  ["possuido", "Pessoa tomada pelo Outro Lado"], ["animal", "Animal"],
  ["Sangue", "Criatura de Sangue"], ["Morte", "Criatura de Morte"], ["Conhecimento", "Criatura de Conhecimento"], ["Energia", "Criatura de Energia"], ["Medo", "Criatura de Medo"],
];
export const PAPEIS = [["lacaio", "Lacaio (fraco, em bando)"], ["comum", "Comum"], ["chefe", "Chefe"]];
const ELEMENTOS = ["Sangue", "Morte", "Conhecimento", "Energia"];
const FRACO = { Sangue: "Morte", Morte: "Energia", Energia: "Conhecimento", Conhecimento: "Sangue", Medo: "" };

const pick = (a) => a[Math.floor(Math.random() * a.length)];
function sortear(a, n) { const c = [...a]; const out = []; while (c.length && out.length < n) out.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]); return out; }
const chance = (p) => Math.random() < p;

/* ---------- Nomes ---------- */
const NOMES = {
  m: ["Bruno", "Diego", "Fábio", "Hugo", "João", "Lucas", "Nilo", "Paulo", "Rafael", "Túlio", "Vítor", "Zeca", "Caetano", "Ernesto", "Irineu", "Aurélio", "Dirceu", "Gerson", "Jairo", "Moacir", "Osvaldo", "Sebastião", "Valdemar", "Benedito"],
  f: ["Ana", "Carla", "Elisa", "Glória", "Iara", "Kátia", "Marta", "Olga", "Sônia", "Wanda", "Benedita", "Dalva", "Jussara", "Mirela", "Odete", "Cida", "Edite", "Heloísa", "Ivone", "Lurdes", "Neusa", "Quitéria", "Rosângela", "Tereza", "Zuleide"],
};
const gen = (ctx, m, f) => (ctx.g === "f" ? f : m);
const SOBRENOMES = ["Silva", "Souza", "Pereira", "Costa", "Nogueira", "Barros", "Ferraz", "Rocha", "Moraes", "Prado", "Siqueira", "Fonseca", "Lacerda", "Albuquerque", "Bittencourt", "Cardoso", "Damasceno", "Esteves", "Galvão", "Mendonça", "Queiroz", "Teixeira", "Vasconcelos"];
const APELIDOS = ["Dente-de-Ouro", "Tição", "Ferrugem", "Mão-Leve", "Corvo", "Baixinho", "Cicatriz", "Doutor", "Vela", "Coruja", "Fumaça", "Navalha", "Padre", "Sorriso"];
const LUGARES = ["da Lona Rasgada", "do Picadeiro", "do Poço Seco", "da Estrada Velha", "da Mata Fechada", "do Necrotério", "do Trem Parado", "das Jaulas", "do Lago Escuro", "da Capela", "do Galpão", "da Roda-Gigante", "do Porão", "da Rodovia"];
function nomePessoa(g) {
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
const H = {
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
  ],
  civil: [
    ["Grito de socorro", "livre", "Todos num raio de 30m ouvem; quem estiver por perto vem ver o que houve."],
    ["Implorar", "reação", "Ao ser atacado, Diplomacia contra a Vontade do agressor: se vencer, o ataque é desviado ou não acontece."],
    ["Conhece o lugar", "passiva", "+5 em testes para se esconder ou fugir no local onde vive ou trabalha."],
    ["Pânico", "passiva", "Ao ver algo paranormal, Vontade DT {dt}: se falhar, foge e não ajuda ninguém por 1d4 rodadas."],
    ["Testemunha-chave", "—", "Viu algo importante; só conta depois de convencido (Diplomacia DT {dt}) ou de ser salvo."],
    ["Primeiros socorros", "padrão", "Estabiliza alguém que esteja morrendo; o alvo recupera 1d4 PV."],
    ["Arma improvisada", "passiva", "Pega o que estiver por perto: faca de cozinha, extintor, cadeira (dano 1d6 impacto ou corte)."],
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
  ],
  Medo: [
    ["Impossível", "passiva", "Ataques contra ela sofrem −1 dado na primeira rodada."],
    ["Presença absoluta", "passiva", "Quem a vê pela primeira vez faz Vontade DT {dt} ou fica apavorado por 1 rodada."],
    ["Lacuna", "movimento", "Some e reaparece em qualquer ponto que nenhum agente esteja olhando."],
    ["Pesadelo real", "padrão", "Um alvo vê seu maior medo: {h} mental (Vontade DT {dt} reduz à metade) e fica abalado."],
    ["Não está aqui", "reação", "Uma vez por rodada, um ataque contra ela erra se o atacante não passar em Vontade DT {dt}."],
    ["Silêncio", "1×/cena", "Por 1 rodada, ninguém em alcance médio consegue falar nem conjurar rituais."],
    ["Fome do medo", "passiva", "Recupera {d} PV sempre que um agente perde Sanidade em alcance médio."],
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

function habTxt([n, a, t], ctx) {
  const txt = t.replaceAll("{dt}", ctx.dt).replaceAll("{d}", ctx.d).replaceAll("{h}", ctx.h).replaceAll("{c}", ctx.c).replaceAll("{vd}", ctx.vd);
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
const L = {
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

function loreDe(ctx) {
  const t = ctx.tipo === "possuido" ? "possuido" : ctx.base;
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

/* ---------- Números ---------- */
function ajusta(expr, extra) { // "2d20+8" com +2
  const m = /^(\d+d20)([+-]\d+)?$/.exec(expr); if (!m) return expr;
  const b = (Number(m[2]) || 0) + extra; return `${m[1]}${b ? (b > 0 ? "+" : "") + b : ""}`;
}
function maisDado(expr, d) { const m = /^(\d+)d(\d+)(.*)$/.exec(expr); return m ? `${Math.max(1, Number(m[1]) + d)}d${m[2]}${m[3]}` : expr; }

export function gerarNpc({ tipo = "humano", vd = 40, papel = "comum" } = {}) {
  vd = TAB[vd] ? vd : 40; const T = TAB[vd];
  if (!TIPOS.some(([k]) => k === tipo)) tipo = "humano";
  let pv = T.pv, def = T.def, atqT = T.t, dano = T.dano;
  if (papel === "lacaio") { pv = Math.max(4, Math.round(pv * 0.4)); def -= 2; atqT = ajusta(atqT, -3); }
  if (papel === "chefe") { pv = Math.round(pv * 1.7); def += 2; atqT = ajusta(atqT, 3); dano = maisDado(dano, 1); }
  const ctx = { g: chance(0.5) ? "f" : "m", tipo, vd, papel, base: tipo, el: "", quem: "", nome: "", dt: DT[vd] + (papel === "chefe" ? 2 : 0), d: DADO_EL[vd], h: DANO_HAB[vd], c: CURA[vd] };
  const cri = { tipo: "", vd, per: T.per, ini: T.bom, res: { Fortitude: T.ruim, Reflexos: T.ruim, Vontade: T.ruim }, atq: [], extra: [], hab: [], pp: "", rd: "", vuln: "", desl: "9m", attrs: "", lore: null };
  const fixas = [];
  let nome;

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
    const el = pick(ELEMENTOS); ctx.el = el;
    nome = `${pick(gen(ctx, ["Irmão", "Discípulo", "Escolhido", "Devoto"], ["Irmã", "Discípula", "Escolhida", "Devota", "Iniciada"]))} ${pick(NOMES[ctx.g])}`;
    cri.tipo = `${quem} (Ocultista de ${el})`;
    cri.res = { Fortitude: T.ruim, Reflexos: T.ruim, Vontade: T.bom };
    cri.atq.push(["Adaga ritual", atqT, dano, `corte + ${el}`]);
    const rit = DANO_HAB[vd];
    cri.extra.push([`Ritual de ${el} (${rit})`, rit]);
    fixas.push(`Conjura rituais de ${el} (DT ${ctx.dt}). Custa a própria vida: perde 1d6 PV por ritual.`);
    cri.attrs = atributos(vd, { INT: 1, PRE: 1, FOR: -1 });
  } else if (tipo === "possuido") {
    const el = pick(ELEMENTOS); ctx.el = el;
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
    const ANIMAIS = [["Cão selvagem", "Mordida", "corte"], ["Javali", "Presas", "perfuração"], ["Onça", "Garras", "corte"], ["Urubu gigante", "Bicada", "perfuração"], ["Jacaré", "Mordida", "perfuração"], ["Lobo-guará", "Mordida", "corte"], ["Leão do circo", "Garras", "corte"], ["Urso de picadeiro", "Patada", "impacto"], ["Cobra-d'água", "Picada", "perfuração"], ["Bando de ratos", "Mordidas", "corte"]];
    const [n, golpe, td] = pick(ANIMAIS); nome = n; ctx.nome = n;
    cri.tipo = /Bando/.test(n) ? "Bando de animais Pequenos" : /Leão|Urso|Jacaré/.test(n) ? "Animal Grande" : "Animal Médio";
    cri.res = { Fortitude: T.bom, Reflexos: T.bom, Vontade: T.ruim }; cri.desl = /Urubu/.test(n) ? "3m, voo 12m" : /Cobra|Jacaré/.test(n) ? "6m, natação 12m" : "12m";
    cri.atq.push([golpe, atqT, dano, td]);
    cri.attrs = atributos(vd, { AGI: 1, FOR: 1, INT: -3, PRE: -1 });
  } else {
    const el = tipo; ctx.el = el;
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
  return g;
}
/* Sorteia de novo só uma parte, mantendo o resto */
export function outrasHabilidades(g) { if (!g?._ctx) return g; g.cri.hab = [...(g._fixas || []), ...sortearHabs(g._ctx)]; return g; }
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
  return [l.resumo, l.sinais && `Sinais: ${l.sinais}`, l.fala && `Fala: ${l.fala}`, l.tatica && `Em combate: ${l.tatica}`, l.ferido && `Ferido: ${l.ferido}`, l.segredo, l.saque && `Carrega: ${l.saque}`].filter(Boolean);
}
