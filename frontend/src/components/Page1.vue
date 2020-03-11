<!-- Page1 -->
<template>
  <div class="page1">
    <div class="sidebar-boxlist">
      <NavBar></NavBar>
    </div>
    <div>
      <h1>中国新冠肺炎疫情热度图</h1>
      <HeatMap></HeatMap>
    </div>
  </div>
</template>

<script>
  import NavBar from './NavBar'
  import HeatMap from './HeatMap'

  export default {
    name: 'pag1',
    components: {NavBar, HeatMap},
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

  .page1 {
    display: flex;
    flex-direction: row;
  }
</style>
