<!--导航栏组件-->
<template>
  <div>
    <img src="../assets/logo.png" class="logo" alt="AntiNCP"/>
    <el-menu :default-active="$route.path" class="navbar" :collapse="isCollapse" router>
      <el-menu-item index="map">
        <i class="el-icon-picture"></i>
        <span class="item_title">疫情地图</span>
      </el-menu-item>
      <el-menu-item index="report">
        <i class="el-icon-s-order"></i>
        <span class="item_title">疫情报道</span>
      </el-menu-item>
      <el-menu-item index="hot">
        <i class="el-icon-view"></i>
        <span class="item_title">热点关注</span>
      </el-menu-item>
      <el-menu-item index="about">
        <i class="el-icon-user-solid"></i>
        <span class="item_title">关于我们</span>
      </el-menu-item>

      <el-menu-item v-model="isCollapse" @click="isCollapse=!isCollapse">
        <i v-if="isCollapse" class="el-icon-d-arrow-right"/>
        <i v-else class="el-icon-d-arrow-left"/>
        <span v-if="isCollapse" class="item_title">展开</span>
        <span v-else class="item_title">收起</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
  export default {
    name: 'navbar',
    data() {
      return {
        isCollapse: false
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .navbar:not(.el-menu--collapse) {
    display: flex;
    text-align: left;
    flex-direction: column;
    width: 12vw;
    min-width: 10vw;
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
    min-width: 100px;
    height: 5vh;
    min-height: 50px;
  }

  .menubutton {
    float: left;
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
