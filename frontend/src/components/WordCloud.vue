<!-- 词云图组件 -->
<template>
  <div align="center" justify="center" class="mt-10">
    <v-snackbar
            v-model="snackbar"
            :vertical="vertical"
            :timeout= 0
            color="white"
            style="width: 50vh;" justify="center" align="center" class="mr-0 pr-0"
    >
      <v-subheader class="title display-1 ml-0 pl-0">{{title}}</v-subheader>
      <v-divider
      ></v-divider>
      <div id="wordcloud" style="width: 50vh;height: 50vh;" justify="center" align="center" class="mt-7 ml-1"></div>
      <v-btn
              color="indigo"
              text
              @click="snackbar = false"
      >
        Close
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script>
  import echarts from 'echarts'
  import 'echarts-wordcloud'

  var timer = null;
  var wordcloud_data = '';
  export default {
    name: 'wordcloud',
    data() {
      return {
        count: 0,
        unclicked: true,
        snackbar: false,
        text: 'Want to know more? Select one date!',
        vertical: true,
        title: ''
      }
    },
    methods: {
      check() {
        let dom = document.getElementById('wordcloud');
        if (dom) {
          //  执行dom加载完成后的操作，例如echart的初始化操作
          console.log(dom.clientHeight);
          var charts = echarts.init(document.getElementById('wordcloud'));
          var maskImage = new Image();
          maskImage.width = dom.clientWidth;
          maskImage.height = dom.clientHeight;
          //重点：云彩图片的base64码
          maskImage.src = require("../assets/heartmask.png");
          // console.log(charts);
          maskImage.onload = function () {
            charts.setOption({
              tooltip: {
                trigger: 'item',
                formatter: '{b}热度：{c} '
              },
              visualMap: {
                show: false,
                min: 0,
                max: wordcloud_data[0].value,
                text: ['High', 'Low'],
                realtime: false,
                calculable: true,
                inRange: {
                  color: ['lightskyblue', 'yellow', 'orangered']
                }
              },
              series: {
                type: 'wordCloud',
                maskImage: maskImage,
                drawOutOfBound: true,
                // shape: 'circle',
                rotationRange: [0, 0],
                gridsize: 1,
                size: ['200%', '200%'],
                width: '150%',
                height: '150%',
                textStyle: {
                  // 悬停上去的颜色设置
                  emphasis: {
                    shadowBlur: 10,
                    shadowColor: '#333'
                  }
                },
                data: wordcloud_data
              }
            });
          };
          //  清除定时器
          if (!timer) {
            clearTimeout(timer)
          }
        } else {
          //  自我调用
          // console.log("dom not set");
          timer = setTimeout(this.check, 0)
        }
      },
      drawwordcloud(bubble) {
        this.snackbar = true;
        this.unclicked = false;
        this.title = bubble.title;
        timer = null;
        wordcloud_data = bubble.trends;
        this.check();
      },

    },
    // 调用
    mounted() {
      this.$nextTick(function () {
      })
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
</style>
