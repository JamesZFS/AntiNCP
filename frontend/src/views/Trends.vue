<template>
  <v-container>
    <v-timeline
            v-if="!loading"
            class="mx-auto my-4 pa-4"
            style="height: 100%"
            :dense="$vuetify.breakpoint.xs"
    >
      <v-timeline-item
              v-for="(bubble, index) in bubbles"
              :key="index"
      >
        <template v-if="index === 0" v-slot:icon>
          <v-icon color="white">
            mdi-star
          </v-icon>
        </template>

        <v-card
                class="elevation-3 lighten-1"
                :color="colors[index % colors.length]"
        >
          <v-card-title class="title display-1 white--text">{{bubble.title}}</v-card-title>
          <v-card-text class="white text--primary pt-2">
            <!--       Word bubbles:    -->
            <v-tooltip
                    v-for="(trend, index) in bubble.trends"
                    :key="index"
                    bottom
            >
              <template v-slot:activator="{ on }">
                <v-chip
                        v-on="on"
                        class="ma-1"
                        filter
                        :input-value="trend.selected"
                        :color="trend.selected ? '#90CAF9' : trend.color"
                        :class="trend.textColor && `${trend.textColor}--text`"
                        @click="onClickSomeTrend(trend, bubble)"
                >
                  <v-icon v-if="trend.star" left>mdi-star</v-icon>
                  {{trend.name}}
                </v-chip>
              </template>
              <span>热度：{{Math.round((Math.log(trend.value) + Number.EPSILON) * 100) / 100}}</span>
              <div v-if="trend.ascendBy">
                <span>
                  増势：{{isNaN(trend.ascendBy) ? 'Infinity' : Math.round((trend.ascendBy + Number.EPSILON) * 100 ) / 100}}
                  <v-icon color="white">mdi-arrow-up</v-icon>
                </span>
              </div>
            </v-tooltip>
            <v-btn
                    color="accent"
                    class="d-block mx-auto mt-2 px-5 darken-4"
                    outlined
                    small
                    @click="onGenerateWordCloud(bubble)"
            >
              <v-icon>mdi-hand-pointing-left</v-icon>
              &nbsp; 生成词云
            </v-btn>
          </v-card-text>
        </v-card>
      </v-timeline-item>
    </v-timeline>
    <v-skeleton-loader
            v-else
            type="article@4"
            width="60vw"
            class="mx-auto my-4"
    />
    <v-navigation-drawer
            v-model="rightDrawer"
            absolute
            clipped
            right
            width="400"
    >
      <v-card-title>
        <h2>相关报道</h2>
      </v-card-title>
      <v-divider/>
      <v-skeleton-loader v-if="loadingReports" type="list-item-three-line@6"/>
      <ArticleList
              v-else
              style="overflow-y: scroll"
              :style="this.$vuetify.breakpoint.mdAndDown && 'height: 80vh'"
              :items="relativeReports"
      />
    </v-navigation-drawer>
    <WordCloud ref="MyWorldCloud" class="d-block" style="width: 96%;"></WordCloud>

    <!--  Fetch reports top button:  -->
    <v-tooltip left>
      <template v-slot:activator="{ on }">
        <v-scale-transition>
          <v-btn
                  v-show="fab"
                  v-on="on"
                  fab
                  dark
                  fixed
                  bottom
                  right
                  color="cyan"
                  style="margin-bottom: 80px"
                  @click="onFabClick"
          >
            <v-icon>mdi-pencil-box-outline</v-icon>
          </v-btn>
        </v-scale-transition>
      </template>
      <span>打开/关闭相关报道</span>
    </v-tooltip>

  </v-container>
</template>

<script>
  import WordCloud from '../components/WordCloud';
  import ArticleList from "../components/ArticleList";
  import Vue from "vue";
  import api from "../api";
  import deepcopy from 'deepcopy';
  import {processArticles} from "../utils";

  export default {
    name: "Trends",
    components: {ArticleList, WordCloud},
    data() {
      return {
        loading: false,
        bubbles: [{  // list of bubbles
          title: '1/1',
          date: {min: new Date('2020/1/1'), max: new Date('2020/5/1')},
          trends: [
            {
              name: 'demo',
              value: 123,
              star: true,
              color: 'orange',
            },
            {
              name: 'haha',
              value: 10,
              color: 'green'
            },
            {
              name: 'ok',
              value: 5,
              selected: true
            }
          ]
        }],
        colors: ['amber', 'blue', 'teal', 'purple', 'cyan', 'black', 'orange'],
        selectedTrends: [],
        selectedDate: {min: null, max: null},
        rightDrawer: false,
        relativeReports: [],
        fab: false,
        loadingReports: false,
      };
    },
    methods: {
      onGenerateWordCloud(curBubble) {
        this.$refs.MyWorldCloud.drawwordcloud(curBubble);
      },
      async refresh() {
        this.loading = true;
        this.bubbles = await fetchTrendBubbles(1, 15, 40);
        this.loading = false;
      },
      clearCurrentSelection() {
        for (let trend of this.selectedTrends) {
          trend.selected = false;
        }
        this.selectedTrends = [];
        this.selectedDate = {min: null, max: null};
      },
      onClickSomeTrend(trend, bubble) {
        if (bubble.date !== this.selectedDate) { // not from the same bubble
          // alert(`${JSON.stringify(this.selectedDate)} !== ${JSON.stringify(bubble.date)}`);
          this.clearCurrentSelection();
          this.selectedDate = bubble.date;
          this.selectedTrends.push(trend);
          trend.selected = true;
        } else { // from the same bubble
          // alert(`${JSON.stringify(this.selectedDate)} === ${JSON.stringify(bubble.date)}`);
          let index = this.selectedTrends.indexOf(trend);
          if (index >= 0) { // cancel
            this.selectedTrends.splice(index, 1);
            trend.selected = false;
          } else { // select
            this.selectedTrends.push(trend);
            trend.selected = true;
          }
        }
        this.fab = this.selectedTrends.length > 0 || this.rightDrawer;
      },
      onFabClick() {
        if (this.rightDrawer) {
          this.rightDrawer = false;
        } else {
          this.rightDrawer = true;
          this.$vuetify.goTo(0);
          this.loadRelativeReports();
        }
      },
      loadRelativeReports() {
        let queryWords = this.selectedTrends.map(x => x.name).join(',');
        // alert(queryWords);
        this.$nextTick(async () => {
          this.loadingReports = true;
          this.relativeReports = await fetchArticlesByWords(
              queryWords, 'and',
              this.selectedDate.min, this.selectedDate.max
          );
          if (this.relativeReports.length === 0) {
            this.relativeReports.push({
              header: '未找到相关结果（建议减少查询词）'
            })
          }
          this.loadingReports = false;
        });
      }
    },
    created() {
      this.refresh();
    }
  }

  async function fetchTrendBubbles(timeWindow, n_bubble, n_trend) {//只在这个父页面获取一次数据即可
    let date = {
      max: new Date(),
      min: new Date().addDay(-timeWindow + 1),
    };
    let bubbles = [];
    for (var i = 0; i < n_bubble + 1; i++, date.min = date.min.addDay(-timeWindow), date.max = date.max.addDay(-timeWindow)) {
      try {
        var res = await Vue.axios.get(api.GET_TRENDS_TIMELINE
            .replace(':dateMin', date.min.toISOString())
            .replace(':dateMax', date.max.toISOString()), {
          params: {
            limit: 500,
          }
        });
        if (res.data.length === 0) continue;
        let bubble = {
          title: (timeWindow === 1
              ? `${date.min.format('mm/dd')}`
              : `${date.min.format('mm/dd')} - ${date.max.format('mm/dd')}`)
              + ' 热词',
          date: deepcopy(date),
          trends: res.data,
        };
        bubbles.push(bubble);
      } catch (err) {
        console.error(`Cannot fetch trends timeline data from backend with ${err}`);
        throw err;
      }
    }
    for (let i = 0; i < bubbles.length - 1; ++i) { // all but last
      Object.assign(bubbles[i].trends[0], {
        star: true, color: 'orange', textColor: 'white'
      });
      bubbles[i].trends = bubbles[i].trends.slice(0, n_trend);
      trendHelper(bubbles[i].trends, bubbles[i + 1].trends);
    }
    bubbles.pop();
    return bubbles;
  }


  function trendHelper(newTrends, oldTrends) { // diff two trend bubbles, modify newTrends in place
    let oldTrendMap = new Map(oldTrends.map(x => [x.name, x.value]));
    for (let trend of newTrends) {
      if (trend.star) continue;
      let oldVal = oldTrendMap.get(trend.name) || 0;
      let ascendBy = trend.value / oldVal;
      if (ascendBy >= 10) { // mark as rising word
        Object.assign(trend, {
          color: 'rgba(16,173,16,1)',
          textColor: 'white',
          ascendBy
        });
      } else if (ascendBy >= 1.2) { // ascending
        let alpha = Math.pow(ascendBy / 10.0, 0.5);
        Object.assign(trend, {
          color: `rgba(16,173,16,${alpha})`,
          textColor: 'black',
          ascendBy
        });
      }
    }
  }

  async function fetchArticlesByWords(words, mode, dateMin, dateMax, articlesLimit = 30) {
    try {
      var res = await Vue.axios.get(api.GET_TRENDS_ARTICLE_IDS
          .replace(':dateMin', dateMin.toISOString())
          .replace(":dateMax", dateMax.toISOString()), {
        params: {words, mode}
      });
    } catch (e) {
      console.error('error fetching articles ids by words:', e);
      return [];
    }
    let ids = res.data.articleIds;
    if (ids.length === 0) {
      return [];
    }
    try {
      res = await Vue.axios.post(api.GET_ARTICLES_POST, {params: {ids: ids.slice(0, articlesLimit)}});
    } catch (e) {
      console.error('error fetching articles by ids:', e);
      return [];
    }
    return processArticles(res.data.articles);
  }

</script>

<style scoped>

</style>
