const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const config = require('./config');
const app = express();
const port = config.port;
const fs = require('fs').promises;
const Searcher = require('ip2region').default;
// 临时恢复同步查询用于调试
// const Searcher = require('ip2region');

// 创建MySQL连接池
const pool = mysql.createPool(config.db);
// 初始化数据库
let sqlConfig; // 声明全局变量
// 数据库初始化模块
async function initializeDB() {
  try {
    // 获取数据库连接并选择数据库
    const connection = await pool.getConnection();
    await connection.query(`USE ${config.db.database}`);

    // 从JSON文件加载SQL配置
    sqlConfig = JSON.parse(await fs.readFile('./sql-statements.json', 'utf8'));

    // 依次执行建表语句
    await connection.query(sqlConfig.initialize_quotes);    // 语录表
    await connection.query(sqlConfig.initialize_riddles);   // 谜语表
    await connection.query(sqlConfig.create_stats);        // API统计表
    await connection.query(sqlConfig.create_access_logs);  // 访问日志表
    await connection.query(sqlConfig.create_ip_locations); // IP地理位置表

    // 初始化IP查询引擎
    const searcher = new Searcher({ dbPath: './ip2region.db' });

    // 释放数据库连接
    connection.release();
    console.log('数据库初始化成功');
    // 新增IP地理位置查询接口
    app.get('/ip-location', async (req, res) => {
      try {
        // 参数校验
        const ip = req.query.ip;
        if (!ip) {
          return res.status(400).json({ code: 400, message: '缺少IP参数' });
        }

        // IP解析处理
        const result = searcher.search(ip);
        const province = (result.province || result.country || '').replace(/\\s+/g, '');
        const location = province;

        // 异常结果处理
        if (!location) {
          // console.error('无效的IP查询结果:', ip, '详细信息:', result);
          return res.status(500).json({ 
            code: 500,
            message: '无法解析该IP的地理位置',
            detail: {
              country: country,
              province: province,
              city: result.city || '',
              isp: result.isp || ''
            }
          });
        }

        // 保存地理位置信息
        if (location) {
          const [saveResult] = await pool.query(sqlConfig.save_location, [ip, province]);
          // console.log('数据库保存结果:', saveResult);
        }

        // 记录访问日志
        const clientIP = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim();
        if (!['/stats', '/access-stats', '/ip-location'].includes(req.path)) {
      await pool.query(sqlConfig.log_access, [clientIP, '/ip-location']);
    }

        // 返回成功响应
        res.json({
          code: 200,
          message: 'success',
          data: { ip: ip, province: province }
        });

      } catch (error) {
        // 错误处理及日志记录
        console.error('IP查询失败:', error.stack);
        res.status(500).json({ code: 500, message: 'IP查询服务不可用' });
      }
    });

  } catch (error) {
    // 初始化失败处理
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}
initializeDB();
app.use(cors());
// 获取随机语录接口
// 随机语录接口处理模块
app.get('/quote', async (req, res) => {
  try {
    // 步骤1：获取数据库连接
    const connection = await pool.getConnection();
    
    // 步骤2：执行随机语录查询
    const [rows] = await connection.query(sqlConfig.get_quote);
    
    // 步骤3：立即释放数据库连接
    connection.release();

    // 步骤4：更新接口统计
    if (!['/stats', '/access-stats', '/ip-location'].includes(req.path)) {
      await pool.query(sqlConfig.update_stats, ['/quote']);
    }
    
    // 步骤5：记录访问日志
    const clientIP = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim();
    await pool.query(sqlConfig.log_access, [clientIP, '/quote']);

    // 步骤6：处理查询结果
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
    // 错误处理：记录日志并返回标准错误响应
    console.error('语录查询异常:', error.stack);
    res.status(500).json({
      code: 500,
      message: '服务端查询异常'
    });
  }
});

// 脑筋急转弯接口处理模块
app.get('/riddle', async (req, res) => {
  try {
    // 步骤1：获取数据库连接
    const connection = await pool.getConnection();
    
    // 步骤2：执行随机谜语查询
    const [rows] = await connection.query(sqlConfig.get_riddle);
    
    // 步骤3：立即释放数据库连接
    connection.release();

    // 步骤4：更新接口统计
    if (!['/stats', '/access-stats', '/ip-location'].includes(req.path)) {
      await pool.query(sqlConfig.update_stats, ['/riddle']);
    }
    
    // 步骤5：记录访问日志
    const clientIP = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim();
    await pool.query(sqlConfig.log_access, [clientIP, '/riddle']);

    // 步骤6：处理查询结果
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
    // 错误处理：记录日志并返回标准错误响应
    console.error('谜语查询异常:', error.stack);
    res.status(500).json({
      code: 500,
      message: '服务端查询异常'
    });
  }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// 新增访问统计接口



// 访问统计接口处理模块
app.get('/access-stats', async (req, res) => {
  try {
    // 步骤1：执行访问统计查询
    const [stats] = await pool.query(sqlConfig.get_access_stats);

    // 步骤2：返回标准化响应
    res.json({
      code: 200,
      message: 'success',
      data: stats
    });

    // 步骤3：记录统计查询日志
    const clientIP = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim();
    if (!['/stats', '/access-stats', '/ip-location'].includes(req.path)) {
      await pool.query(sqlConfig.log_access, [clientIP, '/access-stats']);
    }

  } catch (error) {
    // 错误处理：记录日志并返回标准错误
    console.error('访问统计查询失败:', error.stack);
    res.status(500).json({
      code: 500,
      message: '访问统计查询失败'
    });
  }
});

// API统计接口处理模块
app.get('/stats', async (req, res) => {
  try {
    // 步骤1：执行统计查询
    const [stats] = await pool.query(sqlConfig.get_stats);

    // 步骤2：返回标准化响应
    res.json({
      code: 200,
      message: 'success',
      data: stats
    });

    // 步骤3：记录统计查询日志
    const clientIP = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim();
    if (!['/stats', '/access-stats', '/ip-location'].includes(req.path)) {
      await pool.query(sqlConfig.log_access, [clientIP, '/stats']);
    }

  } catch (error) {
    // 错误处理：记录日志并返回标准错误
    console.error('统计查询失败:', error.stack);
    res.status(500).json({
      code: 500,
      message: '统计查询失败'
    });
  }
});
