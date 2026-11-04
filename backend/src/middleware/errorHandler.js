const multer = require('multer');

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === 'LIMIT_FILE_SIZE';
    return res.status(tooLarge ? 413 : 400).json({
      error: {
        code: tooLarge ? 'FILE_TOO_LARGE' : 'INVALID_UPLOAD',
        message: tooLarge
          ? 'O arquivo excede o limite permitido.'
          : 'A requisição de upload é inválida.'
      }
    });
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocorreu um erro interno.'
    }
  });
}

module.exports = errorHandler;