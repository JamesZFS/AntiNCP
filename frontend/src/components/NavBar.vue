<!--导航栏组件-->
<template>
  <el-menu
    :default-active="$route.path"
    class="navbar"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    router>
    <el-menu-item index="/">
      <img src="../assets/logo.png" class="logo">
    </el-menu-item>
    <el-menu-item index="1">
      <i class="el-icon-picture"></i>
      <span class="item_title" index="/1">疫情地图</span>
    </el-menu-item>
    <el-menu-item index="2">
      <i class="el-icon-s-order"></i>
      <span class="item_title" index="/2">疫情报道</span>
    </el-menu-item>
    <el-menu-item index="3">
      <i class="el-icon-view"></i>
      <span class="item_title" index="/2">热点关注</span>
    </el-menu-item>
    <el-menu-item index="4">
      <i class="el-icon-user-solid"></i>
      <span class="item_title" index="/2">关于我们</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
  // import Vue from 'vue'
  // import VueRouter from 'vue-router'
  // Vue.use(VueRouter)
  export default {
    name: 'navbar',
    data () {
      return {}
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

  .navbar:not(.el-menu--collapse) {
    display: flex;
    text-align: left;
    flex-direction: column;
    width: 15vw;
    min-width: 250px;
    height: 100vh;
    min-height: 500px;
    background-color: #ebeff3;
  }

  .logo {
    display: flex;
    display: -webkit-flex;
    align-items: center;
    justify-content: center;
    width: 9vw;
    min-width: 150px;
    height: 5vh;
    min-height: 50px;
  }

  .item_title {
    font-size: 20px;
  }

  .el-menu {
    background-color: #ebeff3;
    font-size: 20px;
  }

  .el-menu-item-group__title {
    font-size: 18px !important;
  }

  .el-menu-item {
    font-size: 20px !important;
  }
</style>
