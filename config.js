// 数据库配置模块
module.exports = {
  db: {
    host: '你的数据库地址，例子(mysql9.serv00.com)',
    user: '用户名',
    password: '密码',
    database: '数据库名',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
};