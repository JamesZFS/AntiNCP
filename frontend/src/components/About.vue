<!-- Page4 -->
<template>
  <div class="page4">
    <el-card>
      <h3 slot="header">关于我们</h3>
      <p>码到退疫制作团队</p>
      <p>清华大学计算机系</p>
      <p>版本0.1.0</p>
      <p>本网站一共服务了{{ clientCount }}位用户🚀</p>
    </el-card>
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
        this.clientCount = (await this.axios.get(apis.GET_CLIENT_COUNT)).data;
      } catch (err) {
        this.$log.error('Fail to fetch client count!');
      }
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h3 {
    text-align: left;
  }

  p {
    color: #5e6d82;
    text-align: left;
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
