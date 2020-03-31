<!-- 含有时间轴的热度图组件 -->
<template>
  <div id="TimelineHeatMap" v-loading="loading" style="width: 80vw;height: 80vh;"></div>
</template>

<script>
  import echarts from 'echarts'
  import $ from 'jquery'
  import china from 'echarts/map/js/china'
  // import china from 'echarts/map/json/china.json'
  import USA from '../../assets/worldcountryjson/USA.json'
  // import China from '../assets/worldcountryjson/China.json'
  import world from '../../assets/world.json'
  import sichuan from 'echarts/map/json/province/sichuan'
  import shanxi1 from 'echarts/map/json/province/shanxi1'
  import xinjiang from 'echarts/map/json/province/xinjiang'
  import xizang from 'echarts/map/json/province/xizang'
  import anhui from 'echarts/map/json/province/anhui'
  import aomen from 'echarts/map/json/province/aomen'
  import beijing from 'echarts/map/json/province/beijing'
  import chongqing from 'echarts/map/json/province/chongqing'
  import fujian from 'echarts/map/json/province/fujian'
  import gansu from 'echarts/map/json/province/gansu'
  import guangdong from 'echarts/map/json/province/guangdong'
  import guangxi from 'echarts/map/json/province/guangxi'
  import guizhou from 'echarts/map/json/province/guizhou'
  import hainan from 'echarts/map/json/province/hainan'
  import hebei from 'echarts/map/json/province/hebei'
  import heilongjiang from 'echarts/map/json/province/heilongjiang'
  import henan from 'echarts/map/json/province/henan'
  import hubei from 'echarts/map/json/province/hubei'
  import hunan from 'echarts/map/json/province/hunan'
  import jiangsu from 'echarts/map/json/province/jiangsu'
  import jiangxi from 'echarts/map/json/province/jiangxi'
  import jilin from 'echarts/map/json/province/jilin'
  import liaoning from 'echarts/map/json/province/liaoning'
  import neimenggu from 'echarts/map/json/province/neimenggu'
  import ningxia from 'echarts/map/json/province/ningxia'
  import qinghai from 'echarts/map/json/province/qinghai'
  import shandong from 'echarts/map/json/province/shandong'
  import shanghai from 'echarts/map/json/province/shanghai'
  import shanxi from 'echarts/map/json/province/shanxi'
  import taiwan from 'echarts/map/json/province/taiwan'
  import tianjin from 'echarts/map/json/province/tianjin'
  import xianggang from 'echarts/map/json/province/xianggang'
  import yunnan from 'echarts/map/json/province/yunnan'
  import zhejiang from 'echarts/map/json/province/zhejiang'
  import 'echarts/lib/component/visualMap'
  import vue from "vue";
  import apis from "../../../config/apis";

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
    '黑龙江省': '黑龙江',
    '那曲': '那曲地区'
  }
  //用于用城市名找出对应的json文件
  var nametojson = {
    '北京': beijing, '天津': tianjin, '上海': shanghai,
    '云南': yunnan, '内蒙古': neimenggu, '台湾': taiwan,
    '吉林': jilin, '四川': sichuan, '宁夏': ningxia,
    '安徽': anhui, '山东': shandong, '山西': shanxi,
    '广东': guangdong, '广西': guangxi, '新疆': xinjiang,
    '江苏': jiangsu, '江西': jiangxi, '河北': hebei,
    '河南': henan, '浙江': zhejiang, '海南': hainan,
    '湖北': hubei, '湖南': hunan, '澳门': aomen,
    '甘肃': gansu, '福建': fujian, '西藏': xizang,
    '贵州': guizhou, '辽宁': liaoning, '重庆': chongqing,
    '陕西': shanxi1, '青海': qinghai, '香港': xianggang,
    '黑龙江': heilongjiang
  }

  var cur_datakind = '确诊'


  export default {
    name: 'HelloWorld',
    data() {
      return {
        charts:'',
        loading: false,
        cur_superiorPlace: 'world',
        cur_superiorLevel: 'world',
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
            show: false,
            min: 0,
            max: 1500,
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
              autoPlay: false,
              currentIndex: 0,
              playInterval: 1000,
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
              selected: {
                '疑似': false, '确诊': true, '治愈': false, '死亡': false
              }
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
        for (var tmp_datakind in this.myoption.baseOption.legend.selected) {
          this.myoption.baseOption.legend.selected[tmp_datakind] = false
        }
        this.myoption.baseOption.legend.selected[cur_datakind] = true;
        this.charts.setOption(this.myoption, true);
        this.charts.resize();
      },
      dataImport(res) {
        //清空this.myoption.options和时间标签
        this.myoption.options.splice(0, this.myoption.options.length);
        this.myoption.baseOption.timeline.data.splice(0, this.myoption.baseOption.timeline.data.length);
        //疑似、确诊、治愈、死亡数据依次导入，由于时间戳的个数相同，所以只需要一个循环
        //首先从疑似顺便导入时间戳，初始化option的个数
        var time_cnt = 0;
        for (var time_index in res.data.timeline['suspectedCount']) {
          time_cnt += 1;
          this.myoption.baseOption.timeline.data.push(time_index);
          var tmp_suboption = $.extend(true, {}, this.empty_option)//不引用赋值
          tmp_suboption.title.text = time_index + this.cur_superiorPlace + '疫情状况';
          //疑似数据导入
          tmp_suboption.series[0].data = res.data.timeline['suspectedCount'][time_index];
          //确诊数据导入
          tmp_suboption.series[1].data = res.data.timeline['confirmedCount'][time_index];
          //治愈数据导入
          tmp_suboption.series[2].data = res.data.timeline['curedCount'][time_index];
          //死亡数据导入
          tmp_suboption.series[3].data = res.data.timeline['deadCount'][time_index];
          //name修正
          for (var i = 0; i < tmp_suboption.series[3].data.length; i++) {
            for (var j = 0; j < 4; j++) {
              if (this.cur_superiorPlace == 'world')
                tmp_suboption.series[j].label.normal.show = false
              else
                tmp_suboption.series[j].label.normal.show = true
              if (name_filter[tmp_suboption.series[j].data[i].name] !== undefined) {
                tmp_suboption.series[j].data[i].name = name_filter[tmp_suboption.series[j].data[i].name]
              }
            }
          }
          // console.log(this.myoption.options)
          this.myoption.options.push(tmp_suboption)
        }
        //时间轴处在最新的时间点
        this.myoption.baseOption.timeline.currentIndex = time_cnt- 1;
        // console.log(this.myoption.baseOption.timeline.currentIndex);
      },
      timelineclick(tmp_index) {
        this.myoption.baseOption.timeline.currentIndex = tmp_index;
        // console.log(tmp_index);
        this.drawTimeAxis();
      },
      placechange(tmp_superiorPlace,tmp_superiorLevel) {
        // console.log(tmp_superiorPlace);
        if(tmp_superiorPlace === 'world'){
          echarts.registerMap('world', world);
        }
        else if (this.cur_superiorLevel === 'world') {
          if (tmp_superiorPlace === 'china') {
          } else if (tmp_superiorPlace === 'USA') {
            echarts.registerMap('USA', USA);
          }
        } else if (this.cur_superiorLevel === 'country' && this.cur_superiorPlace === 'china') {

          echarts.registerMap(tmp_superiorPlace, nametojson[tmp_superiorPlace]);
        }
        this.cur_superiorLevel = tmp_superiorLevel;
        this.cur_superiorPlace = tmp_superiorPlace;
      },
      initechart(){
        this.charts = echarts.init(document.getElementById('TimelineHeatMap'));
      }
    },
    // 调用
    mounted() {
      var tmp_maxdic = this.maxdic;
      this.charts = echarts.init(document.getElementById('TimelineHeatMap'));
      this.charts.on('legendselectchanged', (obj) => {
        cur_datakind = obj.name;
        var tmp_max = tmp_maxdic[obj.name];
        for (var i = 0; i < this.myoption.options.length; i++) {
          this.myoption.options[i].visualMap.max = tmp_max
        }
        this.myoption.baseOption.legend.selected = obj.selected;
        this.drawTimeAxis()
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
