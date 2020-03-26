const host = require('../../backend/config/consts');
// const prefix = process.env.NODE_ENV === 'production' ? `http://${host.REMOTE_HOST_DOMAIN}` : '';
const prefix = '';
export default {
  GET_EPIDEMIC_DATA: `${prefix}/api/retrieve/epidemic`,
  COMMUNICATION_TEST: `${prefix}/api/test`,
  GET_EPIDEMIC_TIMELINE_WORLD: `${prefix}/api/retrieve/epidemic/timeline/world`,
  GET_EPIDEMIC_TIMELINE_COUNTRY: `${prefix}/api/retrieve/epidemic/timeline/country`,
  GET_EPIDEMIC_TIMELINE_PROVINCE: `${prefix}/api/retrieve/epidemic/timeline/province`,
}
