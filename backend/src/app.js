// Seed do servidor backend do Document Management System.
//
// As camadas do backend são organizadas de forma simples:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', documentRoutes);

// Endpoint de verificação de saúde.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = error.code === 'LIMIT_FILE_SIZE'
    ? 413
    : error.statusCode || 500;
  const code = error.code === 'LIMIT_FILE_SIZE'
    ? 'FILE_TOO_LARGE'
    : error.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    error: {
      code,
      message: statusCode >= 500 ? 'Erro interno do servidor.' : error.message,
    },
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
