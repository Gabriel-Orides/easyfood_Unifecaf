# EasyFood API

Projeto acadêmico da disciplina **Software Architecture & Design Patterns** (Unifecaf): uma API REST para restaurantes e seus cardápios, desenvolvida em Node.js com Express, Prisma e PostgreSQL.

## Informações do autor

- Nome: Gabriel Targino de Orides
- RA: 106541

## Funcionalidades

- Consulta e cadastro de restaurantes (cadastro protegido por JWT).
- Cadastro, login e identificação de usuários com JWT e senhas em hash (bcrypt).
- Envio de e-mails por um serviço compartilhado e genérico (`sendEmail`).
- Cardápio: cadastro e consulta de pratos de cada restaurante.
- Upload de imagens dos pratos e da foto de perfil do usuário, otimizadas com Sharp (WebP) por um serviço compartilhado.
- Interface HTML simples em `public/index.html`.

## Tecnologias

- Node.js + Express
- PostgreSQL + Prisma ORM
- jsonwebtoken + bcryptjs (autenticação)
- dotenv (variáveis de ambiente)
- Nodemailer (envio de e-mail via SMTP)
- Multer + Sharp (upload e processamento de imagens)

## Arquitetura

Monólito modular organizado em camadas:

```
Cliente -> Routes -> Controller -> Service -> Database (Prisma) -> PostgreSQL
```

```text
easyfood_Unifecaf/
├── docs/
│   └── adr/                      # Registros de decisões arquiteturais
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
├── public/
│   └── index.html
├── src/
│   ├── database/
│   │   └── prisma.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.middleware.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.service.js
│   │   ├── dishes/
│   │   │   ├── dish.controller.js
│   │   │   ├── dish.routes.js
│   │   │   └── dish.service.js
│   │   ├── restaurants/
│   │   │   ├── restaurant.controller.js
│   │   │   ├── restaurant.routes.js
│   │   │   └── restaurant.service.js
│   │   └── shared/
│   │       ├── email.service.js
│   │       ├── error.middleware.js
│   │       ├── image.service.js
│   │       └── upload.middleware.js
│   └── app.js                    # Configura a aplicação
├── uploads/
│   ├── dishes/                   # Imagens dos pratos
│   └── users/                    # Fotos de perfil
├── .env.example
└── server.js                     # Liga o servidor
```

## Decisões arquiteturais (ADRs)

| ADR | Decisão | Status |
| --- | --- | --- |
| [ADR-001](docs/adr/ADR-001-armazenar-restaurantes-em-memoria.md) | Armazenar restaurantes em memória | Substituída |
| [ADR-002](docs/adr/ADR-002-persistencia-com-postgresql.md) | Persistência com PostgreSQL + Prisma | Aceita |
| [ADR-003](docs/adr/ADR-003-autenticacao-com-jwt.md) | Autenticação com JWT | Aceita |
| [ADR-004](docs/adr/ADR-004-processamento-de-imagens.md) | Processamento de imagens dentro da API | Aceita |

## Como executar

### Pré-requisitos

- Node.js (LTS) e npm
- PostgreSQL instalado e em execução

### 1) Instale as dependências

```bash
npm install
```

### 2) Crie o banco

No `psql` (ou SQL Shell no Windows):

```sql
CREATE DATABASE easyfood;
```

### 3) Configure o `.env`

Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `JWT_SECRET` e as configurações de e-mail. O `.env` não deve ser enviado ao repositório.

### 4) Crie as tabelas e popule o banco

```bash
npx prisma migrate dev
npm run db:seed
```

### 5) Inicie a aplicação

```bash
node server.js
```

```text
EasyFood rodando na porta 3000
```

Para visualizar os dados: `npx prisma studio` (http://localhost:5555).

## Endpoints

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/restaurants` | — | Lista restaurantes |
| POST | `/restaurants` | JWT | Cadastra restaurante e envia e-mails |
| POST | `/auth/register` | — | Cadastra usuário |
| POST | `/auth/login` | — | Retorna um JWT |
| GET | `/auth/me` | JWT | Dados do usuário autenticado (inclui `imageUrl`) |
| POST | `/auth/me/image` | JWT | Envia foto de perfil (form-data, campo `image`) |
| GET | `/restaurants/:restaurantId/dishes` | — | Lista pratos do restaurante |
| POST | `/restaurants/:restaurantId/dishes` | JWT | Cadastra prato |
| POST | `/dishes/:dishId/image` | JWT | Envia imagem do prato (form-data, campo `image`) |
| GET | `/uploads/dishes/<arquivo>.webp` | — | Imagem otimizada do prato |
| GET | `/uploads/users/<arquivo>.webp` | — | Foto de perfil otimizada |

Rotas protegidas exigem o header `Authorization: Bearer <token>`.

### Exemplos

```json
// POST /restaurants
{ "name": "Taco Loco", "category": "Mexicana", "rating": 4.3 }

// POST /restaurants/1/dishes
{ "name": "Pizza Margherita", "description": "Molho de tomate, queijo e manjericão", "price": 49.90 }
```

O campo `email` do restaurante é opcional; quando ausente, o e-mail de boas-vindas vai para `EMAIL_TEST_TO`. Uma falha no envio de e-mail não impede o cadastro.

### Respostas de erro do upload

| Situação | Status |
| --- | --- |
| Sem arquivo | 400 |
| Formato não permitido / arquivo que não é imagem | 400 |
| Arquivo maior que 5 MB | 413 |
| Sem JWT | 401 |
| Prato inexistente | 404 |

Uma falha no upload não apaga o prato nem altera o usuário: o registro continua com a imagem anterior (ou sem imagem) e o envio pode ser repetido.

## Comparação das imagens (Atividade 7)

Teste realizado com uma imagem gerada para o experimento:

| | Formato | Tamanho | Dimensões |
| --- | --- | --- | --- |
| Original | JPEG | 258,7 KB | 3000 x 2000 |
| Otimizada | WebP | 39,1 KB | 800 x 533 |

A imagem foi redimensionada para 800px de largura (mantendo a proporção) e convertida para WebP com qualidade 80, ficando cerca de 85% menor. O resultado depende da imagem original: uma imagem pequena e já comprimida pode não diminuir.

## Atividade 8 — Imagens de perfil e de pratos

### Parte 1 — Cadastro de pratos

O repositório do professor não estava disponível neste ambiente, então a correção foi conferida contra as causas mais comuns do erro no cadastro de pratos:

- **`restaurantId` chega como texto.** Parâmetros de rota (`req.params`) são sempre strings, e o Prisma rejeita uma string em um campo `Int` (`Expected Int, provided String`). O `dish.service.js` converte e valida o identificador com `parseId` antes de consultar o banco.
- **Restaurante inexistente.** Sem a verificação prévia, a chave estrangeira gera um erro do Prisma (`P2003`) que vira `500`. O service consulta o restaurante e devolve `404`.
- **Relação no schema.** O `@relation(fields: [restaurantId], references: [id])` do modelo `Dish` foi escrito em uma única linha, pois a versão quebrada em várias linhas não passa na validação do Prisma 6.

Teste: `POST /restaurants/1/dishes` retorna `201 Created` e o prato fica associado ao restaurante 1.

### Partes 2 a 4 — Upload de imagens

- O modelo `User` ganhou o campo `imageUrl` (migration `add_user_image`).
- `POST /auth/me/image` usa o **id do token** (`req.user.id`), nunca um id enviado na requisição; assim um usuário só altera a própria foto.
- `POST /dishes/:dishId/image` atualiza o `imageUrl` do prato, que é retornado em `GET /restaurants/:restaurantId/dishes`.
- Os dois módulos usam o mesmo `shared/upload.middleware.js` (Multer) e o mesmo `shared/image.service.js` (Sharp). O serviço recebe a pasta de destino (`dishes` ou `users`) e aplica a largura máxima de cada tipo (800px para pratos, 400px para perfil). Ao trocar uma imagem, a anterior é apagada.

### Parte 5 — Testes realizados

| Teste | Resultado |
| --- | --- |
| Cadastrar um prato | `201 Created` |
| Enviar foto para o perfil autenticado | `200`, `imageUrl` em `/uploads/users/` |
| Enviar foto para um prato | `200`, `imageUrl` em `/uploads/dishes/` |
| Consultar os dados atualizados (`/auth/me` e cardápio) | Caminho da imagem retornado |
| Acessar a URL da imagem | `200 image/webp` |
| Enviar imagem sem JWT | `401 Unauthorized` |
| Enviar arquivo inválido (.txt / falso PNG / > 5 MB / sem arquivo) | `400` / `400` / `413` / `400` |
| Enviar imagem para prato inexistente | `404 Not Found` |

### Parte 6 — Pense como arquiteto

- **Por que reutilizar o serviço de imagens?** A regra de otimização (girar, redimensionar, converter para WebP, salvar) fica em um único lugar. Uma correção ou mudança de formato vale para pratos e perfis ao mesmo tempo, e um novo tipo de imagem só precisa de uma nova entrada de configuração.
- **Controller x Service.** O controller trata HTTP: lê `req.params`, `req.file` e `req.user`, e escolhe o status da resposta. O service contém a regra de negócio: valida, verifica se o registro existe, chama o processamento de imagem e atualiza o banco. Ele não conhece `req` nem `res`.
- **Por que não processar nas rotas?** As rotas só ligam URL, middlewares e controller. Colocar lógica nelas misturaria responsabilidades, duplicaria código entre módulos e dificultaria testes.
- **Como o middleware protege a foto de perfil?** O `auth.middleware.js` roda antes do Multer: sem token válido a requisição para com `401` e o arquivo nem é lido. Com token válido, o id do usuário vem do JWT assinado, que o cliente não consegue forjar sem o `JWT_SECRET`.
- **E se o processamento falhar?** O Sharp lança erro, o service responde `400` e o banco não é alterado: o prato ou usuário mantém a imagem anterior.
- **A arquitetura permite evoluir sem mexer em tudo?** Sim. A foto de perfil exigiu um campo novo no schema, uma rota, um método no controller e um no service do módulo `auth`, reaproveitando os serviços de `shared/` sem alterar o módulo de pratos.

---

Desenvolvido por Gabriel Targino de Orides - 106541.
