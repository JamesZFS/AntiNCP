<template>
  <div id="app">
    <el-container>
      <el-header class="header">
        <div>
          <h1 style="float: left">
            <img src="./assets/logo.png" class="logo" alt="AntiNCP"/>
          </h1>
          <div style="float: left">
            <NavBar></NavBar>
          </div>
        </div>
      </el-header>
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

  .header {
    text-align: left;
    box-sizing: border-box;
    border-bottom: 2px solid #dcdfe6;
  }

  .logo {
    align-items: center;
    justify-content: center;
    width: 115px;
    height: 40px;
    position: relative;
    top: -15px;
    display: inline;
    margin-right: 20px;
  }
</style>
