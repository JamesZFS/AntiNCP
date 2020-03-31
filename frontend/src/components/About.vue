<!-- Page4 -->
<template>
  <div class="page4">
    <div>
      <p>码到退疫制作团队</p>
      <p>清华大学计算机系</p>
      <p>版本0.1.0</p>
      <br/>
      <p>本网站一共服务了{{ clientCount }}位用户🚀</p>
    </div>
  </div>
</template>

<script>
  import NavBar from './NavBar'
  import TimelineHeatMap from './modules/TimelineHeatMap'
  import apis from "../../config/apis";

  export default {
    name: 'About',
    components: {NavBar, TimelineHeatMap},
    data() {
      return {
        count: 0,
        clientCount: 0,
      }
    },
    async beforeCreate() {
      try {
        this.clientCount = await this.axios.get(apis.GET_CLIENT_COUNT);
      } catch (err) {
        this.$log.error('Fail to fetch client count!');
      }
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }

  p {
    font-size: 14px;
    color: #5e6d82;
    line-height: 1.5em;
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
