const fs = require('fs');
const path = require('path');
const debug = require('debug')('backend:database');
const mysql = require('mysql');
const chalk = require('chalk');
const dbCfg = process.env.REMOTE_DB
    ? require('../config/db-cfg').TENCENT_MYSQL_CFG
    : require('../config/db-cfg').LOCAL_MYSQL_CFG; // you may choose a different mysql server
const initializingScriptPath = path.resolve(__dirname, './initialize.sql');

/**
 * Insist reconnecting until connection is make, throw unrecoverable error if fails
 * @return {Promise<void>}
 */
async function insistConnecting() {
    debug(`Connecting to ${dbCfg.host}:${dbCfg.port}`);
    connection = mysql.createConnection(dbCfg); // Recreate the connection, since the old one cannot be reused.
    return new Promise((resolve, reject) => connection.connect(err => {
        if (err) { // The server is either down or restarting (takes a while sometimes).
            console.error('Database error: when trying to connect to db,', chalk.red(err.message));
            debug("Attempting to reconnect in 2 sec...");
            // We introduce a delay before attempting to reconnect,
            // to avoid a hot loop, and to allow our node script to process asynchronous requests in the meantime.
            setTimeout(() => insistConnecting()
                .then(() => resolve())
                .catch(err => reject(err)), 2000); // Unhandleable error
        } else {
            debug("Connected.");
            resolve();
        }
    }));
}

/**
 * Try to (re)connecting to database
 * @return {Promise<void>}
 */
async function handleDisconnect() {
    try {
        await insistConnecting();
    } catch (err) {
        console.error('Database error: cannot connect to db!');
        throw err;
    }
    // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            debug('Connection lost, attempting to reconnect...');
            initialize();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            console.error('Unknown database connection error.');
            throw err;                                  // server variable configures this)
        }
    });
}

async function reconnect() {
    return handleDisconnect();
}

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
 * @return {Promise<void>}
 */
async function initialize() {
    // Load init script:
    try {
        await reconnect();
        await doSql(fs.readFileSync(initializingScriptPath, 'utf8'));
        await finalize();
        await reconnect(); // To make sure script takes effect
        await useDB('AntiNCP');
    } catch (err) {
        console.error("Database error: initializing failed.");
        throw err;
    }
    debug('Initialized successfully.');
}

/**
 * Finalize db. Call at most once
 * @return {Promise<void>}
 */
async function finalize() {
    return new Promise(resolve => {
        try {
            connection.end(() => {
                debug('disconnected.');
                resolve();
            });
        } catch (e) {
            resolve();
        }
    });
}

/**
 * Insert a data entry into a given table
 * @param table{string}
 * @param entry{Object}
 * @return {Promise<Object>}
 */
function insertEntry(table, entry) {
    let sql = `INSERT INTO ${table} (${Object.keys(entry).join(',')}) VALUES (${Object.values(entry).join(',')});`;
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
        vals.push(`(${Object.values(entry).join(',')})`);
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
     activeCount: 12,
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
 * @return {Promise<int>}
 */
async function countTableRows(table) {
    let res = await doSql(`SELECT COUNT(*) AS count FROM ${table};`);
    return res[0].count;
}

/**
 * Select given fields from the table
 * @param table{string}
 * @param fields{string|string[]}
 * @param conditions{undefined|string|string[]}
 * @param distinct{boolean} whether to de-duplicate
 * @param extra{string} as sql suffix
 * @return Promise<Object>
 */
function selectInTable(table, fields, conditions, distinct = false, extra = '') {
    if (typeof fields === 'string') fields = [fields];
    let sql = `SELECT ${distinct ? 'DISTINCT ' : ''}${fields.join(',')} FROM ${table} `;
    if (conditions) {
        if (typeof conditions === 'string') conditions = [conditions];
        sql += `WHERE (${conditions.join(') AND (')}) `;
    }
    sql += extra;
    return doSql(sql);
}

/**
 * Select given fields from the table, **be aware of injection attack!**
 * @param fields{string|string[]}
 * @param conditions{undefined|string|string[]}
 * @param distinct{undefined|boolean} whether to de-duplicate
 * @param extra{undefined|string} as sql suffix
 * @return Promise<Object>
 */
function selectEpidemicData(fields, conditions, distinct, extra) {
    return selectInTable('Epidemic', fields, conditions, distinct, extra);
}

function selectAvailableCities(country, province) {
    return selectInTable('Places', 'city', `country=${country} AND province=${province} AND city<>''`, true, 'ORDER BY city ASC');
}

function selectAvailableProvinces(country) {
    return selectInTable('Places', 'province', `country=${country} AND province<>'' AND city=''`, true, 'ORDER BY province ASC');
}

function selectAvailableCountries() {
    return selectInTable('Places', 'country', null, true, 'ORDER BY country ASC');
}

/**
 * Clear and reload available places from source table (should contain field `country`, `province`, and `city`)
 * @param sourceTable{string}
 * @return {Promise<Object>}
 */
function refreshAvailablePlaces(sourceTable = 'Epidemic') {
    return doSqls([
        'TRUNCATE TABLE Places;', // clear
        `INSERT INTO Places (country, province, city) SELECT DISTINCT country, province, city FROM ${sourceTable};`
    ]);
}

/**
 * Insert if not exist and update client info
 * @param ip{string}
 * @return {Promise<Object>}
 */
async function updateClientInfo(ip) {
    return doSqls([
        `INSERT IGNORE INTO Clients (ip) VALUES (${ip});`,
        `UPDATE Clients SET reqCount=reqCount+1, prevReqTime=NOW() WHERE ip=${ip} LIMIT 1;`
    ]);
}

/**
 * Get client info
 * @param ip{string}
 * @return {Promise<Object>}
 */
async function getClientInfo(ip) {
    return doSql(`SELECT * FROM Clients WHERE ip=${ip} LIMIT 1`);
}

/**
 * Insert a new article data entry into 'Articles' table, skip when link duplicates
 * ref: https://blog.csdn.net/fly910905/article/details/79634483
 * @param entry{Object}
 * @return {Promise<Object>}
 */
function insertArticleEntry(entry) {
    return doSql(
        `INSERT INTO Articles (${Object.keys(entry).join(',')}) SELECT ${Object.values(entry).join(',')} ` +
        `FROM DUAL WHERE NOT EXISTS (SELECT id FROM Articles WHERE link=${entry.link});`
    );
}

/**
 * Insert multiple article data entries into 'Articles' table, skip when link duplicates
 * ref: https://blog.csdn.net/fly910905/article/details/79634483
 * @param entries{Object[]}
 * @return {Promise<Object>}
 */
async function insertArticleEntries(entries) {
    await doSqls(['DROP TABLE IF EXISTS Articles_tmp;', 'CREATE TABLE Articles_tmp LIKE Articles;']);
    await insertEntries('Articles_tmp', entries);  // insert all into tmp table first
    const cols = Object.keys(entries[0]).join(',');
    await doSql(
        `INSERT INTO Articles (${cols}) SELECT ${cols} FROM Articles_tmp ` +
        `WHERE NOT EXISTS (SELECT id FROM Articles WHERE link=Articles_tmp.link);`
    );
    return doSql('DROP TABLE Articles_tmp;');
}

/**
 * Call mysql escapeId
 * @param id{string}
 * @return {string}
 */
function escapeId(id) {
    return mysql.escapeId(id);
}

/**
 * Call mysql escape
 * @param value{string}
 * @return {string}
 */
function escape(value) {
    return mysql.escape(value);
}


module.exports = {
    initialize, finalize, escapeId, escape,
    insertEntry, insertEpidemicEntry, insertEntries, insertEpidemicEntries,
    clearTable, fetchTable, countTableRows, selectInTable, selectEpidemicData,
    selectAvailableCities, selectAvailableProvinces, selectAvailableCountries, refreshAvailablePlaces,
    insertArticleEntry, insertArticleEntries,
    updateClientInfo, getClientInfo
};
