import Vue from 'vue'
import Router from 'vue-router'
import HomePage from '@/components/HomePage'
import Page1 from '@/components/Page1'
import Page2 from '@/components/Page2'
import Page3 from '@/components/Page3'
import Page4 from '@/components/Page4'
// import HeatMap from '@/components/Heatmap'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Page1',
      component: Page1
    },
    {
      path: '/1',
      name: 'Page1',
      component: Page1
    },
    {
      path: '/2',
      name: 'Page2',
      component: Page2
    },
    {
      path: '/3',
      name: 'Page3',
      component: Page3
    },
    {
      path: '/4',
      name: 'Page4',
      component: Page4
    }
    // {
    //   path: '/heatmap',
    //   name: 'HeatMap',
    //   component: HeatMap
    // }
  ]
})
