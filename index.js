const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const config = require('./config');
const app = express();
const port = 35710;

// 创建MySQL连接池
const pool = mysql.createPool(config.db);

// 初始化数据库
async function initializeDB() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`USE ${config.db.database}`);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL
      );
    `);
    connection.release();
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}
initializeDB();
app.use(cors());

// 获取随机语录接口
app.get('/quote', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM quotes ORDER BY RAND() LIMIT 1');
    connection.release();

    res.json({
      code: 200,
      message: 'success',
      data: rows[0].content
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '数据库查询失败'
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
