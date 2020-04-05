<!--导航栏组件-->
<template>
  <v-navigation-drawer
    v-model="drawer"
    class="deep-purple darken-3"
    :mini-variant="miniVariant"
    :right="right"
    permanent
    expand-on-hover
    :src="bg"
    absolute
    dark
  >
    <v-list
      dense
      nav
      class="py-0"
    >
      <v-list-item two-line :class="miniVariant && 'px-0'">
        <v-list-item-content>
          <img src="../assets/logo.png" width="15vw">
        </v-list-item-content>
        <v-list-item-content>
          <v-list-item-title>ANTINCP</v-list-item-title>
          <v-list-item-subtitle>from THU</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item
        v-for="item in items"
        :key="item.title"
        link
        :to="item.index"
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
  export default {
    name: 'navbar',
    data() {
      return {
        drawer: true,
        items: [
          {title: '疫情地图', icon: 'mdi-map-marker-radius-outline', index: '/map'},
          {title: '疫情报道', icon: 'mdi-timeline-text-outline', index: '/report'},
          {title: '热点关注', icon: 'mdi-view-dashboard-variant', index: '/hot'},
          {title: '关于我们', icon: 'mdi-account-group', index: '/about'},
        ],
        color: '#B388FF',
        colors: [
          'primary',
          'blue',
          'success',
          'red',
          'teal',
        ],
        right: false,
        miniVariant: true,
        expandOnHover: false,
        background: false,
      }
    },
    computed: {
      bg() {
        return this.background ? 'https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg' : undefined
      },
    },
    method() {
    },
    mounted() {

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .navbar {
    position: fixed;
    display: flex;
    text-align: left;
    flex-direction: column;
    width: 12vw;
    min-width: 5vw;
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
