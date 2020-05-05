'use strict';
const dateFormat = require('dateformat');
const {escape} = require('../../database');
const AMINER_EPIDEMIC_API = 'https://innovaapi.aminer.cn/predictor/api/v1/valhalla/hotevents/pneumonia/dxy'; // deprecated

const CHL = {
    areaAPI: 'https://raw.githubusercontent.com/canghailan/Wuhan-2019-nCoV/master/Wuhan-2019-nCoV.csv', // deprecated
    dateAPI: 'https://raw.githubusercontent.com/canghailan/Wuhan-2019-nCoV/master/Data/:date.csv',
    downloadDir: 'public/data/chl-area/',
    expColumns: ['date', 'country', 'province', 'city', 'confirmed', 'cured', 'dead'],
    storyBegins: '2019/12/1',
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
    dateAPI: '', // TODO
    downloadDir: 'public/data/jhu-area/', // TODO
    expColumns: [/*TODO*/],
    storyBegins: '', // TODO
    /**
     * @param row{Object}       row in the csv file, repr in json
     * @return {Object|null}    entry to insert into db, repr in json
     */
    parseRow(row) {
        return;
        // TODO:
        //  Map from row.`Province/State	Country/Region	Last Update	Confirmed	Deaths	Recovered` into:
        //  {date, country, province, city, confirmedCount, curedCount, deadCount}
        //  if the row is not about USA, **just return without any value**
        // TODO YOUR CODE HERE...
        return {
            date: escape(/*TODO*/),
            country: escape(/*TODO*/),
            province: escape(/*TODO*/),
            city: escape(/*TODO*/),
            // active count computed by database
            confirmedCount: escape(/*TODO*/),
            curedCount: escape(/*TODO*/),
            deadCount: escape(/*TODO*/),
        }
    }
};

const EPIDEMIC_DATA_KINDS = ['confirmedCount', 'activeCount', 'curedCount', 'deadCount'];

module.exports = {
    CHL, JHU, EPIDEMIC_DATA_KINDS
};
