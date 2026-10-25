const jwt = require('jsonwebtoken');
const User = require('../models/User');

const COOKIE_NAME = 'apitax_session';

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/'
});

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Autenticación requerida' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'API TAX'
    });
    const user = await User.findOne({ _id: payload.sub, enabled: true }).select('_id email');
    if (!user) {
      return res.status(401).json({ success: false, message: 'La sesión ya no es válida' });
    }

    req.authUser = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'La sesión expiró; inicia sesión de nuevo' });
    }
    next(error);
  }
};

module.exports = { requireAuth, COOKIE_NAME, cookieOptions };
