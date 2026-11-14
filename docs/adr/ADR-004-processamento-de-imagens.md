# ADR-004 - Processamento de imagens

## Status
Aceita

## Data
12/11/2026

## Responsável
Equipe EasyFood

## Contexto
A EasyFood passou a permitir que cada restaurante cadastre os pratos do seu cardápio, e cada prato pode ter uma imagem.

Imagens enviadas por usuários costumam ser grandes (fotos de celular com vários megabytes e milhares de pixels). Servir essas imagens sem tratamento aumenta o tempo de carregamento, o consumo de dados dos clientes e o espaço em disco.

Por isso, a EasyFood precisa **receber, reduzir e converter** as imagens antes de armazená-las. Durante a aula, discutimos onde esse processamento deveria acontecer.

## Alternativas consideradas
1. **Processar dentro da API EasyFood** — Multer recebe o arquivo em memória e o Sharp redimensiona/converte no próprio servidor Node.js.
2. **Criar um serviço independente** — um microsserviço dedicado ao processamento de imagens, chamado pela API ou acionado por fila.
3. **Utilizar Serverless/FaaS** — por exemplo, upload para um bucket (S3) que dispara uma função (AWS Lambda) responsável pelo processamento.

## Decisão
Manter o processamento de imagens **dentro da API EasyFood**, em um serviço compartilhado (`src/modules/shared/image.service.js`):

```
POST /dishes/:dishId/image
  -> authMiddleware
  -> upload.middleware.js (Multer, memória, até 5 MB, JPEG/PNG/WebP)
  -> dish.controller.js
  -> dish.service.js
  -> shared/image.service.js (Sharp: rotate, até 800px de largura, WebP qualidade 80)
  -> uploads/dishes/
  -> Prisma atualiza imageUrl
```

Na Atividade 8 o mesmo serviço passou a atender a foto de perfil do usuário:

```
POST /auth/me/image
  -> authMiddleware (o id do usuário vem do token)
  -> upload.middleware.js
  -> auth.controller.js
  -> auth.service.js
  -> shared/image.service.js (largura máxima de 400px)
  -> uploads/users/
  -> Prisma atualiza User.imageUrl
```

O `image.service.js` recebe a pasta de destino e aplica a configuração de cada tipo de imagem, sem duplicar a lógica de processamento.

## Justificativa
- **Simplicidade:** nenhum componente novo para implantar ou monitorar.
- **Baixo volume inicial de imagens:** a demanda atual não justifica escalar o processamento separadamente.
- **Infraestrutura já existente:** reutiliza o servidor Node.js, o Prisma e o middleware de autenticação.
- **Facilidade de implementação:** duas bibliotecas (Multer e Sharp) resolvem o problema.
- **Contexto acadêmico do projeto:** o foco é entender a decisão e seus trade-offs, não operar infraestrutura distribuída.

## Consequências

### Vantagens
- Menor complexidade inicial.
- Menos componentes para configurar.
- Aproveitamento da infraestrutura existente.
- O serviço fica em `shared/` e já é reutilizado por pratos e fotos de perfil; logotipos de restaurantes podem usar o mesmo caminho.

### Limitações
- Consumo de CPU e memória da API durante o processamento (o arquivo é mantido em memória).
- Possível impacto em outras requisições enquanto imagens grandes são processadas.
- Armazenamento local em `uploads/` não funciona bem com múltiplas instâncias ou sistemas de arquivos temporários (seria necessário um armazenamento externo, como S3).
- As imagens ficam públicas em `/uploads`.
- Necessidade de reavaliar a solução caso o volume cresça.

## Critérios de revisão
Esta decisão deverá ser reavaliada quando:
1. O volume de uploads impactar o tempo de resposta das demais rotas.
2. A API passar a rodar em múltiplas instâncias ou em ambiente com disco efêmero.
3. Forem necessárias várias versões de cada imagem (miniaturas, tamanhos diferentes).

## Notas
Esta decisão não significa que Serverless seja inadequado. Significa que, neste momento, outra alternativa atende melhor às necessidades do projeto.

Uma falha no upload da imagem não invalida o prato já cadastrado: o prato permanece sem imagem e o envio pode ser repetido.
