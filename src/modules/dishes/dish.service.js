const prisma = require("../../database/prisma");
const imageService = require("../shared/image.service");

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseId(value, label) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(`${label} inválido`, 400);
  }

  return id;
}

function validateDish(data) {
  const { name, description, price } = data || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    throw httpError("O nome do prato é obrigatório", 400);
  }

  if (!description || typeof description !== "string" || !description.trim()) {
    throw httpError("A descrição do prato é obrigatória", 400);
  }

  const numericPrice = Number(price);

  if (price === undefined || price === null || price === "" ||
      !Number.isFinite(numericPrice) || numericPrice <= 0) {
    throw httpError("O preço deve ser um número maior que zero", 400);
  }

  return {
    name: name.trim(),
    description: description.trim(),
    price: numericPrice
  };
}

async function createDish(restaurantId, data) {
  const id = parseId(restaurantId, "Identificador do restaurante");
  const dishData = validateDish(data);

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id
    }
  });

  if (!restaurant) {
    throw httpError("Restaurante não encontrado", 404);
  }

  const dish = await prisma.dish.create({
    data: {
      name: dishData.name,
      description: dishData.description,
      price: dishData.price,
      restaurantId: id
    }
  });

  return dish;
}

async function listDishes(restaurantId) {
  const id = parseId(restaurantId, "Identificador do restaurante");

  return prisma.dish.findMany({
    where: {
      restaurantId: id
    },
    orderBy: { id: "asc" }
  });
}

async function uploadDishImage(dishId, buffer) {
  const id = parseId(dishId, "Identificador do prato");

  const dish = await prisma.dish.findUnique({
    where: {
      id
    }
  });

  if (!dish) {
    throw httpError("Prato não encontrado", 404);
  }

  let imageUrl;

  try {
    imageUrl = await imageService.optimizeImage(buffer, "dishes");
  } catch (error) {
    // O mimetype vem do cliente; se o Sharp não decodifica, o arquivo não é uma imagem válida.
    throw httpError("Não foi possível processar a imagem enviada", 400);
  }

  const updated = await prisma.dish.update({
    where: {
      id
    },
    data: {
      imageUrl
    }
  });

  await imageService.removeImage(dish.imageUrl);

  return updated;
}

module.exports = {
  createDish,
  listDishes,
  uploadDishImage
};
