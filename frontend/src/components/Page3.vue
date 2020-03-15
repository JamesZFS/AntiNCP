<!-- Page3 -->
<template>
  <div class="page3">
    <div class="sidebar-boxlist">
      <NavBar></NavBar>
    </div>
    <div>
      <h1>xx省新冠肺炎疫情相关词云</h1>
      <h2>数据来自各地主流媒体报道</h2>
      <TimelineWordCloud></TimelineWordCloud>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar'
import TimelineWordCloud from './TimelineWordCloud'
export default {
  name: 'pag3',
  components: {NavBar,TimelineWordCloud},
  data () {
    return {
      count: 0
    }
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

  .page3 {
    display: flex;
    flex-direction: row;
  }
</style>
