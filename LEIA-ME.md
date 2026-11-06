# Escudo do Mestre — Hexatombe (extensão para Owlbear Rodeo)

Ferramentas do mestre para o Hexatombe, ligadas às extensões **Ficha Ordem Paranormal** e **Hexatombe**.
Só o mestre usa: se um jogador abrir, aparece "Privado para o mestre".

## Como instalar

1. No GitHub, crie um repositório **público** chamado `mestre-hexatombe` na conta `pebarrosdenashor`.
2. Envie os 9 arquivos **soltos, na raiz** (fora de qualquer pasta):
   `manifest.json`, `index.html`, `app.js`, `dados.js`, `sons.js`, `gerador.js`, `style.css`, `background.html`, `background.js`, `icon.svg`, `LEIA-ME.md`.
3. Em **Settings → Pages**: *Deploy from a branch* → `main` → `/ (root)` → Save.
4. Depois de 1–2 minutos, abra `https://pebarrosdenashor.github.io/mestre-hexatombe/manifest.json` e confira se aparece `"name": "Escudo do Mestre — Hexatombe"`.
5. No Owlbear: **Extensions → Add Extension**, cole esse link e ative na sala (junto com a Ficha e o Hexatombe).

> A ligação funciona porque as três extensões estão no mesmo site (`pebarrosdenashor.github.io`) e dividem o navegador do mestre. Não mude o nome do site.

## O que tem

**👥 Mesa** — todas as fichas dos jogadores: PV, PD (ou PE e Sanidade), Defesa, atributos, condições, equipe e estigma do Hexatombe, desertor, sinos, fome e sede. Clique num agente para abrir: dano, cura, PD, condições, teste secreto, abrir a ficha completa e achar o token. Tudo o que você muda vai direto para a ficha do jogador e para as barras do token. O botão ↶ desfaz a última mudança.

**🙈 Secretas** — teste em grupo sem ninguém ver (ex.: Percepção de todos contra DT 20), dados livres do mestre e o registro de rolagens. As rolagens secretas que os jogadores fazem pela ficha (botão 👁 → 🙈) chegam aqui mesmo com a janela fechada.

**⚔ Combate** — iniciativa (agentes pela ficha, criaturas pelo bestiário do livro ou do Hexatombe, NPCs rápidos), rodadas, condições que acabam sozinhas depois de X rodadas, ataques das criaturas contra a Defesa do alvo com botão para aplicar o dano, anel vermelho no token da vez e aviso "vez de…" para a mesa. Criaturas entram com o nome oculto nos avisos.

**🧰 Ferramentas** — quem carrega cada estigma (segredo do mestre), desertores e mortes, dano/cura/condição em grupo, anúncio para a mesa, gerador de nomes e a lista de condições.

O botão ⤢ abre o escudo em tela grande, com os agentes em duas colunas.

## Observações

- As fichas aparecem depois que os jogadores entram na sala com a extensão da ficha ativa. Se faltar alguém, clique em ⟳.
- O Hexatombe precisa ter sido aberto pelo mestre pelo menos uma vez nesta sala.
- O teste secreto usa atributo, treino, condições, desertor e sinos. Não conta a penalidade de carga.
- Em ataque de criatura com 20 natural, os dados de dano são dobrados; confira a margem de crítico no livro.


## Novidades da versão 1.1

**⚔ Combate**
- **＋ Tokens selecionados:** selecione tokens no mapa e clique. Token ligado a uma ficha entra como o agente; token com o nome de uma criatura do bestiário (ex.: "Jaguatirica", "Jaguatirica 2") entra com a ficha dela; qualquer outro entra como NPC simples, ligado ao token.
- **Menu do token:** botão direito num token → "Adicionar ao combate" (só o mestre vê). Com o Escudo fechado, os tokens esperam numa fila e entram quando você abrir.
- **Câmera vai até o token da vez:** a sua tela centraliza no token de quem age a cada turno.
- **Gerador de NPC:** escolha o tipo (pessoa armada, cultista, animal ou criatura de um elemento), o VD e o papel (lacaio, comum, chefe). Sai uma ameaça com Defesa, PV, testes, ataques, resistências, presença perturbadora e uma habilidade. Dá para pôr no combate (até 20 de uma vez), guardar para usar depois ou copiar o texto. **Os números são aproximados**, na escala das ameaças do livro, para improvisar.

**🎭 Cena** (aba nova)
- **Efeitos sonoros** para todos: porta rangendo, batidas, passos, sussurros, coração, trovão, estática, sino, grito distante, vidro, correntes e risada do circo. "Só ouvir aqui" toca só para você, para testar.
- **Ambientação em laço** para todos: vento, chuva, floresta à noite, tensão, batimento e rádio chiando, que podem tocar juntos. Também aceita uma música por link (mp3/ogg). Quem entra na sala depois já ouve o que está tocando.
- Os sons são gerados pelo navegador, sem arquivos. Cada jogador ajusta o próprio volume clicando no Escudo (na tela de "privado").
- **Relógios de ameaça** (4 a 12 fatias): clique numa fatia ou use −/＋. Os marcados como visíveis aparecem para os jogadores na tela de "privado" e avisam a mesa quando mudam.
- **Cronômetro:** visível para todos ou só para você. Quando acaba, todos recebem um aviso com o sino.
- **Notas desta cena:** cada cena do Owlbear tem as suas notas, guardadas no seu navegador. As de outras cenas ficam listadas embaixo. As notas gerais (de antes) também estão aqui.

**Permissão nova:** o manifesto pede a permissão de tocar som automaticamente. Ao atualizar, remova e adicione a extensão de novo se o Owlbear não tocar nada.

## Novidades da versão 1.2
- **Som consertado.** Os navegadores só deixam tocar som numa janela em que a pessoa clicou, e a parte invisível da extensão nunca recebe clique. Agora os sons tocam num botão 🔊 no canto de baixo, à esquerda, na tela de cada pessoa da sala. Se ele aparecer **🔇 vermelho**, basta clicar uma vez. Clicar no 🔊 mostra o volume.
- A ambientação também vai por mensagem, não só pela sala: chega na hora e funciona mesmo se a sala estiver sem espaço. Quem entra depois recebe do mestre.
- Música por link agora toca links que antes falhavam (servidores sem CORS). Precisa ser link direto para .mp3/.ogg.
- **Gerador de NPC 2:** novos tipos (civil, artista do circo, pessoa tomada pelo Outro Lado, mais animais); habilidades sorteadas de listas próprias de cada tipo (1 no lacaio, 2 no comum, 3 + uma de chefe no chefe), com DT e dano na escala do VD; atributos; e uma pequena história (o que quer, segredo, fala, como luta, o que faz ferido, o que carrega; criaturas têm origem, sinais e fraqueza). Botões 🎲 para trocar só o nome, só as habilidades ou só a história. Tudo isso vai para o combate e para os guardados.

## Novidades da versão 1.3
- **Quem está ouvindo** (aba Cena): mostra, para cada pessoa da sala, se o botão de som dela está 🔊 ouvindo, 🔇 bloqueado (falta um clique) ou ❔ sem resposta (versão antiga da extensão ou botão que não abriu: peça F5). **🔔 Testar som em todos** toca um sino para conferir. **📣 Avisar quem está sem som** mostra um aviso na tela dessas pessoas e reabre o botão delas.
- O botão de som se reabre sozinho se não der sinal de vida.
- **Gerador de equipe do Hexatombe** (Combate → Gerador → 👥 Equipe do Hexatombe): escolha o tipo (ex-agentes da Ordem, cultistas, família, mercenários, trupe do circo, civis, polícia), o NEX e quantas pessoas. Sai com nome, lema, desejo, estratégia, segredo, ponto fraco, tensões entre eles e cada agente com PV, PE, Defesa, perícias, ataque, habilidades da função e história (inclusive quem pode desertar). **⛺ Pôr no Hexatombe** coloca a equipe numa equipe do ritual, com os integrantes na aba NPCs e o plano no “Plano secreto do mestre”.

## Novidades da versão 1.4
O gerador (no fim da aba ⚔ Combate) agora tem três modos: 👤 NPC, 🎭 Encontro e 👥 Equipe.

- **NPC:**
  - Tipos novos: agente rival / caçador do oculto e assombração. Mais animais (elefante, tigre, corvos, cavalo, macaco).
  - Mais habilidades em todos os tipos.
  - Pessoas e assombrações vêm com atitude (com a DT para melhorar), o que podem oferecer e o que pedem.
  - Traço especial opcional (blindado, enorme, veloz, ferido, duas armas…), escolhido ou sorteado. O botão ✨ Traço acrescenta um depois.
  - “Últimos gerados” guarda os 10 anteriores para você voltar a eles.
- **Encontro (novo):** escolha o tema, o VD, a dificuldade e o elemento. Sai um grupo coerente (chefe, comuns e lacaios) com a cena: onde, o que estão fazendo, o que querem, quando atacam e fogem, uma complicação, como resolver sem luta e a recompensa. Dá para trocar a cena ou um grupo, pôr todos no combate de uma vez e guardar qualquer um.
- **Equipe:**
  - Tipos novos: pesquisadores da universidade, sobreviventes de outro Hexatombe, grupo da igreja e canal de caça-fantasmas.
  - Composição: equilibrada, mais combate, mais ocultismo ou furtiva.
  - A equipe ganha base, recursos, como trata os agentes, reação no primeiro encontro, o que oferece e quer numa troca, e o plano do começo à hora do sacrifício.
  - Função nova: intendente (cuida da comida).
  - Cada integrante tem aparência, o que carrega, uma fala e, às vezes, um segredo. Mais tensões em equipes grandes.
  - Tudo isso vai junto para o “Plano secreto do mestre” e o “Perfil da equipe” no Hexatombe.

## Novidades da versão 1.5
Arquivos novos: `sussurro.html` e `sussurro.js`. Suba os dois junto com os outros (todos os arquivos mudaram de versão).

**🎭 Cena — mesa de som**
- **Para quem:** escolha “Todos” ou marque jogadores; o efeito toca só para eles (você sempre ouve, para acompanhar).
- **Sons novos:** caixinha de música desafinada e respiração na nuca (efeitos); realejo do circo e goteira (ambientação).
- **Seu próprio som:** guarde efeitos por link direto (.mp3/.ogg) e toque com um clique.
- **Volume de cada ambiente:** cada laço ligado ganha o seu controle de volume (ex.: realejo baixinho por baixo do vento).
- **Cenas sonoras:** guarde o que está tocando com um nome (“Picadeiro à noite”) e troque o clima inteiro com um clique.
- **🔇 Silêncio:** para ambientes, música e sons por link, devagar.
- A caixa de som também toca os sons pedidos pelas outras extensões: crítico, 1 natural e ritual de cada elemento (ficha) e a revelação do bestiário (Hexatombe).

**🙈 Secretas — sussurros**
- Escreva, marque para quem vai e escolha o estilo: 🌫 sussurro (letra por letra, tremendo), 🩸 voz do Outro Lado (vermelho, embaralhado), ❄ pensamento intrusivo (azul) ou 📜 bilhete.
- Escolha o som que toca junto, só para essa pessoa. Aparece no alto da tela dela e some sozinho.
- **Pode responder:** a pessoa escreve de volta e só você recebe (aviso na tela, mesmo com o Escudo fechado).
- Na lista de enviados: ✓ quem já leu e as respostas. ★ guarda frases para usar depois. 👁 Prévia mostra só na sua tela.
- Atalho: na aba Mesa, abra um agente e clique em **🗣 Sussurrar**.

**🧰 Ferramentas — efeitos das fichas na mesa:** liga/desliga a animação de ritual e os críticos na tela de todos (o mesmo controle está na aba Mesa da ficha).

## Novidades da versão 1.6

- **Prato do mestre**: os dados que o mestre rola no Hexatombe e no Painel do Mestre caem num prato de dados só dele, com a mesma aparência escolhida na ficha (Dados › Aparência dos dados e do prato). Nada é enviado pela sala: os jogadores nunca veem esse prato.
- O botão 🎲 no canto de baixo reabre o prato; 🕘 mostra as últimas rolagens do mestre (das três extensões) e 📌 deixa o prato aberto.
