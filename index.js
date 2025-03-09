const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const config = require('./config');
const app = express();
const port = config.port;
const fs = require('fs').promises;

// 创建MySQL连接池
const pool = mysql.createPool(config.db);
// 初始化数据库
let sqlConfig; // 声明全局变量
async function initializeDB() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`USE ${config.db.database}`);
    // 从JSON配置读取SQL语句
    sqlConfig = JSON.parse(await fs.readFile('./sql-statements.json', 'utf8'));
    // 分别执行两个创建表语句
    await connection.query(sqlConfig.initialize_quotes);
    await connection.query(sqlConfig.initialize_riddles);
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
    const [rows] = await connection.query(sqlConfig.get_quote);
    connection.release();

    if(rows.length > 0) {
      res.json({
        code: 200,
        message: 'success',
        data: rows[0].content
      });
    } else {
      res.status(404).json({
        code: 404,
        message: '未找到语录数据'
      });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '数据库查询失败'
    });
  }
});
// 新增脑筋急转弯接口
app.get('/riddle', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(sqlConfig.get_riddle);
    connection.release();
    if(rows.length > 0) {
      res.json({
        code: 200,
        message: 'success',
        data: {
          question: rows[0].question,
          answer: rows[0].answer
        }
      });
    } else {
      res.status(404).json({
        code: 404,
        message: '未找到脑筋急转弯数据'
      });
    }
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
