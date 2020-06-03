<!--suppress NonAsciiCharacters -->
<template>
  <div class="mypic my-2">
    <v-card
            :loading="loading"
            width="98%"
            class="mx-auto justify-center"
            elevation="10"
            min-width="400px"
    >
      <v-system-bar/>
      <v-card-text justify="center" align="center">
        <v-btn @click="returnWorldMap()"  class="font-weight-light" :width="buttonwidth">全球疫情地图</v-btn>
        <v-btn @click="returnCountryMap('china')"  class="font-weight-light" :width="buttonwidth">中国疫情地图</v-btn>
        <v-btn @click="returnCountryMap('USA')"  class="font-weight-light" :width="buttonwidth">美国疫情地图</v-btn>
      </v-card-text>
      <v-skeleton-loader
              v-if="first && loading"
              class="mx-auto"
              type="table"
              loading
      ></v-skeleton-loader>
      <TimelineHeatMap
              ref="myheatmap"
              class="mx-auto"
              @get_more_data="more_epidemic_data"
              :style="first && loading && `visibility: hidden`"
      />

    </v-card>

    <v-card
            :loading="chartloading"
            width="98%"
            class="my-5 mx-auto justify-center"
            elevation="10"
            style="margin-bottom: 100px"
            min-width="400px"
    >
      <v-skeleton-loader
              v-if="first && chartloading"
              class="mx-auto"
              type="table"
              loading
      ></v-skeleton-loader>
<!--      <v-card-text class="mx-auto text-center"><h1>test1</h1></v-card-text>-->
      <NewDataChart
              ref="mypredictionchart"
              :style="first && chartloading && `visibility: hidden`"
              class="mx-auto py-2 font-weight-light"
      />
    </v-card>
    <v-snackbar
            v-model="notify"
            :timeout="3000"
            color="info"
    >
      <span><h3>提示：</h3>{{notifyMessage}}</span>
      <v-btn
              dark
              text
              @click="notify = false"
      >
        Close
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script>
  import TimelineHeatMap from '../components/TimelineHeatMap'
  import NewDataChart from '../components/NewDataChart'
  import vue from "vue";
  import apis from "../api";
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
    '黑龙江': '黑龙江省',
    'china': '中国', 'USA':'美国'
  };
  export default {
    name: 'PandemicMap',
    components: {TimelineHeatMap, NewDataChart},
    data() {
      return {
        count: 0,
        timeline_len: 30,
        first: true,
        loading: false,
        chartloading: false,
        show_more: false,
        cur_superiorCountry: '',
        cur_superiorProvince: '',
        cur_superiorLevel: 'world',
        map_changed: true, //标记当前鼠标点击事件发生之后，地图是否改变，如果发生了改变则该变量为true，响应事件结束之后此变量变回false
        tmieline_change: true,//时间轴是否发生变化
        place_changed: true,//如果这个变量为true，那么两个图都需要变化，否则都维持原样
        notify: false,
        notifyMessage: '',
      }
    },
    computed:{
      buttonwidth: function() {
        if(this.$vuetify.breakpoint.xs)
        {
          return '30%';
        }
        else
        {
          return '';
        }
      }
    },
    methods: {
      more_epidemic_data(){
        this.timeline_len = this.timeline_len * 2;
        this.show_more = true;
        this.map_changed = false;
        if(this.cur_superiorLevel === 'province' && this.cur_superiorCountry === 'USA')
        {
          this.cur_superiorLevel = 'country';
          this.show_more = false;
        }
        else if(this.cur_superiorLevel === 'world' && this.cur_superiorCountry === '')
        {
          this.cur_superiorLevel = 'world';
          this.show_more = false;
        }
        else{
          this.$refs.mypredictionchart.backup_data();
        }
        this.passPlaceandLevel();
        this.get_epidemic_data();
        this.map_changed = true;
        this.show_more = false;
      },
      returnWorldMap() {
        this.cur_superiorCountry = '';
        this.cur_superiorProvince= '';
        this.cur_superiorLevel = 'world';
        this.passPlaceandLevel();
        this.get_epidemic_data();
      },
      returnCountryMap(tmp_country) {
        this.cur_superiorCountry = tmp_country;
        this.cur_superiorProvince= '';
        this.cur_superiorLevel = 'country';
        this.passPlaceandLevel();
        this.get_epidemic_data();
      },
      passPlaceandLevel() {//传递this.cur_superiorPlace,this.cur_superiorLevel给子组件
        if (this.map_changed) {
          //热度图切换
          this.timeline_len = 30;
          this.$refs.myheatmap.placechange(this.cur_superiorCountry,this.cur_superiorProvince, this.cur_superiorLevel);
        }
        //以及折线图的切换
        this.$refs.mypredictionchart.placechange(this.cur_superiorCountry,this.cur_superiorProvince, this.cur_superiorLevel);
      },
      async get_epidemic_data() {//只在这个父页面获取一次数据即可
        //get datemin datemax
        const today = new Date();
        let date = {
          max: today.format('yyyy-mm-dd'),
          min: today.addDay(-this.timeline_len + 1).format('yyyy-mm-dd'),
        };
        if(this.show_more)
        {
          date.max = today.addDay(-this.timeline_len/2).format('yyyy-mm-dd');
        }
        if (this.map_changed) {
          this.loading = true;
        }
        this.chartloading = true;
        let res = '';
        //国家
        if (this.cur_superiorLevel === 'country') {
          var request_country = this.cur_superiorCountry;
          if (this.cur_superiorCountry === 'china')
            request_country = '中国';
          else if (this.cur_superiorCountry === 'USA')
            request_country = '美国';
          try {
            res = await vue.axios.get(apis.GET_EPIDEMIC_TIMELINE_COUNTRY, {
              params: {
                dataKind: 'activeCount,confirmedCount,curedCount,deadCount',
                country: request_country,
                verbose: '',
                dateMin: date.min,
                dateMax: date.max
              }
            });
          } catch (err) {
            console.error(` Cannot fetch country timeline data from backend with ${err}`);
          }
          if (!this.map_changed) {
            this.cur_superiorCountry = '';
            this.cur_superiorLevel = 'world';
          }
        } else if (this.cur_superiorLevel === 'province') {
          try {
            res = await vue.axios.get(apis.GET_EPIDEMIC_TIMELINE_PROVINCE, {
              params: {
                dataKind: 'activeCount,confirmedCount,curedCount,deadCount',
                country: request_filter[this.cur_superiorCountry],
                province: (this.cur_superiorCountry === 'china')?request_filter[this.cur_superiorProvince]:this.cur_superiorProvince,
                verbose: '',
                dateMin: date.min,
                dateMax: date.max
              }
            });
          } catch (err) {
            console.error(` Cannot fetch province timeline data from backend with ${err}`);
          }
        } else if (this.cur_superiorLevel === 'world') {
          try {
            res = await vue.axios.get(apis.GET_EPIDEMIC_TIMELINE_WORLD, {
              params: {
                dataKind: 'activeCount,confirmedCount,curedCount,deadCount',
                verbose: '',
                dateMin: date.min,
                dateMax: date.max
              }
            })
          } catch (err) {
            console.error(` Cannot fetch world timeline data from backend with ${err}`);
          }
        }
        this.dataImport(res);
        this.drawTimeAxis();
        this.map_changed = true;
        this.loading = false;
        this.chartloading = false;
        this.first = false;
      },
      dataImport(res) {//统一调用两个子组件的数据导入
        if (this.map_changed) {
          this.$refs.myheatmap.dataImport(res);
        }
        this.$refs.mypredictionchart.dataImport(res);
      },
      drawTimeAxis() {//统一调用两个子组件的绘图
        if (this.map_changed) {
          this.$refs.myheatmap.drawTimeAxis();
        }
        this.$refs.mypredictionchart.drawTimeAxis();
      },
      placechange(tmp_place) {//将修改cur_superiorCountry、cur_superiorProvince和cur_superiorLevel的工作集中到当前父页面中，子组件只需根据所传参数修改子组件当中的数据即可
        if (this.cur_superiorLevel === 'world') {
          if (tmp_place === '中国') {
            this.cur_superiorCountry = 'china';
            this.cur_superiorLevel = 'country';
          } else if (tmp_place === '美国') {
            this.cur_superiorCountry = 'USA';
            this.cur_superiorLevel = 'country';
          } else { // other countries:
            if (!vue.$cookies.get('notified')) {
              this.notify = true;
              this.notifyMessage = '当前仅支持中国、美国国内热度图，不过你可以在下方查看' + tmp_place + '疫情发展曲线';
              vue.$cookies.set('notified', true);
            }
            //这种情况下只修改折线图
            this.cur_superiorCountry = tmp_place;
            this.cur_superiorLevel = 'country';
            this.map_changed = false;//告诉echart map不用变
          }
        } else if (this.cur_superiorLevel === 'country') {
          if(this.cur_superiorCountry !== 'china')
          {
            this.map_changed = false;//告诉echart map不用变
          }
          this.cur_superiorLevel = 'province';
          this.cur_superiorProvince = tmp_place;
        } else if (this.cur_superiorLevel === 'province') {
          this.map_changed = false;//map不用刷新
          if(this.cur_superiorCountry !== 'china')
          {
            this.cur_superiorProvince = tmp_place;
          }
        }
        this.passPlaceandLevel();
      },
      initechart() {//用于初始化echart
        this.passPlaceandLevel();
        this.$refs.myheatmap.initechart();
        this.$refs.mypredictionchart.initechart();
      }
    },
    mounted() {
      this.initechart();
      this.$nextTick(async () => {
        await this.get_epidemic_data()
      });
      this.$refs.myheatmap.charts.on('click', (params) => {
        if (params.componentType === 'series') {
          this.placechange(params.name);
          this.get_epidemic_data();
        }
      });
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

  .page1 {
    display: flex;
    flex-direction: row;
  }

  .mypic {
    display: flex;
    flex-direction: column;
  }
</style>
