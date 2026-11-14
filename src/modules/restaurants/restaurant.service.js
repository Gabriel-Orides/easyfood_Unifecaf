const prisma = require("../../database/prisma");
const emailService = require("../shared/email.service");

const { escapeHtml } = emailService;

async function listRestaurants() {
  return prisma.restaurant.findMany({
    orderBy: { id: "asc" }
  });
}

async function createRestaurant(data) {
  // 1. Operação principal
  const restaurant = await prisma.restaurant.create({
    data: {
      name: data.name,
      category: data.category,
      rating: data.rating || 0,
      email: data.email || null
    }
  });

  const name = escapeHtml(restaurant.name);
  const category = escapeHtml(restaurant.category);

  // 2. Ações secundárias: uma falha no e-mail não desfaz o cadastro.
  try {
    await emailService.sendEmail({
      to: restaurant.email || process.env.EMAIL_TEST_TO,
      toName: restaurant.name,
      subject: `Bem-vindo à EasyFood, ${restaurant.name}!`,
      header: `Olá, ${name}!`,
      body: `
        Seu restaurante foi cadastrado com sucesso
        na EasyFood.<br/>
        Categoria: ${category}.
      `,
      footer: "Equipe EasyFood"
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error.message);
  }

  try {
    await emailService.sendEmail({
      to: process.env.COMMERCIAL_EMAIL || process.env.EMAIL_TEST_TO,
      toName: "Comercial EasyFood",
      subject: `Novo restaurante cadastrado: ${restaurant.name}`,
      header: "Novo restaurante na plataforma",
      body: `
        Nome: ${name}<br/>
        Categoria: ${category}<br/>
        Avaliação: ${restaurant.rating}
      `,
      footer: "Notificação automática - EasyFood"
    });
  } catch (error) {
    console.error("Erro ao notificar o comercial:", error.message);
  }

  // 3. Retorno da operação principal
  return restaurant;
}

module.exports = {
  listRestaurants,
  createRestaurant
};
