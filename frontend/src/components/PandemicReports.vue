<!-- Page2 -->
<template>
  <v-container>
    <v-card class="mt-5">
      <h1>疫情相关报道时间轴，等待开发</h1>
    </v-card>
  </v-container>
</template>

<script>
  import NavBar from './NavBar'

  export default {
    name: 'PandemicReports',
    components: {NavBar},
    data() {
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

  .page2 {
    display: flex;
    flex-direction: column;
  }
</style>
