[![CI/Deno Test](https://github.com/PoliEats/Backend/actions/workflows/deno_test.yml/badge.svg)](https://github.com/PoliEats/Backend/actions/workflows/deno_test.yml)

# PoliEats 🍽 - Backend

## Descrição:

O PoliEats é um chatbot desenvolvido para auxiliar os alunos, professores e demais
visitantes do colégio **Poliedro** a fazerem pedidos de comida e bebida a partir
de uma interface de chat totalmente automatizada. O bot é capaz de responder
perguntas frequentes, fornecer informações sobre o cardápio e realizar pedidos
de forma rápida e eficiente. O objetivo principal do PoliEats é facilitar a
experiência de compra dos usuários, tornando o processo mais ágil e prático.

## Funcionalidades:

- **Cardápio**: O bot fornece informações detalhadas sobre o cardápio, incluindo
  preços e opções disponíveis.
- **Pedidos**: Os usuários podem fazer pedidos diretamente pelo bot, que irá
  encaminhar as informações para a equipe responsável.
- **Perguntas Frequentes**: O bot é capaz de responder perguntas frequentes
  sobre o colégio, cardápio e outros assuntos relacionados.
- **Horários**: O bot fornece informações sobre os horários de funcionamento do
  colégio e do serviço de alimentação.

## Tecnologias Utilizadas:

- **TypeScript**: Linguagem de programação utilizada para desenvolver o backend.
- **Deno**: Ambiente de execução para o TypeScript.
- **PostgreSQL**: Banco de dados utilizado para armazenar informações sobre o
  cardápio, pedidos e usuários.
- **DrizzleORM**: ORM utilizado para facilitar a interação com o banco de dados
  PostgreSQL.
- **Mistral AI**: Modelo de linguagem utilizado para processar as mensagens dos
  usuários e gerar respostas.
- **LangChain**: Biblioteca utilizada para integrar o modelo de linguagem com o
  bot e facilitar a construção de fluxos de conversa.

## Como executar o projeto:

1. Clone o repositório:

```bash
git clone https://github.com/PoliEats/Backend.git
cd Backend
```

2. Instale as dependências:

```bash
deno install
```

3. Configure o .env:

```bash
cp .env.example .env
```

4. Configure o banco de dados:

```bash
deno task db:migrate
```

5. Execute o projeto:

```bash
deno task start
```
