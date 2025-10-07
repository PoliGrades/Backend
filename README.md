[![CI/Deno Test](https://github.com/PoliGrades/Backend/actions/workflows/deno_test.yml/badge.svg)](https://github.com/PoliGrades/Backend/actions/workflows/deno_test.yml)

# PoliGrades 📓 - Backend

## Descrição:

O PoliGrades é uma plataforma de gerenciamento de notas desenvolvida para o colégio **Poliedro**.
O sistema permite que professores registrem e gerenciem as notas dos alunos de forma eficiente, enquanto os alunos podem acessar suas notas e acompanhar seu desempenho acadêmico.

## Funcionalidades:

- **Registro de Notas**: Os professores podem registrar notas para os alunos em diferentes disciplinas.
- **Consulta de Notas**: Os alunos podem consultar suas notas a qualquer momento.
- **Exportação de Relatórios**: Geração de relatórios de desempenho acadêmico para alunos e professores.


## Tecnologias Utilizadas:

- **TypeScript**: Linguagem de programação utilizada para desenvolver o backend.
- **Deno**: Ambiente de execução para o TypeScript.
- **PostgreSQL**: Banco de dados utilizado para armazenar informações sobre o
  registro de notas, consultas e usuários.
- **DrizzleORM**: ORM utilizado para facilitar a interação com o banco de dados
  PostgreSQL.

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

## Como executar os testes:

1. Clone o repositório:

```bash
git clone https://github.com/PoliEats/Backend.git
cd Backend
```

2. Instale o Deno:

```bash
irm https://deno.land/install.ps1 | iex
```

3. Execute os testes:

```bash
deno task test
```