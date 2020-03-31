<!-- Page1 -->
<template>
  <div class="page1">
    <div class="mypic">
      <div>
        <el-button @click="returnworldmap()">全球疫情地图</el-button>
        <el-button @click="returnchinamap()">中国疫情地图</el-button>
      </div>
      <div margin="100px 0" v-loading="loading">
        <TimelineHeatMap ref="myheatmap"></TimelineHeatMap>
      </div>
      <div margin="100px 0" v-loading="loading">
        <PredictionMap ref="mypredictionmap"></PredictionMap>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar'
import TimelineHeatMap from './modules/TimelineHeatMap'
import PredictionMap from './modules/PredictionMap'
import vue from "vue";
import apis from "../../config/apis";
import echarts from "echarts";
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
  name: 'PandemicMap',
  components: {NavBar, TimelineHeatMap,PredictionMap},
  data () {
    return {
      count: 0,
      loading: false,
      cur_superiorPlace: 'world',
      cur_superiorLevel: 'world'
    }
  },
  methods:{
    returnworldmap() {
      this.cur_superiorPlace = 'world';
      this.cur_superiorLevel = 'world';
      this.passPlaceandLevel();
      this.get_epidemic_data();
    },
    returnchinamap() {
      this.cur_superiorPlace = 'china';
      this.cur_superiorLevel = 'country';
      this.passPlaceandLevel();
      this.get_epidemic_data();
    },
    passPlaceandLevel(){//传递this.cur_superiorPlace,this.cur_superiorLevel给子组件
      //热度图切换
      this.$refs.myheatmap.placechange(this.cur_superiorPlace,this.cur_superiorLevel)
      //以及折线图的切换
      this.$refs.mypredictionmap.placechange(this.cur_superiorPlace,this.cur_superiorLevel)
    },
    async get_epidemic_data() {//只在这个父页面获取一次数据即可
      this.loading = true;
      let res = '';
      //国家
      if (this.cur_superiorLevel === 'country') {
        var request_country = ''
        if (this.cur_superiorPlace === 'china')
          request_country = '中国'
        else if (this.cur_superiorPlace === 'USA')
          request_country = '美国'
        try {
          res = await vue.axios.get(apis.GET_EPIDEMIC_TIMELINE_COUNTRY, {
            params: {
              dataKind: 'suspectedCount,confirmedCount,curedCount,deadCount',
              country: request_country,
              verbose: ''
            }
          })
          // console.log(res)
        } catch (err) {
          vue.$log.error(`backend communication test failed with ${err}`);
        }
      } else if (this.cur_superiorLevel === 'province') {
        try {
          res = await vue.axios.get(apis.GET_EPIDEMIC_TIMELINE_PROVINCE, {
            params: {
              dataKind: 'suspectedCount,confirmedCount,curedCount,deadCount',
              country: '中国',
              province: request_filter[this.cur_superiorPlace],
              verbose: ''
            }
          })
        } catch (err) {
          vue.$log.error(`backend communication test failed with ${err}`);
        }
      } else if (this.cur_superiorLevel === 'world') {
        try {
          res = await vue.axios.get(apis.GET_EPIDEMIC_TIMELINE_WORLD, {
            params: {
              dataKind: 'suspectedCount,confirmedCount,curedCount,deadCount',
              verbose: ''
            }
          })
          // console.log(res)
        } catch (err) {
          vue.$log.error(`backend communication test failed with ${err}`);
        }
      }
      this.dataImport(res);
      this.drawTimeAxis();
      this.loading = false;
    },
    dataImport(res){//统一调用两个子组件的数据导入
      this.$refs.myheatmap.dataImport(res);
      this.$refs.mypredictionmap.dataImport(res);
    },
    drawTimeAxis(){//统一调用两个子组件的绘图
      this.$refs.myheatmap.drawTimeAxis();
      this.$refs.mypredictionmap.drawTimeAxis();
    },
    placechange(tmp_place){//将修改cur_superiorPlace和cur_superiorLevel的工作集中到当前父页面中，子组件只需根据所传参数修改子组件当中的数据即可
      if (this.cur_superiorLevel === 'world') {
        if (tmp_place === '中国') {
          this.cur_superiorPlace = 'china';
          this.cur_superiorLevel = 'country';
        } else if (tmp_place === '美国') {
          this.cur_superiorPlace = 'USA';
          this.cur_superiorLevel = 'country';
        }
        else{
          alert('当前仅支持中国、美国国内热度图')
        }
      } else if (this.cur_superiorLevel === 'country' && this.cur_superiorPlace === 'china') {
        this.cur_superiorLevel = 'province';
        this.cur_superiorPlace = tmp_place;
      }
      this.passPlaceandLevel();
    },
    initechart(){//用于初始化echart
      this.passPlaceandLevel();
      this.$refs.myheatmap.initechart();
      this.$refs.mypredictionmap.initechart();
    }
  },
  mounted() {
    this.initechart();
    this.$nextTick(async () => {
      await this.get_epidemic_data()
    });
    this.$refs.myheatmap.charts.on('click',(params) => {
      if (params.componentType == 'timeline') {
        this.$refs.myheatmap.timelineclick(params.dataIndex)
      } else {
        this.placechange(params.name);
        this.get_epidemic_data();
      }
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

  .page1 {
    display: flex;
    flex-direction: row;
  }
  .mypic{
    display: flex;
    flex-direction: column;
  }
</style>
