const multer = require("multer");

// Middleware global de erros.
// Garante que falhas (ex.: upload inválido) virem respostas HTTP adequadas
// em vez de derrubar a aplicação.
// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "Imagem maior que o limite permitido (5 MB)"
      });
    }

    return res.status(400).json({
      error: `Erro no upload: ${error.message}`
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "JSON inválido no corpo da requisição"
    });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      error: error.message
    });
  }

  console.error("Erro inesperado:", error);
  return res.status(500).json({
    error: "Erro interno do servidor"
  });
}

module.exports = errorHandler;
