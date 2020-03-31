<!--导航栏组件-->
<template>
  <div>
    <el-menu
      mode="horizontal"
      :default-active="$route.path"
      collapse-transition
      router
    >
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

    </el-menu>
  </div>
</template>

<script>
  export default {
    name: 'navbar',
    data() {
      return {
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .navbar {
    display: flex;
    text-align: left;
    flex-direction: column;
    width: 12vw;
    min-width: 5vw;
    height: 100vh;
    background-color: #ebeff3;
  }

  .menubutton {
    float: left;
  }

  .item_title {
    font-size: small;
  }

  .el-menu {
    background-color: white;
    font-size: 20px;
  }

  .el-menu-item-group__title {
    font-size: 18px !important;
  }

  .el-menu-item {
    font-size: 20px !important;
  }

  .el-menu-item.is-active {
    background-color: #88ddee !important;
  }

</style>
