<!-- 热度图组件 -->
<template>
  <div>
    <h1>HeatMap</h1>
    <div id="heatmap" style="width: 600px;height: 400px;"></div>
  </div>
</template>

<script>
  import echarts from 'echarts'

  export default {
    name: 'heatmap',
    data () {
      return {
        charts: '',
        opinion: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎'],
        opinionData: [
          {value: 335, name: '直接访问'},
          {value: 310, name: '邮件营销'},
          {value: 234, name: '联盟广告'},
          {value: 135, name: '视频广告'},
          {value: 1548, name: '搜索引擎'}
        ]
      }
    },
    methods: {
      drawheatmap (id) {
        this.charts = echarts.init(document.getElementById(id))
        this.charts.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{a}<br/>{b}:{c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            x: 'left',
            data: this.opinion
          },
          series: [
            {
              name: '访问来源',
              type: 'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: false,
              label: {
                normal: {
                  show: false,
                  position: 'center'
                },
                emphasis: {
                  show: true,
                  textStyle: {
                    fontSize: '30',
                    fontWeight: 'blod'
                  }
                }
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              data: this.opinionData
            }
          ]
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
