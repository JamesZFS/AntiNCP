# AntiNCP Backend

版本 0.1.3

## 启动方法

### 快速启动

`npm run start`

适用于数据库中已有内容，不需要刷新时。

### 启动并重新加载数据库

`npm run reload` 

适用于需要刷新数据库内容或发布时。

### 启动、下载并加载最新数据

`npm run download`

适用于需要更新数据源时，注意下载会比较耗时。

## 生成文档

在 backend/ 目录下执行 `npm run api` 即可

## 数据库

### 测试阶段数据库连接方法：

#### 本地版本

1. [下载 mysql server](https://dev.mysql.com/downloads/file/?id=492745) 并安装。
2. 按教程完成设置，建议密码用 `mdty2020` 这样与配置文件一致，为了兼容性请**用legacy模式密码**。在mac设置面板里启动 mysql server。
3. 修改后端的数据库配置为该服务器对应的配置`LOCAL_MYSQL_CFG`。

#### 远程测试版本

- 需要开启腾讯云服务器，并把服务器上 `/etc/mysql/mysql.conf.d/mysqld.cnf` 配置文件中的 `bind-access` 设置为 `0.0.0.0`；
- 在本地测试环境，`backend/database/db-manager` 头部的 `LOCAL_MYSQL_CFG` 需改为 `TENCENT_MYSQL_CFG`
- **测试完建议立即解除服务器上的端口绑定**，置 `bind-access` 为 `127.0.0.1`

### ONLY_FULL_GROUP_BY 问题的解决

目前已支持 backend server 自动检测和修复本问题，运维者无需担心~

详见[CSDN](https://blog.csdn.net/ieayoio/article/details/79543899)
