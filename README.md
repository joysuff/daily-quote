# daily-quote
可以部署在serv00免费主机上的每日一言接口

# 使用方法

1. 在serv00面板新建一个网站

   - 在Port reservation开放一个端口
   - 在www websites新建一个网站，选择proxy，端口选上一步开放的端口

2. 新建数据库（使用mysql数据库）

3. 下载项目文件修改配置

   - 在项目文件中找到config.js,内容如下

     ```js
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
     ```

     修改端口和数据库信息(要与第二步创建的数据库一致)

4. 将该好的项目文件打包上传到domans\你的域名\public html\目录下（或直接在该目录下git仓库，记得修改配置）

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

7. **注意：一定要启动项目之后再去数据库面板增加数据（执行程序会自动创建数据表）**

8. 向数据库填充数据（在控制面板打开数据库后台）

   - quote表数据插入示例

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

   - riddles表数据插入示例

     ```sql
     INSERT INTO riddles (question, answer) VALUES 
     ('什么东西越洗越脏，不洗有人吃，洗了没人吃？', '水'),
     ('什么东西往上升永远掉不下来？', '年龄'),
     ('什么鸡没有翅膀？', '田鸡'),
     ('有一个字，人人见了都会念错，是什么字？', '错'),
     ('小华在家里，和谁长得最像？', '自己'),
     ('什么车子寸步难行？', '风车'),
     ('哪一个月有二十八天？', '每个月都有28天'),
     ('你知道上课睡觉有什么不好吗？', '不如床上舒服嘛'),
     ('什么酒不能喝？', '碘酒'),
     ('火车由北京到上海需要6小时，行使3小时后，火车该在什么地方？', '在车轨上'),
     ('时钟什么时候不会走？', '时钟本来就不会走');
     ```

9. 访问接口

   - quote接口(访问：你的域名/quote)

     显示

     ```json
     {
       "code": 200,
       "message": "success",
       "data": "你若盛开，清风自来。"
     }
     ```

   - 脑筋急转弯接口（访问：你的域名/riddle）

     显示

     ```json
     {
       "code": 200,
       "message": "success",
       "data": {
         "question": "火车由北京到上海需要6小时，行使3小时后，火车该在什么地方？",
         "answer": "在车轨上"
       }
     }
     ```

> 到这里你的接口就能开始使用了

# 目前所有接口

1. /quote：（每日一言）

   ```json
   {
       "code": 200,
       "message": "success",
       "data": "做一个积极向上的人，读温柔的句子，见阳光的人，眼里全是温柔和笑意。"
   }
   ```

2. /riddle：（脑筋急转弯）

   ```json
   {
     "code": 200,
     "message": "success",
     "data": {
       "question": "用铁锤锤鸡蛋为什么锤不破？",
       "answer": "铁锤当然不会破了"
     }
   }
   ```

3. /stats：（统计接口访问数量）

   ```json
   {
     "code": 200,
     "message": "success",
     "data": [
       {
         "endpoint": "/riddle",
         "count": 44,
         "last_accessed": "2025-03-10T11:34:44.000Z"
       },
       {
         "endpoint": "/quote",
         "count": 77,
         "last_accessed": "2025-03-10T11:33:51.000Z"
       }
     ]
   }
   ```

4. /access-stats：（访问接口的用户数据）

   ```json
   {
     "code": 200,
     "message": "success",
     "data": [
       {
         "ip": "18.182.35.251",
         "access_time": "2025-03-10T11:34:44.000Z",
         "endpoint": "/riddle"
       },
       {
         "ip": "18.182.35.251",
         "access_time": "2025-03-10T11:34:39.000Z",
         "endpoint": "/riddle"
       },
       {
         "ip": "18.182.35.251",
         "access_time": "2025-03-10T11:33:51.000Z",
         "endpoint": "/quote"
       },
       {
         "ip": "18.182.35.251",
         "access_time": "2025-03-10T11:33:48.000Z",
         "endpoint": "/quote"
       }
     ]
   }
   ```

5. /ip-location?ip=目标IP地址 （查询ip所在地）

   ```json
   Test Case: Empty IP
   Response:
   {
     "code": 400,
     "message": "缺少IP参数"
   }
   
   Test Case: Invalid IP Format
   Response:
   {
     "code": 500,
     "message": "IP查询服务不可用"
   }
   
   Test Case: IPv6 Address
   Response:
   {
     "code": 500,
     "message": "IP查询服务不可用"
   }
   ```

# 在这里可以查看接口状态

[接口状态]: https://768451.xyz

