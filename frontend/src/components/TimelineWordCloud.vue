<!-- 含有时间轴的词云组件 -->
<template>
  <div class="hello">
    <h1>TimelineWordCloud</h1>
    <div id="TimelineWordCloud" style="width: 80vw;height: 80vh;"></div>
  </div>
</template>

<script>
  import echarts from 'echarts'
  // import 'echarts/lib/component/visualMap'
  import echartWordcloud from 'echarts-wordcloud'

  var dataMap = {};
  dataMap.data = [
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
  ]


  export default {
    name: 'TimelineWordCloud',
    data() {
      return {
        count: 0,
        myoption:{
          baseOption: {
            timeline: {
              axisType: 'category',
              realtime: true,
              // loop: false,
              autoPlay: true,
              currentIndex: 1,
              playInterval: 1000,
              data: [
                '2020-01-10', '2020-01-11', '2020-01-12',
                '2020-01-13', '2020-01-14', '2020-01-15', '2020-01-16'
              ]
            },
            title: {
              subtext: '数据来自各大主流媒体',
              subtextStyle: {
                fontSize: 20
              },
            },
            tooltip: {
              trigger: 'item',
              formatter: '{b}'
            },
            // calculable : true,
            grid: {
              top: 80,
              bottom: 100
            },
            series: [
              {
                name: '热词',
                type: 'wordCloud',
                tooltip: {
                  trigger: 'item',
                  formatter: '{b}词频{c} (次)'
                },
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
                data:[{name: '钟南山', value: '0'}, {name: '论文', value: '0'}]}

            ]
          },
          options: [
            {
              title: {text: '2020-01-10媒体热词词云'},
              series: [
                {
                  data: [{name: '钟南山', value: '160'}, {name: '论文', value: '3'},
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
                    {name: '隔离', value: '53'}, {name: '医院', value: '50'}]
                }
              ]
            },
            {
              title: {text: '2020-01-11媒体热词词云'},
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
              series: [
                {
                  data: [{name: '钟南山', value: '160'}, {name: '论文', value: '5'},
                    {name: '防护服', value: '20'}, {name: '捐款', value: '30'},
                    {name: '体温', value: '15'}, {name: '睡眠不足', value: '3'},
                    {name: '护士', value: '22'}, {name: '武汉', value: '15'},
                    {name: '火神山', value: '88'}, {name: '雷神山', value: '75'},
                    {name: '封城', value: '60'}, {name: '阳性', value: '10'},
                    {name: '阴性', value: '38'}, {name: '治愈', value: '20'},
                    {name: 'nCoV', value: '80'}, {name: '确诊', value: '20'},
                    {name: '感染', value: '34'}, {name: '14天', value: '6'},
                    {name: '28天', value: '15'}, {name: '试剂', value: '30'},
                    {name: '死亡', value: '21'}, {name: '新增', value: '84'},
                    {name: '预测', value: '70'}, {name: '交通', value: '4'},
                    {name: '指示', value: '29'}, {name: '辟谣', value: '53'},
                    {name: '肺炎', value: '70'}, {name: '口罩', value: '50'},
                    {name: '疫情', value: '40'}, {name: '防控', value: '15'},
                    {name: '隔离', value: '53'}, {name: '医院', value: '50'}]
                }
              ]
            },
            {
              title: {text: '2020-01-12媒体热词词云'},
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
              series: [
                {
                  data: [{name: '钟南山', value: '140'}, {name: '论文', value: '30'},
                    {name: '防护服', value: '24'}, {name: '捐款', value: '35'},
                    {name: '体温', value: '5'}, {name: '睡眠不足', value: '3'},
                    {name: '护士', value: '20'}, {name: '武汉', value: '15'},
                    {name: '火神山', value: '88'}, {name: '雷神山', value: '100'},
                    {name: '封城', value: '52'}, {name: '阳性', value: '40'},
                    {name: '阴性', value: '38'}, {name: '治愈', value: '11'},
                    {name: 'nCoV', value: '120'}, {name: '确诊', value: '20'},
                    {name: '感染', value: '34'}, {name: '14天', value: '6'},
                    {name: '28天', value: '50'}, {name: '试剂', value: '30'},
                    {name: '死亡', value: '21'}, {name: '新增', value: '84'},
                    {name: '预测', value: '40'}, {name: '交通', value: '4'},
                    {name: '指示', value: '29'}, {name: '辟谣', value: '53'},
                    {name: '肺炎', value: '40'}, {name: '口罩', value: '4'},
                    {name: '疫情', value: '3'}, {name: '防控', value: '29'},
                    {name: '隔离', value: '53'}, {name: '医院', value: '88'}]
                }
              ]
            },
            {
              title: {text: '2020-01-13媒体热词词云'},
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
              series: [
                {
                  data: [{name: '钟南山', value: '160'}, {name: '论文', value: '3'},
                    {name: '防护服', value: '24'}, {name: '捐款', value: '35'},
                    {name: '体温', value: '5'}, {name: '睡眠不足', value: '3'},
                    {name: '护士', value: '20'}, {name: '武汉', value: '15'},
                    {name: '火神山', value: '60'}, {name: '雷神山', value: '120'},
                    {name: '封城', value: '52'}, {name: '阳性', value: '10'},
                    {name: '阴性', value: '38'}, {name: '治愈', value: '11'},
                    {name: 'nCoV', value: '99'}, {name: '确诊', value: '20'},
                    {name: '感染', value: '34'}, {name: '14天', value: '15'},
                    {name: '28天', value: '4'}, {name: '试剂', value: '30'},
                    {name: '死亡', value: '21'}, {name: '新增', value: '84'},
                    {name: '预测', value: '70'}, {name: '交通', value: '20'},
                    {name: '指示', value: '29'}, {name: '辟谣', value: '100'},
                    {name: '肺炎', value: '70'}, {name: '口罩', value: '4'},
                    {name: '疫情', value: '50'}, {name: '防控', value: '29'},
                    {name: '隔离', value: '53'}, {name: '医院', value: '50'}]
                }
              ]
            },
            {
              title: {text: '2020-01-14媒体热词词云'},
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
              series: [
                {
                  data: [{name: '钟南山', value: '160'}, {name: '论文', value: '3'},
                    {name: '防护服', value: '24'}, {name: '捐款', value: '60'},
                    {name: '体温', value: '5'}, {name: '睡眠不足', value: '3'},
                    {name: '护士', value: '20'}, {name: '武汉', value: '100'},
                    {name: '火神山', value: '88'}, {name: '雷神山', value: '100'},
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
                    {name: '隔离', value: '53'}, {name: '医院', value: '50'}]
                }
              ]
            },
            {
              title: {text: '2020-01-15媒体热词词云'},
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
              series: [
                {
                  data: [{name: '钟南山', value: '160'}, {name: '论文', value: '3'},
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
                    {name: '隔离', value: '53'}, {name: '医院', value: '50'}]
                }
              ]
            },
            {
              title: {text: '2020-01-16媒体热词词云'},
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
              series: [
                {
                  data: [{name: '钟南山', value: '120'}, {name: '论文', value: '3'},
                    {name: '防护服', value: '24'}, {name: '捐款', value: '35'},
                    {name: '体温', value: '5'}, {name: '睡眠不足', value: '3'},
                    {name: '护士', value: '20'}, {name: '武汉', value: '15'},
                    {name: '火神山', value: '88'}, {name: '雷神山', value: '75'},
                    {name: '封城', value: '52'}, {name: '阳性', value: '10'},
                    {name: '阴性', value: '38'}, {name: '治愈', value: '11'},
                    {name: 'nCoV', value: '80'}, {name: '确诊', value: '20'},
                    {name: '感染', value: '34'}, {name: '14天', value: '6'},
                    {name: '28天', value: '60'}, {name: '试剂', value: '30'},
                    {name: '死亡', value: '21'}, {name: '新增', value: '84'},
                    {name: '预测', value: '70'}, {name: '交通', value: '4'},
                    {name: '指示', value: '50'}, {name: '辟谣', value: '53'},
                    {name: '肺炎', value: '70'}, {name: '口罩', value: '4'},
                    {name: '疫情', value: '30'}, {name: '防控', value: '29'},
                    {name: '隔离', value: '80'}, {name: '医院', value: '50'}]
                }
              ]
            },
          ]
        }
      }
    },
    methods: {
      drawTimelineWordCloud() {
        this.charts.setOption(
           this.myoption
        )
      }
    },
    // 调用
    mounted() {
      this.charts = echarts.init(document.getElementById('TimelineWordCloud'))
      this.$nextTick( () => {
        this.drawTimelineWordCloud()
      })

    }
  }
</script>

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
