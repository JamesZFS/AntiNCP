<template>
  <v-app id="app">
    <v-container>
      <NavBar></NavBar>
      <v-container class="pa-11">
        <router-view></router-view>
      </v-container>
    </v-container>
  </v-app>
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
