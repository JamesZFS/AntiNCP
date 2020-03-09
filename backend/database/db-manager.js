const fs = require('fs');
const debug = require('debug')('backend:db-manager');
const mysql = require('mysql');
const dbCfg = require('../config/db-cfg').LOCAL_MYSQL_CFG; // you may choose a different mysql server
const connection = mysql.createConnection(dbCfg);
const initializingScriptPath = 'database/db-initialize.sql';

/**
 * Do an mysql command asynchronously
 * @param sql{string}
 * @returns {Promise}
 */
function doSql(sql) {
    // sql = "use AntiNCP;";
    return new Promise(function (resolve, reject) {
        connection.connect();
        connection.query(sql, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
        connection.end();
    })
}

/**
 * Do multiple mysql commands in order
 * @param sqls{Array<string>}
 * @returns {Promise}
 */
function doSqlSequential(sqls) {
    sql = sqls.join(' ');
    return doSql(sql);
}

function initialize() {
    return doSql(fs.readFileSync(initializingScriptPath, 'utf8')).then((res) => {
        debug('Database initialized successfully.');
        debug(JSON.stringify(res));
    }).catch((err) => {
        console.error("Database error: initializing failed.", err);
        throw err;
    });
}

module.exports = {
    initialize
};
