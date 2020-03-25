<!-- 词云图组件 -->
<template>
  <div>
    <h1>WordCloud</h1>
    <div id="wordcloud" style="width: 50vw;height: 50vh;"></div>
  </div>
</template>

<script>
  import echarts from 'echarts'
  // import 'echarts/lib/component/visualMap'
  import wordcloud from 'echarts-wordcloud'

  export default {
    name: 'wordcloud',
    data() {
      return {
        count: 0
      }
    },
    methods: {
      drawwordcloud(id) {
        var maskImage = new Image()
        maskImage.src = require('../../assets/newslogo.png')
        // maskImage.width = maskImage.width*0.3
        // maskImage.height = maskImage.height*0.3
        console.log(maskImage.src)
        this.charts = echarts.init(document.getElementById(id))
        this.charts.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{b}词频{c} (次)'
          },
          visualMap: {
            show: true,
            min: 0,
            max: 160,
            text: ['High', 'Low'],
            realtime: false,
            calculable: true,
            inRange: {
              color: ['lightskyblue', 'yellow', 'orangered']
            }
          },
          series: {
            type: 'wordCloud',
            // maskImage: maskImage,
            drawOutOfBound: true,
            rotationRange: [0,0],
            gridsize: 2,
            shape: 'smooth',
            size: ['200%', '200%'],
            width: '150%',
            height: '150%',
            textStyle: {
              // 悬停上去的颜色设置
              emphasis: {
                shadowBlur: 10,
                shadowColor: '#333'
              }
            },
            data: [
              {name: '钟南山', value: '160'}, {name: '论文', value: '3'},
              {name: '防护服', value: '24'}, {name: '捐款', value: '35'},
              {name: '体温', value: '5'}, {name: '睡眠不足', value: '3'},
              {name: '护士', value: '20'}, {name: '辽宁', value: '15'},
              {name: '火神山', value: '88'}, {name: '雷神山', value: '75'},
              {name: '封城', value: '52'}, {name: '阳性', value: '10'},
              {name: '阴性', value: '38'}, {name: '治愈', value: '11'},
              {name: 'nCoV', value: '80'}, {name: '确诊', value: '20'},
              {name: '感染', value: '34'}, {name: '14天', value: '6'},
              {name: '28天', value: '4'}, {name: '试剂', value: '30'},
              {name: '死亡', value: '21'}, {name: '新增', value: '84'},
              {name: '预测', value: '70'}, {name: '交通', value: '4'},
              {name: '指示', value: '29'}, {name: '辟谣', value: '53'},
              {name: '肺炎', value: '70'}, {name: '口罩', value: '4'},
              {name: '疫情', value: '3'}, {name: '防控', value: '29'},
              {name: '隔离', value: '53'}, {name: '医院', value: '50'}
              // {name: '本土化', value: '3'}, {name: '差异化', value: '3'},
              // {name: '平台融合', value: '2'}, {name: '智能化', value: '5'},
              // {name: '人才培养', value: '1'}, {name: '权威性', value: '2'},
              // {name: '高品质', value: '4'}, {name: '接地气', value: '1'},
              // {name: '信息化', value: '2'}, {name: '全球视野', value: '7'},
              // {name: '平等对话', value: '1'}, {name: '互动性', value: '1'},
              // {name: '数字化', value: '2'}, {name: '精准化', value: '1'},
              // {name: '实效性', value: '1'}, {name: '独特报刊定位', value: '1'},
              // {name: '定制化', value: '2'}, {name: '专业化', value: '1'},
              // {name: '个性化', value: '1'}, {name: '前沿化', value: '1'},
              // {name: '双向互动', value: '2'}, {name: '坚持传统', value: '1'},
              // {name: '创新', value: '1'}
            ]
          }
        })
      }
    },
    // 调用
    mounted() {
      this.$nextTick(function () {
        this.drawwordcloud('wordcloud')
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
