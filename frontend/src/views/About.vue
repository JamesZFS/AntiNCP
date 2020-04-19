<template>
  <v-card class="mx-auto" width="50%" min-width="400px" style="margin-top: 10vh">
    <v-system-bar/>
    <v-card-text>
      <h2 slot="header">关于我们</h2> <br/>
      <p>码到退疫制作团队(CodeVista)</p>
      <p>清华大学计算机系(THUCST)</p>
      <p>版本 1.0.0</p>
      <p>我们一共服务了 <span class="purple--text">{{ clientCount }}</span> 位用户🚀</p>
      <br/>
      <h3>Credit:</h3>
      <br/>
      <p>疫情数据来源: <a :href="source.epidemic">canghailan/Wuhan-2019-nCoV</a></p>
      <p>新闻数据来源：BBC, CNN, China Daily 等多家媒体的RSS API</p>
      <p>参考API：<a :href="source.postman">Postman团队提供的API列表</a></p>
      <p>UI框架参考：<a :href="source.framework">Google Contact UI Layout</a></p>
      <p>更多参考：<a :href="source.other">pomber/covid19</a></p>
    </v-card-text>
  </v-card>
</template>

<script>
  import api from '../api';

  export default {
    name: "About",
    async created() {
      this.clientCount = (await this.axios.get(api.GET_CLIENT_COUNT)).data;
    },
    data() {
      return {
        clientCount: null,
        source: {
          epidemic: 'https://raw.githubusercontent.com/canghailan/Wuhan-2019-nCoV/master/Wuhan-2019-nCoV.csv',
          postman: 'https://covid-19-apis.postman.com/?mkt_tok=eyJpIjoiTXpGaE5tUm1ZVFl6Tm1JNSIsInQiOiIxSUtFcm40QzJmRkF3eU5STjltVExiK0VCS2RMZ21zVUZqb0dlUUh2d1BUYU1XSWp4YUFkd1JDaytUVE5CZE5nTWlsMlAzRHVQdTh3MGdScmV1ZnZWMGpha1dFc3FUdStGSFViQWxhdkVwZ3Zkc3V2bmtITVROQm5WZlZPVEI1MCJ9',
          framework: 'https://github.com/vuetifyjs/vuetify/tree/master/packages/docs/src/layouts/layouts/demos/google-contacts.vue',
          other: 'https://github.com/pomber/covid19'
        }
      }
    }
  }
</script>

<style scoped>

</style>