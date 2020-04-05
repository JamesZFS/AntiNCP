// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
import axios from 'axios';
import VueAxios from 'vue-axios';
import VueLogger from 'vuejs-logger';
import loggerCfg from '../config/logger';

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(VueAxios, axios);
Vue.use(VueLogger, loggerCfg);
Vue.use(require('vue-cookies'));
Vue.$cookies.config('7d'); // default cookie config
import Vuetify from 'vuetify'
import vuetify from '@/plugins/vuetify'
Vue.use(Vuetify)
/* eslint-disable no-new */
new Vue({
  vuetify,
  el: '#app',
  router,
  components: {App},
  template: '<App/>'
});
