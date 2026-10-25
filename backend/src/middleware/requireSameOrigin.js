const requireSameOrigin = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

  const requestOrigin = req.get('origin');
  const configuredOrigin = process.env.FRONTEND_ORIGIN;
  const developmentOrigins = process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];
  const sameHostOrigin = `${req.protocol}://${req.get('host')}`;
  const allowedOrigins = [configuredOrigin, sameHostOrigin, ...developmentOrigins].filter(Boolean);

  if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
    return res.status(403).json({ success: false, message: 'Origen de solicitud no permitido' });
  }

  next();
};

module.exports = requireSameOrigin;
