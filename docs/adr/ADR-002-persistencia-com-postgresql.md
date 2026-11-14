# ADR-002 - Persistência com PostgreSQL

## Status
Aceita (substitui o [ADR-001](ADR-001-armazenar-restaurantes-em-memoria.md))

## Data
12/11/2026

## Responsável
Equipe EasyFood

## Contexto
No ADR-001 decidimos armazenar os restaurantes em um array em memória para validar o fluxo inicial da API rapidamente.

O teste de reinicialização mostrou a consequência dessa decisão: ao parar e iniciar o servidor, os restaurantes cadastrados desaparecem, porque a memória do processo Node.js é perdida.

Um dos critérios de revisão do ADR-001 foi atingido: precisamos manter os dados entre reinicializações e deploys. Além disso, a EasyFood já prevê novas entidades relacionadas (usuários, pratos dos restaurantes), o que exige relacionamentos e integridade dos dados.

## Alternativas consideradas
1. **PostgreSQL** — banco relacional, open source, maduro, com chaves estrangeiras, transações e tipos precisos (ex.: `DECIMAL`).
2. **SQLite** — relacional e sem servidor; simples, mas pensado para uso local/embarcado e com limitações de concorrência de escrita.
3. **MongoDB** — orientado a documentos; flexível, mas os dados da EasyFood são naturalmente relacionais (restaurante → pratos, usuários).
4. **Firebase (Firestore)** — gerenciado e sem infraestrutura, mas cria dependência de um fornecedor e dificulta consultas relacionais.
5. **Arquivo JSON** — simples, porém sem concorrência segura, integridade ou consultas.

## Decisão
Utilizar **PostgreSQL** como banco de dados da EasyFood, acessado através do ORM **Prisma**.

A arquitetura passa de:

```
API -> ARRAY EM MEMÓRIA
```

para:

```
Cliente -> Express -> Prisma -> PostgreSQL
```

## Justificativa
- Resolve o problema de persistência: os dados sobrevivem a reinicializações e deploys.
- O domínio da EasyFood é relacional (restaurantes possuem pratos; usuários se autenticam), e o PostgreSQL oferece chaves estrangeiras e integridade referencial.
- Tipos precisos como `DECIMAL` são adequados para notas e preços (evita erros de arredondamento de ponto flutuante).
- É open source, gratuito e amplamente suportado por provedores de nuvem, facilitando uma futura ida para produção.
- O Prisma oferece schema declarativo, migrations versionadas (`prisma/migrations`) e um client com consultas tipadas, reduzindo SQL manual.

## Consequências

### Positivas
- Dados persistentes entre reinicializações.
- Integridade garantida pelo banco (chaves primárias, `UNIQUE` em e-mail de usuário, chaves estrangeiras em pratos).
- Histórico de alterações do banco registrado em migrations.
- Possibilidade de consultas mais complexas e de múltiplas instâncias da API compartilhando o mesmo banco.
- Prisma Studio para inspecionar os dados visualmente.

### Negativas / trade-offs
- É necessário instalar e manter um servidor PostgreSQL (localmente e em produção).
- Nova configuração sensível (`DATABASE_URL`) que precisa ficar no `.env` e fora do repositório.
- A API passa a depender da disponibilidade do banco: se o PostgreSQL ficar indisponível, as rotas retornam `500 Erro interno do servidor`.
- Mais uma camada (Prisma) para aprender e manter, incluindo a etapa de `prisma generate` e a execução de migrations.
- Latência de rede/disco em cada operação, maior que a do acesso à memória.

## Critérios de revisão
Esta decisão deverá ser reavaliada quando:
1. O volume de leitura exigir cache (ex.: Redis) ou réplicas de leitura.
2. Surgirem dados que não se encaixem bem no modelo relacional.
3. O custo de operar o banco próprio justificar um serviço gerenciado.
4. O Prisma deixar de atender às necessidades de desempenho ou de consultas.
