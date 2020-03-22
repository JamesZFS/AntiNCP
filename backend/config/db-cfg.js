const LOCAL_MYSQL_CFG = {
    host: '127.0.0.1',
    user: 'root',
    password: 'mdty2020',
    port: '3306',
    multipleStatements: true,
};

const THUCG_MYSQL_CFG = {
    host: '127.0.0.1',
    user: 'root',
    password: 'mdty2020',
    port: '3336',
    multipleStatements: true,
};

const TENCENT_MYSQL_CFG = {
    host: '129.204.207.38',
    user: 'root',
    password: 'mdty2020',
    port: '3306',
    multipleStatements: true,
};

const EPIDEMIC_DATA_KINDS = ['confirmedCount', 'suspectedCount', 'curedCount', 'deadCount'];

module.exports = {LOCAL_MYSQL_CFG, THUCG_MYSQL_CFG, TENCENT_MYSQL_CFG, EPIDEMIC_DATA_KINDS};