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
 * Use a database
 * @param schema{string}
 */
function useDB(schema) {
    return doSql(`USE ${schema}`);
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
 * Insert a data entry into a given table
 * @param table{string}
 * @param entry{Object}
 * @return {Promise<Object>}
 */
function insertEntry(table, entry) {
    let sql = `INSERT INTO ${table} (${Object.keys(entry).join(',')}) VALUES ('${Object.values(entry).join("','")}');`;
    return doSql(sql); // error unhandled
}

/**
 * Insert a data entry batch into a given table
 * @param table{string}
 * @param entries{Object[]} have to make sure they have **the same keys**
 * @return {Promise<Object>}
 */
function insertEntries(table, entries) {
    let sql = `INSERT INTO ${table} (${Object.keys(entries[0]).join(',')}) VALUES `;
    let vals = [];
    for (let entry of entries) {
        vals.push(`('${Object.values(entry).join("','")}')`);
    }
    sql += vals.join(',') + ';';
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
 * Insert multiple epidemic data entries into 'Epidemic' table
 * @param entries{Object[]}
 * @return {Promise<Object>}
 */
function insertEpidemicEntries(entries) {
    return insertEntries('Epidemic', entries);
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
    return doSql(sql).then(res => {
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
    return fetchTable(table).then(res => {
        debug('table fetched:');
        console.log(res);
    }).catch(err => {
        debug('cannot fetch table.');
        throw err;
    })
}

/**
 * Select given fields from the table
 * @param table{string}
 * @param fields{string|string[]}
 * @param conditions{undefined|string|string[]}
 * @param distinct{undefined|boolean} whether to de-duplicate
 * @param extra{undefined|string} as sql suffix
 * @return Promise<Object>
 */
function selectInTable(table, fields, conditions, distinct, extra) {
    if (typeof fields === 'string') fields = [fields];
    let sql = `SELECT ${distinct === true ? 'DISTINCT ' : ''}${fields.join(',')} FROM ${table}`;
    if (conditions) {
        if (typeof conditions === 'string') conditions = [conditions];
        sql += ` WHERE (${conditions.join(') AND (')})`;
    }
    sql += typeof extra === 'string' ? ` ${extra};` : ';';
    return doSql(sql);
}

/**
 * Select given fields from the table
 * @param fields{string|string[]}
 * @param conditions{undefined|string|string[]}
 * @param distinct{undefined|boolean} whether to de-duplicate
 * @param extra{undefined|string} as sql suffix
 * @return Promise<Object>
 */
function selectEpidemicData(fields, conditions, distinct, extra) {
    return selectInTable('Epidemic', fields, conditions, distinct, extra);
}

// todo need faster implementation, eg: cache table
function selectAvailableCities(country, province) {
    return selectInTable('Epidemic', 'city', `country='${country}' and province='${province}'`, true, 'ORDER BY city ASC');
}

function selectAvailableProvinces(country) {
    return selectInTable('Epidemic', 'province', `country='${country}'`, true, 'ORDER BY province ASC');
}

function selectAvailableCountries() {
    return selectInTable('Epidemic', 'country', undefined, true, 'ORDER BY country ASC');
}

function test() {
}

module.exports = {
    useDB, initialize, finalize, test,
    insertEntry, insertEpidemicEntry, insertEntries, insertEpidemicEntries,
    clearTable, fetchTable, showTable, countTableRows,
    selectInTable, selectEpidemicData,
    selectAvailableCities, selectAvailableProvinces, selectAvailableCountries
};
