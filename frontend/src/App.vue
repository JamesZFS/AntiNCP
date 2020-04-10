<template>
  <v-app id="inspire">
    <v-navigation-drawer
            v-model="drawer.open"
            :clipped="$vuetify.breakpoint.lgAndUp"
            app
    >
      <v-list rounded nav>
        <template v-for="item in drawer.items">
          <v-list-group
                  v-if="item.children"
                  :key="item.text"
                  v-model="item.model"
                  :prepend-icon="item.model ? item.icon : item['icon-alt']"
                  append-icon=""
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item
                    v-for="(child, i) in item.children"
                    :key="i"
                    link
            >
              <v-list-item-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ child.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item
                  v-else
                  :key="item.text"
                  link
                  @click="item.path && $router.push(item.path)"
          >
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
            :clipped-left="$vuetify.breakpoint.lgAndUp"
            app
            color="blue darken-3"
            dark
    >
      <v-row no-gutters>
        <v-col cols="auto" class="d-flex mt-1">
          <v-app-bar-nav-icon @click.stop="drawer.open ^= 1"/>
          <v-toolbar-title
                  class="ml-0 pl-4"
                  @click="$router.push('/')"
          >
            <v-btn
                    class="hidden-xs-only ml-n4"
                    text
                    x-large
            >
              CodeVista · AntiNCP
            </v-btn>
            <v-btn
                    class="hidden-sm-and-up"
                    rounded
                    icon
            >
              <v-icon>mdi-home</v-icon>
            </v-btn>
          </v-toolbar-title>
        </v-col>

        <!--   View Title:   -->
        <v-col cols="auto" class="mr-auto">
          <v-container class="align-center">
            <h2 class="text-center font-weight-light"> {{ getCurrentViewName() }}</h2>
          </v-container>
        </v-col>

        <v-col cols="auto">
          <v-tooltip bottom :open-delay="500">
            <template v-slot:activator="{on}">
              <v-btn
                      icon
                      x-large
                      v-on="on"
              >
                <v-avatar
                        size="32px"
                        tile
                >
                  <v-img
                          src="./assets/logo-white.png"
                          alt="logo"
                  />
                </v-avatar>
              </v-btn>
            </template>
            这个没用的，别点我了~
          </v-tooltip>
        </v-col>

      </v-row>
    </v-app-bar>

    <v-content>
      <transition name="fade">
        <router-view v-on:click-menu="drawer.open ^= 1"/>
      </transition>
    </v-content>

    <!--  To top button:  -->
    <v-scale-transition>
      <v-btn
              v-scroll="onScroll"
              v-show="fab"
              fab
              dark
              fixed
              bottom
              right
              color="pink"
              @click="toTop"
      >
        <v-icon>mdi-arrow-up</v-icon>
      </v-btn>
    </v-scale-transition>

  </v-app>
</template>

<script>
  const cname2zh = {
    'Map': '疫情地图',
    'Trends': '热点关注',
    'Reports': '疫情报道',
    'About': '关于我们',
  };

  export default {
    props: {},
    methods: {
      getCurrentViewName() {
        let cname = this.$router.getMatchedComponents()[0].name;
        return cname2zh[cname];
      },
      onScroll(e) {
        if (window === undefined) return;
        const top = window.pageYOffset || e.target.scrollTop || 0;
        this.fab = top > 20;
      },
      toTop() {
        this.$vuetify.goTo(0);
      }
    },
    data: () => ({
      fab: false,
      drawer: {
        open: null,
        items: [
          {text: '主页', icon: 'mdi-home', path: '/'},
          {text: '疫情地图', icon: 'mdi-map-marker-radius-outline', path: '/map'},
          {text: '热点关注', icon: 'mdi-view-dashboard-variant', path: '/trends'},
          {text: '疫情报道', icon: 'mdi-timeline-text-outline', path: '/reports'},
          {text: '关于我们', icon: 'mdi-account-group', path: '/about'},
        ],
      }
    }),
  }
</script>

<style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }

  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
  {
    opacity: 0;
  }
</style>