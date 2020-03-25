<!-- Page1 -->
<template>
  <div class="page1">
    <div class="mypic">
      <div>
        <el-button @click="returnworldmap()">全球疫情地图</el-button>
        <el-button @click="returnchinamap()">中国疫情地图</el-button>
      </div>
      <div margin="100px 0">
        <TimelineHeatMap ref="myheatmap"></TimelineHeatMap>
      </div>
      <div margin="100px 0">
        <PredictionMap ref="mypredictionmap"></PredictionMap>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar'
import TimelineHeatMap from './modules/TimelineHeatMap'
import PredictionMap from './modules/PredictionMap'
export default {
  name: 'PandemicMap',
  components: {NavBar, TimelineHeatMap,PredictionMap},
  data () {
    return {
      count: 0
    }
  },
  methods:{
    returnworldmap() {
      this.$refs.myheatmap.returnworldmap()
      this.$refs.mypredictionmap.returnworldmap()
      // console.log('asdf')
    },
    returnchinamap() {
      this.$refs.myheatmap.returnchinamap()
      this.$refs.mypredictionmap.returnchinamap()
      // console.log('qwer')
    }
  },
  mounted() {
    this.$refs.myheatmap.charts.on('click',(params) => {
      console.log('1111')
      if (params.componentType == 'timeline') {
        this.$refs.myheatmap.timelineclick(params.dataIndex)
      } else {
        //热度图切换
        this.$refs.myheatmap.placechange(params.name)
        console.log('2222')
        //以及折线图的切换
        this.$refs.mypredictionmap.placechange(params.name)
        console.log('3333')
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
