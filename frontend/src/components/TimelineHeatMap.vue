<!-- 含有时间轴的热度图组件 -->
<template>
  <div class="hello">
    <div>
      <el-button @click="returnworldmap()">全球疫情地图</el-button>
      <el-button @click="returnchinamap()">中国疫情地图</el-button>
    </div>
    <div id="TimelineHeatMap" style="width: 80vw;height: 80vh;"></div>
  </div>
</template>

<script>
  import echarts from 'echarts'
  import $ from 'jquery'
  import china from 'echarts/map/js/china'
  // import china from 'echarts/map/json/china.json'
  import USA from '../assets/worldcountryjson/USA.json'
  // import China from '../assets/worldcountryjson/China.json'
  import world from 'echarts/map/js/world'
  import 四川 from 'echarts/map/js/province/sichuan'
  import 陕西 from 'echarts/map/js/province/shanxi1'
  import 新疆 from 'echarts/map/js/province/xinjiang'
  import 西藏 from 'echarts/map/js/province/xizang'
  import 安徽 from 'echarts/map/js/province/anhui'
  import 澳门 from 'echarts/map/js/province/aomen'
  import 北京 from 'echarts/map/js/province/beijing'
  import 重庆 from 'echarts/map/js/province/chongqing'
  import 福建 from 'echarts/map/js/province/fujian'
  import 甘肃 from 'echarts/map/js/province/gansu'
  import 广东 from 'echarts/map/js/province/guangdong'
  import 广西 from 'echarts/map/js/province/guangxi'
  import 贵州 from 'echarts/map/js/province/guizhou'
  import 海南 from 'echarts/map/js/province/hainan'
  import 河北 from 'echarts/map/js/province/hebei'
  import 黑龙江 from 'echarts/map/js/province/heilongjiang'
  import 河南 from 'echarts/map/js/province/henan'
  import 湖北 from 'echarts/map/js/province/hubei'
  import 湖南 from 'echarts/map/js/province/hunan'
  import 江苏 from 'echarts/map/js/province/jiangsu'
  import 江西 from 'echarts/map/js/province/jiangxi'
  import 吉林 from 'echarts/map/js/province/jilin'
  import 辽宁 from 'echarts/map/js/province/liaoning'
  import 内蒙古 from 'echarts/map/js/province/neimenggu'
  import 宁夏 from 'echarts/map/js/province/ningxia'
  import 青海 from 'echarts/map/js/province/qinghai'
  import 山东 from 'echarts/map/js/province/shandong'
  import 上海 from 'echarts/map/js/province/shanghai'
  import 山西 from 'echarts/map/js/province/shanxi'
  import 台湾 from 'echarts/map/js/province/taiwan'
  import 天津 from 'echarts/map/js/province/tianjin'
  import 香港 from 'echarts/map/js/province/xianggang'
  import 云南 from 'echarts/map/js/province/yunnan'
  import 浙江 from 'echarts/map/js/province/zhejiang'
  import 'echarts/lib/component/visualMap'
  import vue from "vue";

  //用于对获取的数据name进行转换
  var name_filter = {
    '北京市': '北京', '天津市': '天津', '上海市': '上海',
    '云南省': '云南', '内蒙古自治区': '内蒙古', '台湾省': '台湾',
    '吉林省': '吉林', '四川省': '四川', '宁夏回族自治区': '宁夏',
    '安徽省': '安徽', '山东省': '山东', '山西省': '山西',
    '广东省': '广东', '广西壮族自治区': '广西', '新疆维吾尔自治区': '新疆',
    '江苏省': '江苏', '江西省': '江西', '河北省': '河北',
    '河南省': '河南', '浙江省': '浙江', '海南省': '海南',
    '湖北省': '湖北', '湖南省': '湖南', '澳门特别行政区': '澳门',
    '甘肃省': '甘肃', '福建省': '福建', '西藏自治区': '西藏',
    '贵州省': '贵州', '辽宁省': '辽宁', '重庆市': '重庆',
    '陕西省': '陕西', '青海省': '青海', '香港特别行政区': '香港',
    '黑龙江省': '黑龙江'
  }
  //用于在发请求之前进行name转换
  var name_filter_before_request = {
    '北京市': '北京', '天津市': '天津', '上海市': '上海',
    '云南省': '云南', '内蒙古自治区': '内蒙古', '台湾省': '台湾',
    '吉林省': '吉林', '四川省': '四川', '宁夏回族自治区': '宁夏',
    '安徽省': '安徽', '山东省': '山东', '山西省': '山西',
    '广东省': '广东', '广西壮族自治区': '广西', '新疆维吾尔自治区': '新疆',
    '江苏省': '江苏', '江西省': '江西', '河北省': '河北',
    '河南省': '河南', '浙江省': '浙江', '海南省': '海南',
    '湖北省': '湖北', '湖南省': '湖南', '澳门特别行政区': '澳门',
    '甘肃省': '甘肃', '福建省': '福建', '西藏自治区': '西藏',
    '贵州省': '贵州', '辽宁省': '辽宁', '重庆市': '重庆',
    '陕西省': '陕西', '青海省': '青海', '香港特别行政区': '香港',
    '黑龙江省': '黑龙江'
  }

  function dataFormatter(obj) {
    var pList = ['北京', '天津', '河北', '山西', '内蒙古自治区', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆'];
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


  export default {
    name: 'HelloWorld',
    data() {
      return {
        cur_superiorPlace: 'china',
        cur_superiorLevel: 'country',
        cur_dataMap: {},
        max: 2000,
        maxdic: {
          '疑似': 300,
          '确诊': 1500,
          '治愈': 2000,
          '死亡': 1000
        },
        empty_option: {
          title: {
            text: '2020-01-10' + this.cur_superiorPlace + '疫情状况', textStyle: {
              fontSize: 25
            },
          },
          visualMap: {
            show: true,
            min: 0,
            max: 300,
            text: ['High', 'Low'],
            realtime: false,
            calculable: true,
            inRange: {
              color: ['lightskyblue', 'yellow', 'orangered']
            }
          },
          map: this.cur_superiorPlace,
          series: [
            {
              showLegendSymbol: false,
              label: {
                normal: {
                  show: true,
                  position: 'inside',
                  formatter: function (params) {
                    return params.name + "\n" + params.value;    //地图上展示文字 + 数值
                  },

                }
              },
              data: []
            },
            {
              showLegendSymbol: false,
              label: {
                normal: {
                  show: true,
                  position: 'inside',
                  formatter: function (params) {
                    return params.name + "\n" + params.value;    //地图上展示文字 + 数值
                  },

                }
              },
              data: []
            },
            {
              showLegendSymbol: false,
              label: {
                normal: {
                  show: true,
                  position: 'inside',
                  formatter: function (params) {
                    return params.name + "\n" + params.value;    //地图上展示文字 + 数值
                  },

                }
              },
              data: []
            },
            {
              showLegendSymbol: false,
              label: {
                normal: {
                  show: true,
                  position: 'inside',
                  formatter: function (params) {
                    return params.name + "\n" + params.value;    //地图上展示文字 + 数值
                  },

                }
              },
              data: []
            }
          ]
        }
      }
    },
    computed: {
      myoption: function () {
        return {
          baseOption: {
            timeline: {
              axisType: 'category',
              realtime: true,
              // loop: false,
              autoPlay: true,
              // currentIndex: 2,
              playInterval: 100,
              data: [],
              symbolSize: '8',
              linestyle: {
                type: 'solid',
                // width: '100'
              },
            },
            title: {
              subtext: '数据来自***',
              subtextStyle: {
                fontSize: 20
              },
            },
            tooltip: {},
            legend: {
              left: 'right',
              textStyle: {
                fontSize: 25
              },
              data: ['疑似', '确诊', '治愈', '死亡'],
              selectedMode: 'single',
            },
            grid: {
              top: 80,
              bottom: 100
            },
            series: [
              {name: '疑似', type: 'map', map: this.cur_superiorPlace, showSymbol: false},
              {name: '确诊', type: 'map', map: this.cur_superiorPlace, showSymbol: false},
              {name: '治愈', type: 'map', map: this.cur_superiorPlace, showSymbol: false},
              {name: '死亡', type: 'map', map: this.cur_superiorPlace, showSymbol: false}
            ]
          },
          options: []
        }
      }
    },
    methods: {
      drawTimeAxis() {
        this.charts.setOption(this.myoption, true)
        this.charts.resize()
      },
      dataImport(res) {
        //疑似、确诊、治愈、死亡数据依次导入，由于时间戳的个数相同，所以只需要一个循环
        //首先从疑似顺便导入时间戳，初始化option的个数
        for (var time_index in res.data.timeline['suspectedCount']) {
          this.myoption.baseOption.timeline.data.push(time_index)
          var tmp_suboption = $.extend(true, {}, this.empty_option)//不引用赋值
          tmp_suboption.title.text = time_index + this.cur_superiorPlace + '疫情状况'
          //疑似数据导入
          tmp_suboption.series[0].data = res.data.timeline['suspectedCount'][time_index]
          for (var i = 0; i < tmp_suboption.series[0].data.length; i++) {
            tmp_suboption.series[0].data[i].name = name_filter[tmp_suboption.series[0].data[i].name]
          }
          //确诊数据导入
          tmp_suboption.series[1].data = res.data.timeline['confirmedCount'][time_index]
          for (var i = 0; i < tmp_suboption.series[1].data.length; i++) {
            tmp_suboption.series[1].data[i].name = name_filter[tmp_suboption.series[1].data[i].name]
          }
          //治愈数据导入
          tmp_suboption.series[2].data = res.data.timeline['curedCount'][time_index]
          for (var i = 0; i < tmp_suboption.series[2].data.length; i++) {
            tmp_suboption.series[2].data[i].name = name_filter[tmp_suboption.series[2].data[i].name]
          }
          //死亡数据导入
          tmp_suboption.series[3].data = res.data.timeline['deadCount'][time_index]
          for (var i = 0; i < tmp_suboption.series[3].data.length; i++) {
            tmp_suboption.series[3].data[i].name = name_filter[tmp_suboption.series[3].data[i].name]
          }
          //清空this.myoption.options
          this.myoption.options.clear()
          this.myoption.options.push(tmp_suboption)
        }
      },
      async get_epidemic_data() {
        //国家
        if (this.cur_superiorLevel == 'country') {
          var request_country = ''
          if (this.cur_superiorPlace == 'china')
            request_country = '中国'
          else if (this.cur_superiorPlace == 'USA')
            request_country = '美国'
          try {
            let res = await vue.axios.get('/api/retrieve/epidemic/timeline/country', {
              params: {
                dataKind: 'suspectedCount,confirmedCount,curedCount,deadCount',
                country: request_country,
                verbose: ''
              }
            })
            this.dataImport(res)
            this.drawTimeAxis()
          } catch (err) {
            vue.$log.error(`backend communication test failed with ${err}`);
          }
        } else if (this.cur_superiorLevel == 'world') {

        }

      },
      returnworldmap() {
        this.cur_superiorPlace = 'world'
        this.cur_superiorLevel = 'world'
        this.charts.setOption(this.myoption, true)
        this.charts.resize()
      },
      returnchinamap() {
        this.cur_superiorPlace = 'china'
        this.cur_superiorLevel = 'country'
        this.charts.setOption(this.myoption, true)
        this.charts.resize()
        // console.log(this.myoption)
      }
    },
    // 调用
    mounted() {
      this.charts = echarts.init(document.getElementById('TimelineHeatMap'))
      this.$nextTick(() => {
        this.get_epidemic_data()
        // console.log(this.myoption)
        // this.drawTimeAxis()
      })
      this.charts.on('click', (params) => {
        //如果点击事件发生在时间轴上
        if (params.componentType == 'timeline') {
          this.myoption.baseOption.timeline.currentIndex = params.dataIndex
          this.charts.setOption(this.myoption, true)
          this.charts.resize()
        } else {
          if (this.cur_superiorLevel == 'world') {
            if (params.name == 'China') {
              echarts.registerMap('china', china)
              this.cur_superiorPlace = 'china'
              this.cur_superiorLevel = 'country'
            } else if (params.name == 'United States') {
              echarts.registerMap('USA', USA)
              this.cur_superiorPlace = 'USA'
              this.cur_superiorLevel = 'country'
            }
            this.get_epidemic_data()
          } else if (this.cur_superiorLevel == 'country' && this.cur_superiorPlace == 'china') {
            this.cur_superiorLevel = 'province'
            this.cur_superiorPlace = params.name
            this.get_epidemic_data()
          }
        }

      })
      var tmp_maxdic = this.maxdic
      this.charts.on('legendselectchanged', (obj) => {
        var tmp_max = tmp_maxdic[obj.name]
        for (var i = 0; i < this.myoption.options.length; i++) {
          this.myoption.options[i].visualMap.max = tmp_max
        }
        this.myoption.baseOption.legend.selected = obj.selected
        this.charts.setOption(this.myoption, true)
        this.charts.resize()
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
