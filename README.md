# daily-quote
可以部署在serv00免费主机上的每日一言接口

# 使用方法

1. 在serv00面板新建一个网站

   - 在Port reservation开放一个端口
   - 在www websites新建一个网站，选择proxy，端口选上一步开放的端口

2. 新建数据库（使用mysql数据库）

3. 修改配置

   - 在项目文件中找到config.js,内容如下

     ```js
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
     ```

     改成第二步新建的数据库的信息

   - 找到index.js

     ```js
     const express = require('express');
     const cors = require('cors');
     const mysql = require('mysql2/promise');
     const config = require('./config');
     const app = express();
     const port = 35710;
     ```

     将port改成你在面板开放的端口

4. 将该好的项目问价打包上传到domans\你的域名\public html\目录下

5. 安装pm2

   ```bash
   bash <(curl -s https://raw.githubusercontent.com/k0baya/alist_repl/main/serv00/install-pm2.sh)
   ```

   > 如果安装完成后执行 `pm2` 提示命令未找到，你可以断开 SSH 连接，再重新连接，即可

6. cd到domans\你的域名\public html\

   - 启动项目

     ```bash
     pm2 start index.js --name daily-quote
     ```

     ```bash
     pm2 save
     ```

7. 向数据库填充数据

   ```sql
   INSERT INTO quotes (content) VALUES 
   ('生活不止眼前的苟且，还有诗和远方。——高晓松'),
   ('走自己的路，让别人说去吧。——但丁'),
   ('冬天到了，春天还会远吗？——雪莱'),
   ('人的生命，似洪水奔流，不遇着岛屿和暗礁，难以激起美丽的浪花。——奥斯特洛夫斯基'),
   ('世界上最宽阔的是海洋，比海洋更宽阔的是天空，比天空更宽阔的是人的胸怀。——雨果'),
   ('如果说我比别人看得更远些，那是因为我站在了巨人的肩上。——牛顿'),
   ('横眉冷对千夫指，俯首甘为孺子牛。——鲁迅'),
   ('其实地上本没有路，走的人多了，也便成了路。——鲁迅');
   ```

8. 浏览器访问 `你的域名/quote`

   显示

   ```json
   {
     "code": 200,
     "message": "success",
     "data": "生活原本沉闷，但跑起来就会有风。"
   }
   ```

   说明项目部署成功。

