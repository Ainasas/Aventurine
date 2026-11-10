# Aventurine

Controle financeiro mensal pessoal, com meu tipo de tema. 
Você registra ganhos e gastos do mês, cadastra parcelas e assinaturas que se repetem sozinhas, e ao finalizar o ciclo o resultado vai para a **caixinha**, um repositório que acumula mês a mês.

Tudo roda no navegador. Não há servidor nem banco de dados: os dados ficam no `localStorage`.

## Funcionalidades

- **Painel**: cards com ganhos do mês, gastos do mês, resultado do mês e total da caixinha.
- **Lançamentos**: cadastro, edição e exclusão de ganhos e gastos, com conta/banco, tag de categoria e filtro por tipo.
- **Recorrentes**: parcelas (ex.: 3 de 12) e assinaturas. A primeira cobrança entra no mês atual e as seguintes são lançadas automaticamente ao finalizar o mês. Parcelas se encerram sozinhas na última; assinaturas continuam até serem canceladas.
- **Finalizar mês**: arquiva os lançamentos, zera o ciclo, abre o mês seguinte e lança as cobranças recorrentes ativas.
- **Histórico**: meses arquivados com totais, resultado, caixinha ao fechar e a lista completa de lançamentos.
- **Caixinha**: saldo inicial editável (para dinheiro que já existia antes do app) mais o resultado de cada mês fechado.

## Como o cálculo funciona

| Valor | Fórmula |
|---|---|
| Resultado do mês | ganhos − gastos |
| Caixinha (total) | saldo inicial + resultados dos meses fechados + resultado do mês atual |

Ao finalizar o mês, o resultado é incorporado à caixinha e o mês seguinte começa com resultado zero.

## Tecnologias

- [React](https://react.dev) 19
- [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com) v4
- [Framer Motion](https://motion.dev) (animações)
- [Lucide](https://lucide.dev) (ícones)
- [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) (build em um único HTML)

## Estrutura

```
src/
├── App.jsx                  # layout, abas e navegação
├── main.jsx
├── index.css                # tema e estilos globais
├── components/
│   ├── CategoryIcon.jsx
│   ├── ConfirmMonthModal.jsx
│   ├── Dashboard.jsx
│   ├── GlassCard.jsx
│   ├── HistoryView.jsx
│   ├── MetricsGrid.jsx
│   ├── RecurringView.jsx
│   ├── Starfield.jsx
│   ├── TransactionForm.jsx
│   └── TransactionList.jsx
├── hooks/
│   └── useFinance.js        # estado e ações (lançamentos, recorrentes, fechamento)
└── lib/
    ├── categories.js        # contas, categorias e estilos por tipo
    ├── finance.js           # formatação, parsing e cálculo das métricas
    └── storage.js           # leitura e gravação no localStorage
```

## Como rodar

Requer [Node.js](https://nodejs.org) instalado.

```bash
npm install
npm run dev
```

O app abre em `http://localhost:5173`.

## Build e uso offline

```bash
npm run build
```

O `vite-plugin-singlefile` gera `dist/index.html` com código, estilos e ícones embutidos. Copie esse arquivo para uma pasta fixa (por exemplo `C:\Aventurine\index.html`) e crie um atalho que o abra em janela própria, sem barra do navegador.

**Brave:**

```
"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" --app="file:///C:/Aventurine/index.html"
```

**Chrome:**

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --app="file:///C:/Aventurine/index.html"
```

**Edge:**

```
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="file:///C:/Aventurine/index.html"
```

Ajuste o caminho do executável se o seu for diferente. As fontes do Google Fonts não funcionam offline; nesse caso o app usa as fontes de reserva (Segoe UI e Consolas).

## Dados e backup

Os dados ficam no `localStorage` do navegador, na chave `aventurine.finance.v2`. Isso traz alguns cuidados:

- O `localStorage` é separado **por endereço**. O app em `http://localhost:5173` e o atalho em `file:///...` têm armazenamentos diferentes.
- Use sempre o mesmo navegador (e o mesmo perfil) para abrir o app.
- Limpar dados de sites, ou ativar "limpar cookies e dados ao fechar" (no Brave: `brave://settings/cookies`), apaga tudo.

### Exportar os dados

No console do navegador (F12), com o app aberto:

```js
copy(localStorage.getItem("aventurine.finance.v2"))
```

Cole o conteúdo em um arquivo `.txt` para guardar como backup.

### Importar os dados

No console do app onde quer restaurar:

```js
localStorage.setItem("aventurine.finance.v2", String.raw`COLE_AQUI`)
```

Depois recarregue a página (F5).

## Configuração

- **Mês inicial**: definido por `START_MONTH` em `src/lib/storage.js` (atualmente `2026-11`). Só vale para quem abre o app pela primeira vez, sem dados salvos.
- **Contas sugeridas**: lista `ACCOUNTS` em `src/lib/categories.js`.
- **Categorias**: lista `CATEGORIES` em `src/lib/categories.js`, cada uma com ícone e cor.
- **Chave de armazenamento**: `STORAGE_KEY` em `src/lib/storage.js`. Trocar a chave faz o app começar sem dados.

## Limitações

- Não há sincronização entre aparelhos: cada navegador tem sua própria base.
- Recorrências não podem ser editadas depois de criadas. Para mudar o valor, cancele e cadastre de novo.
- Cancelar uma recorrência não remove a cobrança que já está no mês atual; exclua-a na lista de lançamentos, se necessário.
- Não há botões de exportar/importar dentro do app; o backup é feito pelo console.
