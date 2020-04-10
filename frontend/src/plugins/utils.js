import Vue from 'vue'
import axios from 'axios';
import VueAxios from 'vue-axios';

Vue.use(VueAxios, axios);
Vue.use(require('vue-cookies'));
Vue.$cookies.config('7d'); // default cookie config
