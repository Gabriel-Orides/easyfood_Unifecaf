const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../../database/prisma");
const imageService = require("../shared/image.service");

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Nunca devolve o hash da senha.
function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl
  };
}

async function register({ name, email, password }) {
  const hash = await bcrypt.hash(password, 10);

  // Se o e-mail já existir, o Prisma lança o erro P2002 (unique constraint).
  const user = await prisma.user.create({
    data: { name, email, password: hash }
  });

  return toPublicUser(user);
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return null;
  }

  const senhaConfere = await bcrypt.compare(password, user.password);

  if (!senhaConfere) {
    return null;
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );

  return {
    token,
    user: toPublicUser(user)
  };
}

async function findUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) }
  });

  if (!user) {
    throw httpError("Usuário não encontrado", 404);
  }

  return user;
}

async function getProfile(userId) {
  return toPublicUser(await findUser(userId));
}

// O userId vem do token (req.user), nunca do corpo ou da URL da requisição.
async function uploadProfileImage(userId, buffer) {
  const user = await findUser(userId);

  let imageUrl;

  try {
    imageUrl = await imageService.optimizeImage(buffer, "users");
  } catch (error) {
    throw httpError("Não foi possível processar a imagem enviada", 400);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { imageUrl }
  });

  await imageService.removeImage(user.imageUrl);

  return toPublicUser(updated);
}

module.exports = {
  register,
  login,
  getProfile,
  uploadProfileImage
};
