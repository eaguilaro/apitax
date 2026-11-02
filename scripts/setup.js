const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const manualEnvPath = path.join(projectRoot, 'backend', '.env');

const dockerEngine = spawnSync('docker', ['info'], { stdio: 'ignore' });
if (dockerEngine.status !== 0) {
  console.error('Docker no está iniciado o no se puede acceder al motor.');
  process.exit(1);
}

// Reuse the image version of an existing container so setup never upgrades an old data volume implicitly.
function mongoImageForExistingInstall() {
  const container = spawnSync('docker', [
    'inspect',
    '--format',
    '{{.Config.Image}}',
    'apitax-mongodb'
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

  if (container.status === 0 && container.stdout.trim()) {
    return container.stdout.trim();
  }

  const legacyVolume = spawnSync('docker', [
    'volume',
    'inspect',
    'apitax_mongodb_data'
  ], { stdio: 'ignore' });
  return legacyVolume.status === 0 ? 'mongo:6.0' : 'mongo:8.0';
}

// Preserve the encryption key when moving an existing manual install into Docker.
function existingManualSecret(name) {
  if (!fs.existsSync(manualEnvPath)) return undefined;
  const prefix = `${name}=`;
  const line = fs.readFileSync(manualEnvPath, 'utf8')
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(prefix));
  return line ? line.slice(prefix.length).trim() : undefined;
}

if (!fs.existsSync(envPath)) {
  const manualJwtSecret = existingManualSecret('JWT_SECRET');
  const manualTotpKey = existingManualSecret('AUTH_TOTP_ENCRYPTION_KEY');
  const manualSetupToken = existingManualSecret('AUTH_SETUP_TOKEN');

  // Se conservan las claves manuales válidas para que la cuenta existente siga funcionando.
  const variables = {
    NODE_ENV: 'development',
    MONGO_IMAGE: mongoImageForExistingInstall(),
    APP_BIND_ADDRESS: '127.0.0.1',
    APP_PORT: '8080',
    FRONTEND_ORIGIN: 'http://localhost:8080',
    AUTH_SETUP_TOKEN: manualSetupToken || crypto.randomBytes(24).toString('hex'),
    JWT_SECRET: manualJwtSecret && manualJwtSecret.length >= 32
      ? manualJwtSecret
      : crypto.randomBytes(48).toString('hex'),
    AUTH_TOTP_ENCRYPTION_KEY: /^[a-f0-9]{64}$/i.test(manualTotpKey || '')
      ? manualTotpKey
      : crypto.randomBytes(32).toString('hex')
  };
  const contents = [
    '# Secretos locales generados por scripts/setup.js. No subir este archivo al repositorio.',
    ...Object.entries(variables).map(([name, value]) => `${name}=${value}`)
  ].join('\n') + '\n';

  fs.writeFileSync(envPath, contents, { flag: 'wx', mode: 0o600 });
  console.log('Se creó .env local con secretos nuevos o reutilizados de backend/.env.');
} else {
  console.log('Se conserva el .env existente; no se sobrescribió su configuración.');
}

console.log('Iniciando MongoDB, API y frontend con Docker Compose...');
const result = spawnSync('docker', ['compose', 'up', '-d', '--build'], {
  cwd: projectRoot,
  stdio: 'inherit'
});

if (result.error) {
  console.error(`No se pudo ejecutar Docker Compose: ${result.error.message}`);
  process.exit(1);
}
if (result.status !== 0) {
  process.exit(result.status || 1);
}

console.log('\nInstalación iniciada. Abre http://localhost:8080 para configurar la cuenta propietaria.');
console.log('El token inicial está en .env, en AUTH_SETUP_TOKEN. Guárdalo y retíralo después de configurar la cuenta.');
