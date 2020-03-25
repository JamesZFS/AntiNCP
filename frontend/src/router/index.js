import Vue from 'vue'
import Router from 'vue-router'
import HomePage from '../components/HomePage'
import PandemicMap from '../components/PandemicMap'
import PandemicReports from "../components/PandemicReports";
import HotWords from "../components/HotWords";
import About from "../components/About";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HomePage',
      component: PandemicMap
    },
    {
      path: '/map',
      name: 'PandemicMap',
      component: PandemicMap
    },
    {
      path: '/report',
      name: 'PandemicReports',
      component: PandemicReports
    },
    {
      path: '/hot',
      name: 'HotWords',
      component: HotWords
    },
    {
      path: '/about',
      name: 'About',
      component: About
    }
  ]
})
