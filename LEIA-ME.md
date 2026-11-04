# Escudo do Mestre — Hexatombe (extensão para Owlbear Rodeo)

Ferramentas do mestre para o Hexatombe, ligadas às extensões **Ficha Ordem Paranormal** e **Hexatombe**.
Só o mestre usa: se um jogador abrir, aparece "Privado para o mestre".

## Como instalar

1. No GitHub, crie um repositório **público** chamado `mestre-hexatombe` na conta `pebarrosdenashor`.
2. Envie os 9 arquivos **soltos, na raiz** (fora de qualquer pasta):
   `manifest.json`, `index.html`, `app.js`, `dados.js`, `style.css`, `background.html`, `background.js`, `icon.svg`, `LEIA-ME.md`.
3. Em **Settings → Pages**: *Deploy from a branch* → `main` → `/ (root)` → Save.
4. Depois de 1–2 minutos, abra `https://pebarrosdenashor.github.io/mestre-hexatombe/manifest.json` e confira se aparece `"name": "Escudo do Mestre — Hexatombe"`.
5. No Owlbear: **Extensions → Add Extension**, cole esse link e ative na sala (junto com a Ficha e o Hexatombe).

> A ligação funciona porque as três extensões estão no mesmo site (`pebarrosdenashor.github.io`) e dividem o navegador do mestre. Não mude o nome do site.

## O que tem

**👥 Mesa** — todas as fichas dos jogadores: PV, PD (ou PE e Sanidade), Defesa, atributos, condições, equipe e estigma do Hexatombe, desertor, sinos, fome e sede. Clique num agente para abrir: dano, cura, PD, condições, teste secreto, abrir a ficha completa e achar o token. Tudo o que você muda vai direto para a ficha do jogador e para as barras do token. O botão ↶ desfaz a última mudança.

**🙈 Secretas** — teste em grupo sem ninguém ver (ex.: Percepção de todos contra DT 20), dados livres do mestre e o registro de rolagens. As rolagens secretas que os jogadores fazem pela ficha (botão 👁 → 🙈) chegam aqui mesmo com a janela fechada.

**⚔ Combate** — iniciativa (agentes pela ficha, criaturas pelo bestiário do livro ou do Hexatombe, NPCs rápidos), rodadas, condições que acabam sozinhas depois de X rodadas, ataques das criaturas contra a Defesa do alvo com botão para aplicar o dano, anel vermelho no token da vez e aviso "vez de…" para a mesa. Criaturas entram com o nome oculto nos avisos.

**🧰 Ferramentas** — quem carrega cada estigma (segredo do mestre), desertores e mortes, dano/cura/condição em grupo, anúncio para a mesa, gerador de nomes, notas do mestre e a lista de condições.

O botão ⤢ abre o escudo em tela grande, com os agentes em duas colunas.

## Observações

- As fichas aparecem depois que os jogadores entram na sala com a extensão da ficha ativa. Se faltar alguém, clique em ⟳.
- O Hexatombe precisa ter sido aberto pelo mestre pelo menos uma vez nesta sala.
- O teste secreto usa atributo, treino, condições, desertor e sinos. Não conta a penalidade de carga.
- Em ataque de criatura com 20 natural, os dados de dano são dobrados; confira a margem de crítico no livro.
