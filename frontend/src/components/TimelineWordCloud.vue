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
  function dataFormatter(obj) {
    var pList = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆'];
    var temp;
    for (var day = 0; day <= 10; day++) {
      temp = obj[day];
      var l = 0
      for (var data in temp) {
        l++
      }
      for (var i = 0; i < l; i++) {
        obj[day][i] = {
          name: pList[i],
          value: temp[i]
        }
      }
    }
    return obj;
  }

  //疑似
  dataMap.datasuspected = dataFormatter({
    //max : 25000,
    9: [12363, 5219, 8483.17, 3960.87, 5015.89, 8158.98, 3679.91, 4918.09, 11142.86, 20842.21, 14180.23, 4975.96, 6878.74, 3921.2, 17370.89, 7991.72, 7247.02, 7539.54, 24097.7, 3998.33, 1148.93, 3623.81, 7014.04, 2781.29, 3701.79, 322.57, 4355.81, 1963.79, 540.18, 861.92, 2245.12],
    8: [10600, 4238.65, 7123.77, 3412.38, 4209.03, 6849.37, 3111.12, 4040.55, 9833.51, 17131.45, 12063.82, 4193.69, 5850.62, 3121.4, 14343.14, 6607.89, 6053.37, 6369.27, 20711.55, 3383.11, 953.67, 2881.08, 6030.41, 2177.07, 2892.31, 274.82, 3688.93, 1536.5, 470.88, 702.45, 1766.69],
    7: [9179, 3405.16, 6068.31, 2886.92, 3696.65, 5891.25, 2756.26, 3371.95, 8930.85, 13629.07, 9918.78, 3662.15, 5048.49, 2637.07, 11768.18, 5700.91, 5127.12, 5402.81, 18052.59, 2919.13, 748.59, 2474.44, 5198.8, 1885.79, 2519.62, 240.85, 3143.74, 1363.27, 398.54, 563.74, 1587.72],
    6: [8375, 2886.65, 5276.04, 2759.46, 3212.06, 5207.72, 2412.26, 2905.68, 7872.23, 11888.53, 8799.31, 3234.64, 4346.4, 2355.86, 10358.64, 5099.76, 4466.85, 4633.67, 16321.46, 2529.51, 643.47, 2160.48, 4561.69, 1652.34, 2218.81, 218.67, 2699.74, 1234.21, 355.93, 475, 1421.38],
    5: [7236, 2250.04, 4600.72, 2257.99, 2467.41, 4486.74, 2025.44, 2493.04, 6821.11, 9730.91, 7613.46, 2789.78, 3770, 1918.95, 8620.24, 4511.97, 3812.34, 3835.4, 14076.83, 2156.76, 528.84, 1825.21, 3881.6, 1312.94, 1896.78, 188.06, 2178.2, 1037.11, 294.91, 366.18, 1246.89],
    4: [5837, 1902.31, 3895.36, 1846.18, 1934.35, 3798.26, 1687.07, 2096.35, 5508.48, 7914.11, 6281.86, 2390.29, 3022.83, 1614.65, 7187.26, 3721.44, 3111.98, 3229.42, 11585.82, 1835.12, 433.57, 1649.2, 3319.62, 989.38, 1557.91, 159.76, 1806.36, 900.16, 249.04, 294.78, 1058.16],
    3: [4854, 1658.19, 3340.54, 1611.07, 1542.26, 3295.45, 1413.83, 1857.42, 4776.2, 6612.22, 5360.1, 2137.77, 2551.41, 1411.92, 5924.74, 3181.27, 2655.94, 2882.88, 9772.5, 1560.92, 377.17, 1440.32, 2836.73, 815.32, 1374.62, 137.24, 1546.59, 787.36, 213.37, 259.49, 929.41],
    2: [4092, 1319.76, 2805.47, 1375.67, 1270, 2811.95, 1223.64, 1657.77, 4097.26, 5198.03, 4584.22, 1963.9, 2206.02, 1225.8, 4764.7, 2722.4, 2292.55, 2428.95, 8335.3, 1361.92, 335.3, 1229.62, 2510.3, 661.8, 1192.53, 123.3, 1234.6, 688.41, 193.7, 227.73, 833.36],
    1: [3435, 1150.81, 2439.68, 1176.65, 1000.79, 2487.85, 1075.48, 1467.9, 3404.19, 4493.31, 3890.79, 1638.42, 1949.91, 1043.08, 4112.43, 2358.86, 2003.08, 1995.78, 7178.94, 1178.25, 293.85, 1081.35, 2189.68, 558.28, 1013.76, 96.76, 1063.89, 589.91, 169.81, 195.46, 753.91],
    0: [2982, 997.47, 2149.75, 992.69, 811.47, 2258.17, 958.88, 1319.4, 3038.9, 3891.92, 3227.99, 1399.02, 1765.8, 972.73, 3700.52, 1978.37, 1795.93, 1780.79, 6343.94, 1074.85, 270.96, 956.12, 1943.68, 480.37, 914.5, 89.56, 963.62, 514.83, 148.83, 171.14, 704.5]
  });


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
        console.log('GG')
        console.log(this.myoption)
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
