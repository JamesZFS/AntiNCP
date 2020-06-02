<!-- 预测图组件 -->
<!--suppress NonAsciiCharacters -->
<template>
  <div id="PredictionChart" style="width: 85%;height: 80vh;" class="ml-5"></div>
</template>

<script>
  import echarts from 'echarts'
  import ecStat from 'echarts-stat'

  //用于在发请求之前进行name转换
  // var request_filter = {
  //   '北京': '北京市', '天津': '天津市', '上海': '上海市',
  //   '云南': '云南省', '内蒙古': '内蒙古自治区', '台湾': '台湾省',
  //   '吉林': '吉林省', '四川': '四川省', '宁夏': '宁夏回族自治区',
  //   '安徽': '安徽省', '山东': '山东省', '山西': '山西省',
  //   '广东': '广东省', '广西': '广西壮族自治区', '新疆': '新疆维吾尔自治区',
  //   '江苏': '江苏省', '江西': '江西省', '河北': '河北省',
  //   '河南': '河南省', '浙江': '浙江省', '海南': '海南省',
  //   '湖北': '湖北省', '湖南': '湖南省', '澳门': '澳门特别行政区',
  //   '甘肃': '甘肃省', '福建': '福建省', '西藏': '西藏自治区',
  //   '贵州': '贵州省', '辽宁': '辽宁省', '重庆': '重庆市',
  //   '陕西': '陕西省', '青海': '青海省', '香港': '香港特别行政区',
  //   '黑龙江': '黑龙江省'
  // };
  export default {
    name: 'PredictionChart',
    data() {
      return {
        cur_superiorPlace: 'world',
        cur_superiorLevel: 'world',
        datamap: {
          'activeCount': [],
          'confirmedCount': [],
          'curedCount': [],
          'deadCount': []
        },
        myRegression: {
          'activeCount': [],
          'confirmedCount': [],
          'curedCount': [],
          'deadCount': []
        },
        coord_data: {
          'activeCount': [],
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
            text: this.cur_superiorPlace + ' 疫情走势图',
            subtext: 'Epidemic trends of COVID-19 in ' + this.cur_superiorPlace,
            left: 'left',
            top: 'top',
            textStyle: {
              fontSize: '25vw'
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
            axisLabel: {
              fontSize: '12',
              inside: true
            },
            axisTick:{
              inside: true
            },
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            }
          },
          legend: {
            left: 'right',
            top: "8%",
            textStyle: {
              fontSize: '25vw'
            },
            data: ['活跃', '确诊', '治愈', '死亡'],
            selected: {
              // '活跃+': false, '确诊+': true, '治愈+': false, '死亡+': false,
              '活跃': false, '确诊': true, '治愈': false, '死亡': false
            }
          },
          series: [
            {
              name: '活跃',
              type: 'scatter',
              top: "20%",
              emphasis: {
                label: {
                  show: true,
                  position: 'left',
                  // color: 'blue',
                  fontSize: '16vw'
                }
              },
              data: this.datamap['activeCount']
            },
            {
              name: '活跃',
              type: 'line',
              top: "20%",
              showSymbol: false,
              smooth: true,
              data: this.myRegression['activeCount'].points,
              markPoint: {
                itemStyle: {
                  color: 'transparent'
                },
                label: {
                  show: true,
                  position: 'left',
                  formatter: this.myRegression['activeCount'].expression,
                  color: '#333',
                  fontSize: '14vw'
                },
                data: [{
                  coord: this.coord_data['activeCount']
                }]
              }
            },
            {
              name: '确诊',
              type: 'scatter',
              top: "20%",
              emphasis: {
                label: {
                  show: true,
                  position: 'left',
                  color: 'blue',
                  fontSize: '16vw'
                }
              },
              data: this.datamap['confirmedCount']
            },
            {
              name: '确诊',
              type: 'line',
              top: "20%",
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
                  fontSize: '14vw'
                },
                data: [{
                  coord: this.coord_data['confirmedCount']
                }]
              }
            },
            {
              name: '治愈',
              type: 'scatter',
              top: "20%",
              emphasis: {
                label: {
                  show: true,
                  position: 'left',
                  color: 'blue',
                  fontSize: '16vw'
                }
              },
              data: this.datamap['curedCount']
            },
            {
              name: '治愈',
              type: 'line',
              top: "20%",
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
                  formatter: this.myRegression['activeCount'].expression,
                  color: '#333',
                  fontSize: '14vw'
                },
                data: [{
                  coord: this.coord_data['activeCount']
                }]
              }
            },
            {
              name: '死亡',
              type: 'scatter',
              top: "20%",
              emphasis: {
                label: {
                  show: true,
                  position: 'left',
                  color: 'blue',
                  fontSize: '16vw'
                }
              },
              data: this.datamap['deadCount']
            },
            {
              name: '死亡',
              type: 'line',
              top: "20%",
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
                  fontSize: '14vw'
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
      drawTimeAxis() {
        // console.log(this.coord_data)
        this.charts.setOption(this.myoption, true);
        this.charts.resize()
      },
      dataImport(res) {
        var tmp_dataset = res;
        if (this.cur_superiorLevel === 'country') {
          tmp_dataset = res.data.countryTimeline
        } else if (this.cur_superiorLevel === 'world') {
          tmp_dataset = res.data.worldTimeline
        } else if (this.cur_superiorLevel === 'province') {
          tmp_dataset = res.data.provinceTimeline
        }
        for (var tmp_datakind in this.datamap) {
          // console.log(this.datamap)
          // console.log(res)
          this.datamap[tmp_datakind] = tmp_dataset[tmp_datakind];
          this.myRegression[tmp_datakind] = ecStat.regression('exponential', this.datamap[tmp_datakind]);
          // console.log(this.myRegression[tmp_datakind])
          this.coord_data[tmp_datakind] = this.myRegression[tmp_datakind].points[this.myRegression[tmp_datakind].points.length - 1]

        }
      },
      placechange(tmp_superiorPlace, tmp_superiorLevel) {
        this.cur_superiorPlace = tmp_superiorPlace;
        this.cur_superiorLevel = tmp_superiorLevel;
      },
      initechart() {
        this.charts = echarts.init(document.getElementById('PredictionChart'));
      }
    },
    mounted() {
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
