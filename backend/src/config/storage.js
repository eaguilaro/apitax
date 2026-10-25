const fs = require('fs');
const path = require('path');

const backendRoot = path.resolve(__dirname, '../..');
const configuredUploadDir = process.env.UPLOAD_DIR || './uploads';
const uploadDir = path.isAbsolute(configuredUploadDir)
  ? configuredUploadDir
  : path.resolve(backendRoot, configuredUploadDir);

fs.mkdirSync(uploadDir, { recursive: true });

module.exports = { uploadDir };
