const express = require('express');
const { rateLimit } = require('express-rate-limit');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();
const attemptsLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos. Espera 15 minutos y vuelve a intentar.' }
});

router.get('/status', authController.status);
router.post('/setup/start', attemptsLimit, authController.startSetup);
router.post('/setup/verify', attemptsLimit, authController.verifySetup);
router.post('/login', attemptsLimit, authController.login);
router.get('/me', requireAuth, authController.me);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;
