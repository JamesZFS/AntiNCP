const AMINER_EPIDEMIC_API = 'https://innovaapi.aminer.cn/predictor/api/v1/valhalla/hotevents/pneumonia/dxy';
const AMINER_EPIDEMIC_API_UPDATE_INTERVAL = 12 * 3600 * 1000; // 12 hours

const DXY_AREA_API = 'https://raw.githubusercontent.com/BlankerL/DXY-COVID-19-Data/master/csv/DXYArea.csv'; // Ding XiangYuan
const DXY_AREA_API_UPDATE_INTERVAL = 12 * 3600 * 1000; // 12 hours

module.exports = {
    AMINER_EPIDEMIC_API, AMINER_EPIDEMIC_API_UPDATE_INTERVAL,
    DXY_AREA_API, DXY_AREA_API_UPDATE_INTERVAL
};
