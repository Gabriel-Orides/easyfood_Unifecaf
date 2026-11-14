const sharp = require("sharp");
const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");

// Pastas permitidas dentro de uploads/ e a largura máxima de cada tipo de imagem.
// Novos módulos (ex.: logotipo de restaurante) só precisam de uma nova entrada aqui.
const IMAGE_TYPES = {
  dishes: { width: 800 },
  users: { width: 400 }
};

const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");

async function optimizeImage(buffer, folder = "dishes") {
  const config = IMAGE_TYPES[folder];

  if (!config) {
    throw new Error(`Tipo de imagem desconhecido: ${folder}`);
  }

  const filename = `${crypto.randomUUID()}.webp`;
  const directory = path.join(UPLOADS_ROOT, folder);

  await fs.mkdir(directory, {
    recursive: true
  });

  await sharp(buffer)
    .rotate()
    .resize({
      width: config.width,
      withoutEnlargement: true
    })
    .webp({
      quality: 80
    })
    .toFile(path.join(directory, filename));

  return `/uploads/${folder}/${filename}`;
}

// Remove uma imagem anterior (ex.: ao trocar a foto). Falhas são ignoradas,
// pois a imagem nova já foi salva e vinculada.
async function removeImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) {
    return;
  }

  const filePath = path.resolve(process.cwd(), "." + imageUrl);

  if (!filePath.startsWith(UPLOADS_ROOT + path.sep)) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Não foi possível remover a imagem antiga:", error.message);
  }
}

module.exports = {
  optimizeImage,
  removeImage
};
