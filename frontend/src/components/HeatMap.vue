<!-- 热度图组件 -->
<template>
  <div>
    <h1>HeatMap</h1>
    <div id="heatmap" style="width: 80vw;height: 80vh;"></div>
  </div>
</template>

<script>
  import echarts from 'echarts'
  import china from 'echarts/map/js/china'
  import 四川 from 'echarts/map/js/province/sichuan'

  export default {
    name: 'heatmap',
    data () {
    },
    methods: {
      drawheatmap (id) {
        this.charts = echarts.init(document.getElementById(id))
        this.charts.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{b}确诊{c} (人)'
          },
          visualMap: {
            show: false,
            min: 0,
            max: 200,
            text: ['High', 'Low'],
            realtime: false,
            calculable: true,
            inRange: {
              color: ['lightskyblue', 'yellow', 'orangered']
            }
          },
          series: {
            type: 'map',
            map: 'china',
            data: [{name: '北京', value: '105'}, {name: '天津', value: '3'},
              {name: '上海', value: '24'}, {name: '重庆', value: '35'},
              {name: '河北', value: '5'}, {name: '河南', value: '3'},
              {name: '云南', value: '20'}, {name: '辽宁', value: '15'},
              {name: '黑龙江', value: '38'}, {name: '湖南', value: '35'},
              {name: '安徽', value: '0'}, {name: '山东', value: '52'},
              {name: '新疆', value: '0'}, {name: '江苏', value: '10'},
              {name: '浙江', value: '38'}, {name: '江西', value: '11'},
              {name: '湖北', value: '18247'}, {name: '广西', value: '20'},
              {name: '甘肃', value: '34'}, {name: '山西', value: '6'},
              {name: '内蒙古', value: '4'}, {name: '陕西', value: '17'},
              {name: '吉林', value: '1'}, {name: '福建', value: '0'},
              {name: '贵州', value: '21'}, {name: '广东', value: '84'},
              {name: '青海', value: '0'}, {name: '西藏', value: '0'},
              {name: '四川', value: '70'}, {name: '宁夏', value: '4'},
              {name: '海南', value: '3'}, {name: '台湾', value: '29'},
              {name: '香港', value: '53'}, {name: '澳门', value: '0'}
            ]
          }
        })
      }
    },
    //调用
    mounted () {
      this.$nextTick(function () {
        this.drawheatmap('heatmap')
      })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
</style>
