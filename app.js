import express from 'express';
import session from 'express-session';
import passport from './config/passport.js';
import db from './models/index.js';
import templateRoutes from './routes/template.routes.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for OAuth (optional, since we're using JWT)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Database test endpoints
app.get('/test-db', async (req, res) => {
  try {
    await db.sequelize.authenticate();
    
    res.json({ message: '✅ Kết nối DB thành công!' });
  } catch (error) {
    console.error('❌ Chi tiết lỗi kết nối:', error);
    res.status(500).json({ error: '❌ Không thể kết nối DB.', details: error.message });
  }
});

app.post('/test-db', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!db.User) {
      return res.status(400).json({ error: '⚠️ Model User chưa được định nghĩa.' });
    }

    const user = await db.User.create({ username, email, password });

    res.json({
      message: '🎉 Đã tạo user thành công!',
      data: user
    });
  } catch (error) {
    console.error('❌ Lỗi khi tạo user:', error);
    res.status(500).json({ error: 'Lỗi khi tạo user.' });
  }
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});
