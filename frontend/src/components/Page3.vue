<!-- Page3 -->
<template>
  <div class="page3">
    <div class="sidebar-boxlist">
      <NavBar></NavBar>
    </div>
    <div>
      <h1>page3</h1>
    </div>
  </div>
</template>

<script>
  import NavBar from './NavBar'

  export default {
    name: 'pag3',
    components: {NavBar},
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

  .page3 {
    display: flex;
    flex-direction: row;
  }
</style>
