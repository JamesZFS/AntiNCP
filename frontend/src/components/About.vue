<!-- Page4 -->
<template>
  <div class="page4">
    <div>
      <p>码到退疫制作团队</p>
      <p>清华大学计算机系</p>
      <p>版本0.1.0</p>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar'
import TimelineHeatMap from './modules/TimelineHeatMap'
export default {
  name: 'About',
  components: {NavBar, TimelineHeatMap},
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

  .page4 {
    display: flex;
    flex-direction: row;
  }
</style>
