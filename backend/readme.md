# AntiNCP Backend

版本 0.1.0

## 生成文档

在 backend/ 目录下执行 `apidoc -i . -e 'node_modules/*'` 即可自动在该目录下生成 doc/ 目录，浏览器查看其中的 index.html 即可看到后端api文档。



## 数据库

### 测试阶段数据库连接方法：

#### 本地版本

1. [下载 mysql server](https://dev.mysql.com/downloads/file/?id=492745) 并安装。
2. 按教程完成设置，建议密码用 `mdty2020` 这样与配置文件一致，为了兼容性请**用legacy模式密码**。在mac设置面板里启动 mysql server。
3. 修改后端的数据库配置为该服务器对应的配置`LOCAL_MYSQL_CFG`。



#### 清华网版本

1. 开 SSLVPN 连接 Tsinghua 网代理服务器。
2. 在终端输入命令 `ssh -N -L 3336:127.0.0.1:3306 james@server-03.thucg.com` ，输入密码后，相当于把 本地网络端口 `localhost:3336` 通过tunnel连接到了ZFS的实验室服务器的 mysql server 端口，以后我们的 backend api 只要访问 `localhost:3336` （注意是3336，而不是3306，后者是本机的mysql server的默认端口）就相当于访问数据库服务器。[参考这里](https://linuxize.com/post/mysql-ssh-tunnel/)
3. 修改后端的数据库配置为该服务器对应的配置`THUCG_MYSQL_CFG`，默认已经选用，无需修改。

