<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  import fetcher from './fetch/fetcher';
  export default {
    name: 'App',
    mounted() {
      fetcher.backendCommunicationTest();
      // for testing
      fetcher.getEpidemicDataAtTime('2020-2-20 1:00:00', 'confirmedCount', 'province', '湖南省')
        .then((result) => {
          console.log(result);
        });
    }
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
