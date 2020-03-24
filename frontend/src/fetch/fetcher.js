import vue from 'vue';
import {COMMUNICATION_TEST, GET_EPIDEMIC_DATA} from './apis';

const bs = require('binarysearch');

async function backendCommunicationTest() {
  try {
    let res = await vue.axios.get(COMMUNICATION_TEST);
    console.assert(res.data === 'OK!', `backend communication test failed with wrong response ${res}`);
  } catch (err) {
    vue.$log.error(`backend communication test failed with ${err}`);
  }
}

/**
 * Load one kind of epidemic data of a specified place
 * @param dataKind{string}
 * @param superiorLevel{string}
 * @param superiorPlace{string}
 * @return {Promise<Object>} data of response
 */
async function loadEpidemicData(dataKind, superiorLevel, superiorPlace) {
  try {
    let res = await vue.axios.get(GET_EPIDEMIC_DATA, {params: {dataKind, superiorLevel, superiorPlace}});
    return res.data;
  } catch (err) {
    vue.$log.error('Cannot load epidemic data.', err);
  }
}

export default {
  data: {}, dataKind: '', superiorLevel: '', superiorPlace: '',
  backendCommunicationTest: backendCommunicationTest,

  /**
   * Get one kind of epidemic data of a specified place at a given time
   * @param queryTime{int|string} unix time or local date time string,
   * the function will search for the **lower bound** (not exact) to the query time using **binary search**
   * @param dataKind{string}
   * @param superiorLevel{string}
   * @param superiorPlace{string}
   * @return {Promise<Object[]>} like [{name: '北京', value: '105'}, {name: '天津', value: '3'}, ...]
   */
  getEpidemicDataAtTime: async function (queryTime, dataKind, superiorLevel, superiorPlace) {
    if (typeof queryTime === 'string') {
      queryTime = Date.parse(queryTime) / 1000;  // to unix time
      if (isNaN(queryTime)) {
        throw new Error(`Invalid time string ${queryTime}`);
      }
    }
    if (!this.data || this.dataKind !== dataKind || this.superiorPlace !== superiorPlace || this.superiorLevel !== superiorLevel) {
      // fetch from backend and cache:
      this.data = await loadEpidemicData(dataKind, superiorLevel, superiorPlace);
      this.dataKind = dataKind;
      this.superiorLevel = superiorLevel;
      this.superiorPlace = superiorPlace;
    }
    // already cached:
    let result = [];
    for (let place of this.data.inferiorPlaces) {
      let item = {};
      item.name = place.name;
      let i = bs.closest(place.times, queryTime); // binary search for closest lower bound
      item.value = place.values[i];
      result.push(item);
    }
    return result;
  }
};
