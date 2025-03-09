// 数据库配置模块
module.exports = {
  port: 35710,
  db: {
    host: 'localhost',
    user: 'root',
    password: '000000',
    database: 'daily_quotes',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
};