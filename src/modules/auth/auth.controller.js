const authService = require("./auth.service");

async function register(req, res) {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Nome, e-mail e senha são obrigatórios"
    });
  }

  try {
    const user = await authService.register({
      name,
      email,
      password
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "E-mail já cadastrado"
      });
    }

    console.error("Erro ao registrar usuário:", error.message);
    res.status(500).json({
      error: "Erro interno do servidor"
    });
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      error: "E-mail e senha são obrigatórios"
    });
  }

  try {
    const result = await authService.login({
      email,
      password
    });

    if (!result) {
      return res.status(401).json({
        error: "Credenciais inválidas"
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error.message);
    res.status(500).json({
      error: "Erro interno do servidor"
    });
  }
}

function handleError(res, error, logMessage, publicMessage) {
  if (!error.statusCode) {
    console.error(logMessage, error.message);
  }

  return res.status(error.statusCode || 500).json({
    error: error.statusCode ? error.message : publicMessage
  });
}

async function me(req, res) {
  try {
    const user = await authService.getProfile(req.user.id);

    res.json({
      message: "Você está autenticado!",
      user
    });
  } catch (error) {
    handleError(res, error, "Erro ao consultar usuário:", "Erro interno do servidor");
  }
}

async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({
      error: "Nenhuma imagem enviada"
    });
  }

  try {
    const user = await authService.uploadProfileImage(
      req.user.id,
      req.file.buffer
    );

    res.json(user);
  } catch (error) {
    handleError(res, error, "Erro ao processar imagem de perfil:", "Erro ao processar imagem");
  }
}

module.exports = {
  register,
  login,
  me,
  uploadImage
};
