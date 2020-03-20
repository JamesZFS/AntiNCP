const AMINER_EPIDEMIC_API = 'https://innovaapi.aminer.cn/predictor/api/v1/valhalla/hotevents/pneumonia/dxy';

const DXY = {
    areaAPI: 'https://raw.githubusercontent.com/BlankerL/DXY-COVID-19-Data/master/csv/DXYArea.csv', // Ding XiangYuan
    header2DBField: {
        'updateTime': 'date',
        'provinceName': 'province',
        'cityName': 'city',
        'city_confirmedCount': 'confirmedCount',
        'city_suspectedCount': 'suspectedCount',
        'city_curedCount': 'curedCount',
        'city_deadCount': 'deadCount'
    },
    downloadDir: 'public/data/dxy-area/'
};

const CHL = {
    areaAPI: 'https://raw.githubusercontent.com/canghailan/Wuhan-2019-nCoV/master/Wuhan-2019-nCoV.csv',
    header2DBField: {
        'date': 'date',
        'country': 'country',
        'province': 'province',
        'city': 'city',
        'confirmed': 'confirmedCount',
        'suspected': 'suspectedCount',
        'cured': 'curedCount',
        'dead': 'deadCount'
    },
    downloadDir: 'public/data/chl-area/'
};


module.exports = {
    DXY, CHL,
};
