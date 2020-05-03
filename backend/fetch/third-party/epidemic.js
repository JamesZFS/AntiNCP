'use strict';
const dateFormat = require('dateformat');
const {escape} = require('../../database');
const AMINER_EPIDEMIC_API = 'https://innovaapi.aminer.cn/predictor/api/v1/valhalla/hotevents/pneumonia/dxy';

const DXY = {
    areaAPI: 'https://raw.githubusercontent.com/BlankerL/DXY-COVID-19-Data/master/csv/DXYArea.csv', // Ding XiangYuan
    downloadDir: 'public/data/dxy-area/',
    expColumns: [
        'updateTime',
        'countryName',
        'provinceName',
        'province_confirmedCount',
        'province_curedCount',
        'province_deadCount',
        'cityName',
        'city_confirmedCount',
        'city_curedCount',
        'city_deadCount'
    ],
    /**
     * @param row{Object}  row in the csv file, repr in json
     * @return {Object}    entry to insert into db, repr in json
     */
    parseRow(row) {
        let result = {
            date: escape(dateFormat(new Date(row.updateTime), 'yyyy-mm-dd')),
            country: escape(row.countryName),
            province: escape(row.provinceName === row.countryName ? '' : row.provinceName),
            city: escape(row.cityName === row.provinceName ? '' : row.cityName)
        };
        if (row.city_confirmedCount) { // a city row
            Object.assign(result, {
                confirmedCount: escape(row.city_confirmedCount || '0'),
                curedCount: escape(row.city_curedCount || '0'),
                deadCount: escape(row.city_deadCount || '0'),
            })
        } else { // a province / country row
            Object.assign(result, {
                confirmedCount: escape(row.province_confirmedCount || '0'),
                curedCount: escape(row.province_curedCount || '0'),
                deadCount: escape(row.province_deadCount || '0'),
            })
        }
        return result;
    }
};

const CHL = {
    areaAPI: 'https://raw.githubusercontent.com/canghailan/Wuhan-2019-nCoV/master/Wuhan-2019-nCoV.csv',
    dateAPI: 'https://raw.githubusercontent.com/canghailan/Wuhan-2019-nCoV/master/Data/:date.csv',
    downloadDir: 'public/data/chl-area/',
    expColumns: ['date', 'country', 'province', 'city', 'confirmed', 'cured', 'dead'],
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

const EPIDEMIC_DATA_KINDS = ['confirmedCount', 'activeCount', 'curedCount', 'deadCount'];

module.exports = {
    DXY, CHL, EPIDEMIC_DATA_KINDS
};
