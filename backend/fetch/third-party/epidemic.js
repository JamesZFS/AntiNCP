'use strict';
const dateFormat = require('dateformat');
const {escape} = require('../../database');
const AMINER_EPIDEMIC_API = 'https://innovaapi.aminer.cn/predictor/api/v1/valhalla/hotevents/pneumonia/dxy'; // deprecated
// const debug = require('debug')('backend:third-party/epidemic');

const CHL = {
    areaAPI: 'https://raw.githubusercontent.com/canghailan/Wuhan-2019-nCoV/master/Wuhan-2019-nCoV.csv', // deprecated
    dateAPI: 'https://raw.githubusercontent.com/canghailan/Wuhan-2019-nCoV/master/Data/:date.csv',
    apiDateFormat: 'yyyy-mm-dd',
    downloadDir: 'public/data/chl-area/',
    expColumns: ['date', 'country', 'province', 'city', 'confirmed', 'cured', 'dead'],
    storyBegins: '2019/12/1',
    hasProvinceData: true,
    /**
     * @param row{Object}  row in the csv file, repr in json
     * @return {Object}    entry to insert into db, repr in json
     */
    parseRow(row) {
        return {
            date: escape(row.date),
            country: escape(row.country),
            province: escape(row.province),
            city: escape(row.city),
            // active count computed by database
            confirmedCount: escape(row.confirmed || '0'),
            curedCount: escape(row.cured || '0'),
            deadCount: escape(row.dead || '0'),
        }
    }
};

// For USA data only
const JHU = {
    dateAPI: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/:date.csv',
    apiDateFormat: 'mm-dd-yyyy',
    downloadDir: 'public/data/jhu-area/',
    expColumns: ['Confirmed', 'Deaths', 'Recovered'],
    storyBegins: '2020/1/22',
    hasProvinceData: false,
    sourceCountry: '美国',
    /**
     * @param row{Object}       row in the csv file, repr in json
     * @return {Object|null}    entry to insert into db, repr in json
     */
    parseRow(row) {
        let dateForDatabase = dateFormat(row['Last_Update'] || row['Last Update'], 'yyyy-mm-dd');
        let cur_country = row.Country_Region || row['Country/Region'];
        if (cur_country !== 'US') return;
        return {
            date: escape(dateForDatabase),
            country: escape('美国'),
            province: escape(row.Province_State || row['Province/State']),
            city: escape(row.Admin2 || ''),
            // active count computed by database
            confirmedCount: escape(row.Confirmed || '0'),
            curedCount: escape(row.Recovered || '0'),
            deadCount: escape(row.Deaths || '0'),
        }
    }
};

const EPIDEMIC_DATA_KINDS = ['confirmedCount', 'activeCount', 'curedCount', 'deadCount'];

module.exports = {
    CHL, JHU, EPIDEMIC_DATA_KINDS
};
