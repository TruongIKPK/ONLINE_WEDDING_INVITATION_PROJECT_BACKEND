// middlewares/logger.js
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

const logDirectory = path.join('logs');

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });

const setupLogger = (app) => {
  app.use(morgan('combined', { stream: logStream }));
  app.use(morgan('dev'));
};

export default setupLogger;
