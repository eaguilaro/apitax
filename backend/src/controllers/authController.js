const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const { COOKIE_NAME, cookieOptions } = require('../middleware/requireAuth');

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const ISSUER = 'API TAX';

function securityConfigurationIsReady() {
  return Boolean(
    process.env.JWT_SECRET &&
    process.env.JWT_SECRET.length >= 32 &&
    /^[a-f0-9]{64}$/i.test(process.env.AUTH_TOTP_ENCRYPTION_KEY || '')
  );
}

function encryptionKey() {
  if (!/^[a-f0-9]{64}$/i.test(process.env.AUTH_TOTP_ENCRYPTION_KEY || '')) {
    throw new Error('AUTH_TOTP_ENCRYPTION_KEY debe contener 64 caracteres hexadecimales');
  }
  return Buffer.from(process.env.AUTH_TOTP_ENCRYPTION_KEY, 'hex');
}

function encryptSecret(secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return [iv.toString('hex'), cipher.getAuthTag().toString('hex'), encrypted.toString('hex')].join('.');
}

function decryptSecret(value) {
  const [ivHex, tagHex, encryptedHex] = value.split('.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]).toString('utf8');
}

function secretMatches(candidate, expected) {
  if (typeof candidate !== 'string' || typeof expected !== 'string') return false;
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return candidateBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
}

function validTotpStep(secret, token) {
  if (!/^\d{6}$/.test(String(token || ''))) return null;
  const delta = speakeasy.totp.verifyDelta({
    secret,
    encoding: 'base32',
    token: String(token),
    window: 1
  });
  return !delta ? null : Math.floor(Date.now() / 30000) + delta.delta;
}

function setSessionCookie(res, user) {
  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '8h',
    issuer: ISSUER
  });
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge: SESSION_DURATION_MS
  });
}

const status = async (req, res, next) => {
  try {
    const user = await User.findOne({ accountKey: 'owner' }).select('_id enabled');
    res.json({
      success: true,
      setupRequired: !user || !user.enabled,
      accountConfigured: Boolean(user && user.enabled),
      authReady: securityConfigurationIsReady() &&
        (Boolean(user && user.enabled) || Boolean(process.env.AUTH_SETUP_TOKEN))
    });
  } catch (error) {
    next(error);
  }
};

const startSetup = async (req, res, next) => {
  try {
    if (!securityConfigurationIsReady() || !process.env.AUTH_SETUP_TOKEN) {
      return res.status(503).json({
        success: false,
        message: 'Configura AUTH_SETUP_TOKEN, JWT_SECRET y AUTH_TOTP_ENCRYPTION_KEY en .env (o backend/.env en modo manual)'
      });
    }

    const { setupToken, email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!secretMatches(setupToken, process.env.AUTH_SETUP_TOKEN)) {
      return res.status(403).json({ success: false, message: 'La clave de configuración no es válida' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Ingresa un correo electrónico válido' });
    }
    if (typeof password !== 'string' || password.length < 12) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 12 caracteres' });
    }

    const secret = speakeasy.generateSecret({ length: 20 });
    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: normalizedEmail,
      issuer: ISSUER,
      encoding: 'base32'
    });
    const qrCode = await QRCode.toDataURL(otpAuthUrl);
    const passwordHash = await bcrypt.hash(password, 12);

    await User.findOneAndUpdate(
      { accountKey: 'owner', enabled: false },
      {
        $set: {
          email: normalizedEmail,
          passwordHash,
          totpSecret: encryptSecret(secret.base32),
          lastTotpStep: -1
        },
        $setOnInsert: { accountKey: 'owner', enabled: false }
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: 'Escanea el código QR con tu aplicación de autenticación y confirma con el código de 6 dígitos.',
      qrCode,
      manualKey: secret.base32
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Ya existe una cuenta activada' });
    }
    next(error);
  }
};

const verifySetup = async (req, res, next) => {
  try {
    const user = await User.findOne({ accountKey: 'owner', enabled: false })
      .select('+totpSecret +lastTotpStep');
    if (!user) {
      return res.status(409).json({ success: false, message: 'Primero inicia la configuración de la cuenta' });
    }

    const secret = decryptSecret(user.totpSecret);
    const step = validTotpStep(secret, req.body.code);
    if (step === null || step <= user.lastTotpStep) {
      return res.status(400).json({ success: false, message: 'El código no es válido o ya fue utilizado' });
    }

    const enabledUser = await User.findOneAndUpdate(
      { _id: user._id, enabled: false, lastTotpStep: { $lt: step } },
      { $set: { enabled: true, lastTotpStep: step } },
      { new: true }
    );
    if (!enabledUser) {
      return res.status(400).json({ success: false, message: 'El código de autenticación ya fue utilizado' });
    }

    setSessionCookie(res, enabledUser);
    res.json({ success: true, user: { email: enabledUser.email } });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    if (!securityConfigurationIsReady()) {
      return res.status(503).json({ success: false, message: 'La autenticación no está configurada en el servidor' });
    }

    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const user = await User.findOne({ accountKey: 'owner', email, enabled: true })
      .select('+passwordHash +totpSecret +lastTotpStep');
    const passwordMatches = user
      ? await bcrypt.compare(String(req.body.password || ''), user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
    }

    const step = validTotpStep(decryptSecret(user.totpSecret), req.body.code);
    if (step === null || step <= user.lastTotpStep) {
      return res.status(401).json({ success: false, message: 'El código de autenticación no es válido o ya fue utilizado' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, enabled: true, lastTotpStep: { $lt: step } },
      { $set: { lastTotpStep: step } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(401).json({ success: false, message: 'El código de autenticación ya fue utilizado' });
    }

    setSessionCookie(res, updatedUser);
    res.json({ success: true, user: { email: updatedUser.email } });
  } catch (error) {
    next(error);
  }
};

const me = (req, res) => {
  res.json({ success: true, user: { email: req.authUser.email } });
};

const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.json({ success: true });
};

module.exports = { status, startSetup, verifySetup, login, me, logout };
