# ADR-003 - Autenticação com JWT

## Status
Aceita

## Data
12/11/2026

## Responsável
Equipe EasyFood

## Contexto
Após a organização em camadas (Missão 4), a EasyFood passou a permitir o cadastro de restaurantes por qualquer pessoa que acessasse a API. Operações que modificam dados precisam saber **quem** está fazendo a requisição.

A aplicação é um monólito modular em Node.js/Express, com PostgreSQL e Prisma, em contexto acadêmico e com baixo volume de usuários.

## Alternativas consideradas
1. **JWT próprio** (`jsonwebtoken` + `bcryptjs`) — login com e-mail e senha, token assinado pela própria API.
2. **AWS Cognito** — serviço gerenciado de identidade, com MFA, recuperação de senha e escalabilidade.
3. **Login com Google (OAuth 2.0 / OpenID Connect)** — o usuário se autentica com a conta Google.
4. **Sessão em servidor** (cookie + sessão armazenada) — modelo tradicional com estado no servidor.

## Decisão
Implementar autenticação com **JWT** dentro do novo módulo `src/modules/auth/`:

- `POST /auth/register` — cadastra o usuário com senha em hash (bcrypt).
- `POST /auth/login` — confere a senha e devolve um JWT válido por 1 dia.
- `GET /auth/me` — rota protegida de verificação.
- `auth.middleware.js` — protege rotas de escrita (`POST /restaurants`, cadastro de pratos e upload de imagens).

## Justificativa
- Encaixa-se na arquitetura existente como mais um módulo (routes, controller, service, middleware).
- Sem dependência de serviços externos nem custo adicional.
- Stateless: a API não precisa guardar sessões, o que facilita múltiplas instâncias no futuro.
- Permite entender na prática hash de senha, emissão e validação de tokens.

## Consequências

### Positivas
- Rotas de leitura continuam públicas; rotas de escrita exigem token.
- Senhas nunca são armazenadas em texto puro.
- Middleware reutilizável por qualquer módulo.

### Negativas / trade-offs
- A equipe passa a ser responsável pela segurança das credenciais (hash, segredo, validações).
- Um token emitido não pode ser revogado antes de expirar sem um mecanismo adicional (ex.: lista de bloqueio).
- O `JWT_SECRET` precisa ficar no `.env` e ser forte; vazá-lo compromete todos os tokens.
- Funcionalidades como recuperação de senha, MFA e login social precisariam ser implementadas manualmente.
- Autenticação não é autorização: hoje qualquer usuário autenticado pode alterar o cardápio de qualquer restaurante.

## Critérios de revisão
Esta decisão deverá ser reavaliada quando:
1. For necessário login social, MFA ou recuperação de senha.
2. Houver necessidade de revogar tokens imediatamente.
3. Surgirem perfis de acesso (ex.: dono do restaurante, administrador).
4. O volume de usuários justificar um provedor de identidade gerenciado (ex.: Cognito).
