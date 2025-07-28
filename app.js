import express from 'express';
import db from './models/index.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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

app.listen(port, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});
