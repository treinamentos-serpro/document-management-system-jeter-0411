function requireOwner(req, res, next) {
  const owner = req.get('X-User-Id')?.trim();

  if (!owner) {
    return res.status(400).json({
      error: {
        code: 'USER_ID_REQUIRED',
        message: 'O cabeçalho X-User-Id é obrigatório.'
      }
    });
  }

  req.owner = owner;
  next();
}

module.exports = requireOwner;