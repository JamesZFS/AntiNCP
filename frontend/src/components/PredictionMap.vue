<!-- 预测图组件 -->
<template>
  <div id="PredictionMap" style="width: 80vw;height: 80vh;"></div>
</template>

<script>
  import echarts from 'echarts'
  import vue from "vue";
  import ecStat from 'echarts-stat'
  import china from "echarts/map/js/china";
  import USA from "../assets/worldcountryjson/USA";

  //用于在发请求之前进行name转换
  var request_filter = {
    '北京': '北京市', '天津': '天津市', '上海': '上海市',
    '云南': '云南省', '内蒙古': '内蒙古自治区', '台湾': '台湾省',
    '吉林': '吉林省', '四川': '四川省', '宁夏': '宁夏回族自治区',
    '安徽': '安徽省', '山东': '山东省', '山西': '山西省',
    '广东': '广东省', '广西': '广西壮族自治区', '新疆': '新疆维吾尔自治区',
    '江苏': '江苏省', '江西': '江西省', '河北': '河北省',
    '河南': '河南省', '浙江': '浙江省', '海南': '海南省',
    '湖北': '湖北省', '湖南': '湖南省', '澳门': '澳门特别行政区',
    '甘肃': '甘肃省', '福建': '福建省', '西藏': '西藏自治区',
    '贵州': '贵州省', '辽宁': '辽宁省', '重庆': '重庆市',
    '陕西': '陕西省', '青海': '青海省', '香港': '香港特别行政区',
    '黑龙江': '黑龙江省'
  }
  export default {
    name: 'PredictionMap',
    data() {
      return {
        cur_superiorPlace: 'china',
        cur_superiorLevel: 'country',
        datamap: {
          'suspectedCount': [],
          'confirmedCount': [],
          'curedCount': [],
          'deadCount': []
        },
        myRegression: {
          'suspectedCount': [],
          'confirmedCount': [],
          'curedCount': [],
          'deadCount': []
        },
        coord_data:{
          'suspectedCount': [],
          'confirmedCount': [],
          'curedCount': [],
          'deadCount': []
        }
      }
    },
    computed: {
      myoption: function () {
        return {
          title: {
            text: this.cur_superiorPlace + '新冠疫情走势图',
            subtext: 'Epidemic trend of new coronavirus in'+this.cur_superiorPlace,
            left: 'left',
            textStyle: {
              fontSize: 25
            },
          },
          tooltip: {
            trigger: 'axis',
              axisPointer: {
              type: 'cross'
            }
          },
          xAxis: {
            type: 'category',
              splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            }
          },
          yAxis: {
            type: 'value',
              splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            }
          },
          legend: {
            left: 'right',
              textStyle: {
              fontSize: 25
            },
            data: ['疑似', '确诊', '治愈', '死亡'],
              selected: {
              // '疑似+': false, '确诊+': true, '治愈+': false, '死亡+': false,
                '疑似': false, '确诊': true, '治愈': false, '死亡': false
            }
          },
          series: [
            {
            name: '疑似',
            type: 'scatter',
            emphasis: {
              label: {
                show: true,
                position: 'left',
                // color: 'blue',
                fontSize: 16
              }
            },
            data: this.datamap['suspectedCount']
          },
            {
            name: '疑似',
            type: 'line',
            showSymbol: false,
            smooth: true,
            data: this.myRegression['suspectedCount'].points,
            markPoint: {
              itemStyle: {
                color: 'transparent'
              },
              label: {
                show: true,
                position: 'left',
                formatter: this.myRegression['suspectedCount'].expression,
                color: '#333',
                fontSize: 14
              },
              data: [{
                coord: this.coord_data['suspectedCount']
              }]
            }
          },
            {
              name: '确诊',
              type: 'scatter',
              emphasis: {
                label: {
                  show: true,
                  position: 'left',
                  color: 'blue',
                  fontSize: 16
                }
              },
              data: this.datamap['confirmedCount']
            },
            {
              name: '确诊',
              type: 'line',
              showSymbol: false,
              smooth: true,
              data: this.myRegression['confirmedCount'].points,
              markPoint: {
                itemStyle: {
                  color: 'transparent'
                },
                label: {
                  show: true,
                  position: 'left',
                  formatter: this.myRegression['confirmedCount'].expression,
                  color: '#333',
                  fontSize: 14
                },
                data: [{
                   coord: this.coord_data['confirmedCount']
                }]
              }
            },
            {
              name: '治愈',
              type: 'scatter',
              emphasis: {
                label: {
                  show: true,
                  position: 'left',
                  color: 'blue',
                  fontSize: 16
                }
              },
              data: this.datamap['curedCount']
            },
            {
              name: '治愈',
              type: 'line',
              showSymbol: false,
              smooth: true,
              data: this.myRegression['curedCount'].points,
              markPoint: {
                itemStyle: {
                  color: 'transparent'
                },
                label: {
                  show: true,
                  position: 'left',
                  formatter: this.myRegression['suspectedCount'].expression,
                  color: '#333',
                  fontSize: 14
                },
                data: [{
                  coord: this.coord_data['suspectedCount']
                }]
              }
            },
            {
              name: '死亡',
              type: 'scatter',
              emphasis: {
                label: {
                  show: true,
                  position: 'left',
                  color: 'blue',
                  fontSize: 16
                }
              },
              data: this.datamap['deadCount']
            },
            {
              name: '死亡',
              type: 'line',
              showSymbol: false,
              smooth: true,
              data: this.myRegression['deadCount'].points,
              markPoint: {
                itemStyle: {
                  color: 'transparent'
                },
                label: {
                  show: true,
                  position: 'left',
                  formatter: this.myRegression['deadCount'].expression,
                  color: '#333',
                  fontSize: 14
                },
                data: [{
                  coord: this.coord_data['deadCount']
                }]
              }
            }
          ]
        }
      }
    },
    methods: {
      drawTimeAxis(){
        // console.log(this.coord_data)
        this.charts.setOption(this.myoption, true)
        this.charts.resize()
      },
      dataImport(res){
        var tmp_dataset = res
        if(this.cur_superiorLevel == 'country')
        {
          tmp_dataset = res.data.countryTimeline
        }
        else if(this.cur_superiorLevel == 'world')
        {
          tmp_dataset = res.data.worldTimeline
        }
        else if(this.cur_superiorLevel == 'province')
        {
          tmp_dataset = res.data.provinceTimeline
        }
        for(var tmp_datakind in this.datamap)
        {
          // console.log(this.datamap)
          // console.log(res)
          this.datamap[tmp_datakind] = tmp_dataset[tmp_datakind]
          this.myRegression[tmp_datakind] = ecStat.regression('exponential', this.datamap[tmp_datakind])
          // console.log(this.myRegression[tmp_datakind])
          this.coord_data[tmp_datakind] = this.myRegression[tmp_datakind].points[this.myRegression[tmp_datakind].points.length - 1]

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
            // console.log(res)
            this.dataImport(res)
            // console.log('GG')
            this.drawTimeAxis()
          } catch (err) {
            vue.$log.error(`backend communication test failed with ${err}`);
          }
        } else if (this.cur_superiorLevel == 'province') {
          try {
            let res = await vue.axios.get('/api/retrieve/epidemic/timeline/province', {
              params: {
                dataKind: 'suspectedCount,confirmedCount,curedCount,deadCount',
                country: '中国',
                province: request_filter[this.cur_superiorPlace],
                verbose: ''
              }
            })
            this.dataImport(res)
            this.drawTimeAxis()
          } catch (err) {
            vue.$log.error(`backend communication test failed with ${err}`);
          }
        } else if (this.cur_superiorLevel == 'world') {
          try {
            let res = await vue.axios.get('/api/retrieve/epidemic/timeline/world', {
              params: {
                dataKind: 'suspectedCount,confirmedCount,curedCount,deadCount',
                verbose: ''
              }
            })
            this.dataImport(res)
            this.drawTimeAxis()
          } catch (err) {
            vue.$log.error(`backend communication test failed with ${err}`);
          }
        }

      },
      placechange(tmp_place){
        if (this.cur_superiorLevel == 'world') {
          if (tmp_place == 'China') {
            this.cur_superiorPlace = 'china'
            this.cur_superiorLevel = 'country'
          } else if (tmp_place == 'United States') {
            this.cur_superiorPlace = 'USA'
            this.cur_superiorLevel = 'country'
          }
          this.get_epidemic_data()
        } else if (this.cur_superiorLevel == 'country' && this.cur_superiorPlace == 'china') {
          this.cur_superiorLevel = 'province'
          this.cur_superiorPlace = tmp_place
          this.get_epidemic_data()
        }
      },
      returnworldmap() {
        this.cur_superiorPlace = 'world'
        this.cur_superiorLevel = 'world'
        this.get_epidemic_data()
      },
      returnchinamap() {
        this.cur_superiorPlace = 'china'
        this.cur_superiorLevel = 'country'
        this.get_epidemic_data()
        // console.log(this.myoption)
      }
    },
    mounted() {
      this.charts = echarts.init(document.getElementById('PredictionMap'))
      this.$nextTick(() => {
        this.get_epidemic_data()
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
