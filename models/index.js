import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import { Sequelize } from 'sequelize';
import sequelize from '../config/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {};

// Đọc tất cả file model trong thư mục hiện tại (trừ index.js)
const modelFiles = fs.readdirSync(__dirname).filter(file =>
  file.endsWith('.js') && file !== 'index.js'
);

// Import từng model và gọi initModel hoặc gọi như factory
for (const file of modelFiles) {
  const filePath = path.join(__dirname, file);
  const fileURL = pathToFileURL(filePath).href; 

  const { default: modelClass } = await import(fileURL);

  const model = modelClass.initModel
    ? modelClass.initModel(sequelize)
    : modelClass(sequelize);

  db[model.name] = model;
}

// Gọi associate nếu có
for (const modelName of Object.keys(db)) {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
