const LOCAL_MYSQL_CFG = {
    host: 'localhost',
    user: 'root',
    password: 'mdty2020',
    port: '3306',
    multipleStatements: true,
};

const TENCENT_MYSQL_CFG = { // only for testing purpose
    host: '129.204.207.38',
    user: 'root',
    password: 'mdty2020',
    port: '3306',
    multipleStatements: true,
};

module.exports = {LOCAL_MYSQL_CFG, TENCENT_MYSQL_CFG};