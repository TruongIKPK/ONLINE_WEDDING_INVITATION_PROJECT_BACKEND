import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.middleware';
import setupLogger from './middlewares/logger.middleware';

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true
}));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(express.json());
app.use(errorHandler())
setupLogger(app)