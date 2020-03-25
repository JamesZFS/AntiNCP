<template>
  <div id="app">
    <el-container>

      <el-aside style="width: 13vw">
          <NavBar></NavBar>
      </el-aside>

      <el-main>
        <router-view/>
      </el-main>

    </el-container>
  </div>
</template>

<script>
  import NavBar from "./components/NavBar";

  export default {
    name: 'App',
    mounted() {
    },
    components: {NavBar}
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
</style>
