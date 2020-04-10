import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home'
import Map from '@/views/Map'
import Trends from '@/views/Trends';
import Reports from '@/views/Reports';
import About from '@/views/About';
import NotFound from "@/views/NotFound";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: '主页',
      component: Home
    },
    {
      path: '/map',
      name: '疫情地图',
      component: Map
    },
    {
      path: '/trends',
      name: '热点关注',
      component: Trends
    },
    {
      path: '/reports',
      name: '疫情报道',
      component: Reports
    },
    {
      path: '/about',
      name: '关于我们',
      component: About
    },
    {
      path: '*',
      component: NotFound,
    }
  ]
})
