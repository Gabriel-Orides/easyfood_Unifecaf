# EasyFood API

Projeto acadêmico de uma API REST para gerenciamento de restaurantes, desenvolvido em Node.js com Express e Prisma. Esta versão foi adaptada para uso didático e para organização de uma atividade prática, mantendo a proposta original do sistema, mas com ajustes de identificação, documentação e estrutura pessoal.

## Informações do autor

- Nome: Gabriel Targino de Orides
- RA: 106541

## Visão geral

O projeto tem como objetivo facilitar a criação e a consulta de restaurantes em uma aplicação web simples. 

Principais funcionalidades:

- Buscar todos os restaurantes cadastrados;
- Cadastrar novos restaurantes por meio de requisições HTTP;
- Expor endpoints REST para integração com aplicações front-end ou testes de API;
- Servir como base para evoluções futuras do sistema.

## Tecnologias utilizadas

- Node.js
- Express.js
- Prisma ORM
- CORS
- JavaScript

## Estrutura do projeto

```text
easyfood_Unifecaf/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── prisma/
│   ├── dev.db
│   └── schema.prisma
├── public/
│   └── index.html
├── src/
│   ├── app.js
│   ├── server.js
│   ├── database/
│   │   └── prisma.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.middleware.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.service.js
│   │   └── catalogo/
│   │       ├── catalog.controller.js
│   │       ├── catalog.routes.js
│   │       └── catalog.service.js
│   └── services/
│       ├── email.service.js
│       └── logger.service.js
├── server.js
├── logs/
│   └── app.log
├── skills-lock.json
├── teste.js
└── node_modules/
```

## Análise do repositório

O repositório apresenta uma solução funcional de backend, com foco em arquitetura simples, organização modular e facilidade de expansão. Entre os pontos relevantes:

- O arquivo `src/server.js` concentra a configuração do servidor Express e os endpoints principais;
- O projeto usa `@prisma/client` para comunicação com o banco de dados;
- A pasta `public` contém a interface HTML inicial da aplicação;
- A pasta `logs` registra eventos operacionais do sistema;
- A API expõe endpoints para listar e criar restaurantes;
- A estrutura é adequada para atividades acadêmicas e provas de desenvolvimento back-end;
- Ainda há espaço para melhorias como validações, CRUD completo e documentação de rotas.

## Endpoints principais

### GET /restaurants
Retorna todos os restaurantes cadastrados.

### POST /restaurants
Cadastra um novo restaurante com os dados enviados no corpo da requisição.

Exemplo de payload:

```json
{
  "name": "Pizzaria do Bairro",
  "category": "Pizza",
  "rating": 4.8
}
```

## Como abrir e executar o projeto

### 1) Abrir o projeto no editor

- Abra a pasta do repositório no VS Code;
- Certifique-se de que a pasta raiz do projeto aparece como `easyfood_Unifecaf`;
- Se necessário, abra o terminal integrado do VS Code e navegue até a pasta do projeto.

### 2) Instalar dependências

```bash
npm install
```

### 3) Executar a aplicação

```bash
npm start
```

A aplicação será iniciada na porta:

```text
http://localhost:3000
```

### 4) Testar a API

Você pode abrir o navegador ou usar ferramentas como Postman/Insomnia para testar endpoints como:

- `GET http://localhost:3000/restaurants`
- `POST http://localhost:3000/restaurants`

### Pré-requisitos

- Node.js instalado;
- npm instalado;
- Dependências do projeto instaladas.

## Observações importantes

O banco local é SQLite e fica em `prisma/dev.db`. As credenciais SMTP devem ser configuradas no `.env` para o envio real de e-mails.

## Conclusão

Este projeto oferece uma base sólida para desenvolvimento de sistemas de delivery ou catálogo de restaurantes. A proposta é clara, didática e funcional, servindo como ponto de partida para versões mais completas no futuro.

## Licença

Este projeto utiliza a licença indicada no arquivo `package.json`, que atualmente está definida como `ISC`.

---

Desenvolvido por Gabriel Targino de Orides - 106541.
