import db from '../models/index.js';

async function syncDatabase() {
  try {
    // Sync tất cả các model với database
    // force: true sẽ xóa và tạo lại bảng
    // force: false sẽ không xóa bảng cũ
    await db.sequelize.sync({ force: false });
    console.log('Database synced successfully');

    // Kiểm tra kết nối
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');

  } catch (error) {
    console.error('Unable to sync database:', error);
  } finally {
    // Đóng kết nối
    await db.sequelize.close();
  }
}

// Chạy function
syncDatabase();
