<!-- Page3 -->
<template>
  <div class="HotWords">
    <v-radio-group row wrap style="width: 50vw;">
      <v-switch v-model="alignTop" label="Toggle align-top" class="mx-4"></v-switch>
      <v-switch v-model="dense" label="Toggle dense" class="mx-4"></v-switch>
      <v-switch v-model="fillDot" label="Toggle fill-dot" class="mx-4"></v-switch>
      <v-switch v-model="hideDot" label="Toggle hide-dot" class="mx-4"></v-switch>
      <v-switch v-model="icon" label="Toggle icon" class="mx-4"></v-switch>
      <v-switch v-model="avatar" label="Toggle avatar" class="mx-4"></v-switch>
      <v-switch v-model="iconColor" label="Toggle icon color" class="mx-4"></v-switch>
      <v-switch v-model="reverse" label="Toggle reverse" class="mx-4"></v-switch>
      <v-switch v-model="left" label="Toggle left" class="mx-4"></v-switch>
      <v-switch v-model="right" label="Toggle right" class="mx-4"></v-switch>
      <v-switch v-model="small" label="Toggle small" class="mx-4"></v-switch>
    </v-radio-group>

    <v-timeline
      :align-top="alignTop"
      :dense="dense"
      :reverse="reverse"
      style="width: 70vw;"
    >
      <v-timeline-item
        v-for="item in items"
        :key="item.time"
        :fill-dot="fillDot"
        :hide-dot="hideDot"
        :icon="icon ? 'mdi-star' : ''"
        :icon-color=" iconColor ? 'deep-orange' : ''"
        :left="left"
        :right="right"
        :small="small"
      >
        <template v-slot:icon>
          <v-avatar v-if="avatar">
            <img src="http://i.pravatar.cc/64">
          </v-avatar>
        </template>
        <span slot="opposite" class="text-left">{{item.time}}</span>
        <v-card class="elevation-2">
          <v-card-title class="headline">{{item.time}}'s hot words</v-card-title>
          <v-card-text>
            {{item.content}}
          </v-card-text>
        </v-card>
      </v-timeline-item>
    </v-timeline>
    <!--    <v-card class="mx-auto" style="width: 90%;">-->
    <!--      <v-timeline dense='false'>-->
    <!--        <v-timeline-item>timeline item</v-timeline-item>-->
    <!--        <v-timeline-item>timeline item</v-timeline-item>-->
    <!--        <v-timeline-item>timeline item</v-timeline-item>-->
    <!--      </v-timeline>-->
    <!--    </v-card>-->
    <!--    <div>-->
    <!--      <TimelineWordCloud></TimelineWordCloud>-->
    <!--    </div>-->
  </div>
</template>

<script>
  import NavBar from './NavBar'
  import TimelineWordCloud from './modules/TimelineWordCloud'
  import vue from "vue";
  import apis from "../../config/apis";

  export default {
    name: 'HotWords',
    components: {NavBar, TimelineWordCloud},
    data() {
      return {
        alignTop: false,
        avatar: false,
        dense: false,
        fillDot: false,
        hideDot: false,
        icon: false,
        iconColor: false,
        left: false,
        reverse: false,
        right: false,
        small: false,
        items:[]
      }
    },
    methods:{
      async get_test_data() {//只在这个父页面获取一次数据即可
        try {
          var res = await vue.axios.get(apis.GET_EPIDEMIC_TIMELINE_COUNTRY, {
            params: {
              dataKind: 'suspectedCount,confirmedCount,curedCount,deadCount',
              country: '中国',
              verbose: ''
            }
          });
          console.log(res);
          for(var i = 0;i<10;i++){
            var tmp_item = {time:'',content:''};
            tmp_item.time = res.data.countryTimeline.deadCount[i][0];
            tmp_item.content = 'content example'+res.data.countryTimeline.deadCount[i][0];
            this.items.push(tmp_item);
            console.log(tmp_item);
          }
          console.log(this.items);
        } catch (err) {
          vue.$log.error(` Cannot fetch country timeline data from backend with ${err}`);
        }
      }
    },
    mounted() {
      this.$nextTick(async () => {
        await this.get_test_data()
      });
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

  .HotWords {
    display: flex;
    flex-direction: row;
  }
</style>
