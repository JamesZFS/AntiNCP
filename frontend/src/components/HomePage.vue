<!-- 主页 -->
<template>
  <div class="homepage">
    <div class="sidebar-boxlist">
      <NavBar></NavBar>
    </div>
    <div>
      <HeatMap></HeatMap>
    </div>
  </div>
</template>

<script>
  // import Vue from 'vue'
  import NavBar from './NavBar'
  import HeatMap from './HeatMap'

  export default {
    name: 'homepage',
    components: {NavBar, HeatMap},
    data () {
      return {}
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

  .homepage {
    display: flex;
    flex-direction: row;
  }
</style>
