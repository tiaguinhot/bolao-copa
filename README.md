# Bolão Copa 2026 — app web (GitHub Pages + Firebase)

App estático com banco compartilhado em tempo real. Cada participante abre o link,
escolhe o nome, lança os palpites e vê a classificação ao vivo. Você (admin) lança
os resultados e o ranking se atualiza para todos.

## Arquivos
- `index.html` — interface
- `app.js` — lógica (Firebase + pontuação)
- `firebase-config.js` — **você edita** com as chaves do seu projeto
- `firestore.rules` — regras de segurança para colar no Firebase
- `README.md` — este guia

---

## Passo 1 — Criar o projeto no Firebase (grátis)
1. Acesse https://console.firebase.google.com e clique em **Adicionar projeto**. Dê um nome (ex.: `bolao-tagliapietra`). Pode desativar o Google Analytics.
2. No menu lateral, **Criar > Firestore Database** > **Criar banco de dados** > inicie em **modo de produção** > escolha a região `southamerica-east1` (São Paulo).
3. Em **Criar > Authentication** > **Começar** > aba **Sign-in method** > habilite **Anônimo**.
4. Engrenagem (Configurações do projeto) > role até **Seus apps** > clique no ícone **</>** (Web) > registre o app (sem precisar de Hosting). Vai aparecer um objeto `firebaseConfig` — copie esses valores.

## Passo 2 — Preencher o `firebase-config.js`
Abra `firebase-config.js` e cole os valores do `firebaseConfig`. Troque também o `ADMIN_CODE` por um código só seu.

## Passo 3 — Colar as regras de segurança
No Firebase: **Firestore Database > aba Regras** > apague o conteúdo, cole o que está em `firestore.rules` e clique em **Publicar**.

## Passo 4 — Publicar no GitHub Pages
1. Crie um repositório no GitHub (ex.: `bolao-copa`). Pode ser público.
2. Suba os 4 arquivos (`index.html`, `app.js`, `firebase-config.js`, e opcionalmente `README.md`) na raiz.
3. No repositório: **Settings > Pages** > em *Branch* escolha `main` / `/root` > **Save**.
4. Em ~1 min o link fica disponível: `https://SEU-USUARIO.github.io/bolao-copa/`

> Observação: como é um site estático, as chaves do Firebase ficam visíveis no código — isso é normal e esperado para apps web do Firebase. A proteção real vem das **regras do Firestore** (Passo 3), não de esconder a config.

## Passo 5 — Semear os dados (uma vez)
Abra o link, vá na aba **Admin**, digite seu `ADMIN_CODE` e clique em **Gravar dados base no banco**. Isso cria os 72 jogos, os participantes e os palpites/resultados já lançados até agora.

## Uso no dia a dia
- **Família:** abre o link, escolhe o nome no topo, digita os placares nos jogos **Abertas** e clica em *Salvar*. Pode trocar enquanto não travar.
- **Você (admin):** antes dos jogos, trave a rodada (aba Admin). Depois dos jogos, lance os resultados — o ranking atualiza para todos na hora. Jogos com resultado travam sozinhos.

## Travar apostas no horário do jogo
A trava hoje é por rodada (manual) + automática quando há resultado. Se quiser trava
automática no apito de cada jogo, dá pra evoluir guardando um campo `lockAt` (data/hora)
por jogo e comparando com o horário atual — me avise que eu incluo.
