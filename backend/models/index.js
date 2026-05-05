import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Sequelize } from 'sequelize';
import sequelize from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

const db = {};

// Dynamically import all model files in this directory (except this index file)
const files = fs.readdirSync(__dirname).filter(file =>
  file.indexOf('.') !== 0 &&
  file !== basename &&
  file.slice(-3) === '.js' &&
  file.indexOf('.test.js') === -1
);

for (const file of files) {
  const filePath = path.join(__dirname, file);
  const module = await import(pathToFileURL(filePath).href);
  const model = module.default || module;
  if (model && model.name) {
    db[model.name] = model;
  }
}

// If any models export an associate function, call it (compatibility)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate && typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
