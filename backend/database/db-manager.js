const fs = require('fs');
const debug = require('debug')('backend:db-manager');
const mysql = require('mysql');
const dbCfg = require('../config/db-cfg').LOCAL_MYSQL_CFG; // you may choose a different mysql server
const connection = mysql.createConnection(dbCfg);
const initializingScriptPath = 'database/db-initialize.sql';

/**
 * Do an mysql command asynchronously
 * @param sql{string}
 * @returns {Promise<Object>}
 */
function doSql(sql) {
    return new Promise(function (resolve, reject) {
        connection.query(sql, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    })
}

/**
 * Schedule multiple mysql commands in order
 * @param sqls{Array<string>}
 * @returns {Promise<Object>}
 */
function doSqls(sqls) {
    sql = sqls.join(' ');
    return doSql(sql);
}

/**
 * Initialize db. Call once before listening
 * @return {Promise<Object>}
 */
function initialize() {
    connection.connect(() => debug('connected.'));
    return doSql(fs.readFileSync(initializingScriptPath, 'utf8')).then((res) => {
        debug('Database initialized successfully.');
        return Promise.resolve(res);
    }).catch((err) => {
        console.error("Database error: initializing failed.");
        throw err;
    });
}

/**
 * Finalize db. Call at most once
 */
function finalize() {
    connection.end(() => debug('disconnected.'));
}

/**
 * Insert a new epidemic data entry into a given table
 * @param table{string}
 * @param entry{Object}
 * @return {Promise<Object>}
 */
function insertEntry(table, entry) {
    let sql = `INSERT INTO ${table} (${Object.keys(entry).join(',')}) VALUES ('${Object.values(entry).join("','")}');`;
    return doSql(sql); // error unhandled
}

/**
 * Insert a new epidemic data entry into 'Epidemic' table
 * @param entry{Object}
 * @return {Promise<Object>}
 * @example
 insertEpidemicEntry({
     time: '2020-3-9 10:00:30',
     country: 'China',
     province: '四川省',
     city: '成都',
     confirmedCount: 10,
     suspectedCount: 12,
     curedCount: 13,
     deadCount: 5,
 }).then((res) => {
     debug('insert success.');
     debug(res);
 }).catch((err) => {
     debug('insert failed.');
     console.error(err.message);
 });
 */
function insertEpidemicEntry(entry) {
    return insertEntry('Epidemic', entry);
}

/**
 * Clear the whole table
 * @param table{string}
 * @return {Promise}
 */
function clearTable(table) {
    let sql = `TRUNCATE TABLE ${table};`;
    return doSql(sql);
}

/**
 * Fetch the whole table
 * @param table{string}
 * @return {Promise}
 */
function fetchTable(table) {
    let sql = `SELECT * FROM ${table};`;
    return doSql(sql);
}

/**
 * Count table rows
 * @param table{string}
 */
function countTableRows(table) {
    let sql = `SELECT COUNT(*) FROM ${table};`;
    doSql(sql).then(res => {
        debug('table fetched:');
        console.log('Row count:', res);
    }).catch(err => {
        debug('cannot fetch table.');
        throw err;
    })
}

/**
 * @param table{string}
 */
function showTable(table) {
    fetchTable(table).then(res => {
        debug('table fetched:');
        console.log(res);
    }).catch(err => {
        debug('cannot fetch table.');
        throw err;
    })
}

function test() {
    // let table = 'Epidemic';
    // let entry = {
    //     time: '2020-3-9 10:00:30',
    //     country: 'China',
    //     province: '四川省',
    //     city: '成都',
    //     confirmedCount: 10,
    //     suspectedCount: 12,
    //     curedCount: 13,
    //     deadCount: 5,
    // };
    // insertEpidemicEntry(entry);
    // insertEpidemicEntry(entry);
    // insertEpidemicEntry(entry);
    // showTable(table);
    // clearTable(table);
    // showTable(table);
}

module.exports = {
    initialize, finalize, test,
    insertEntry, insertEpidemicEntry,
    clearTable, fetchTable, showTable, countTableRows
};
