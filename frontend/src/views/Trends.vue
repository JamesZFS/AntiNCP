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

        <v-hover>
          <template v-slot="{hover}">
            <v-card
                class="lighten-1"
                :elevation="hover ? 16 : 3"
                :color="bubble.color"
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
                        :color="trend.selected ? '#90CAF9' : trend.color"
                        :class="trend.textColor && `${trend.textColor}--text`"
                        @click="onClickSomeTrend(trend, bubble)"
                    >
                      <v-icon v-if="trend.star" left>mdi-star</v-icon>
                      {{trend.name}}
                    </v-chip>
                  </template>
                  <div>热度：{{trend.value}}</div>
                  <div>増势：{{trend.incr}}</div>
                  <div v-if="trend.ascendBy">
                <span>
                  増势：{{isNaN(trend.ascendBy) ? 'Infinity' : Math.round((trend.ascendBy + Number.EPSILON) * 100 ) / 100}}
                  <v-icon color="white">mdi-arrow-up</v-icon>
                </span>
                  </div>
                </v-tooltip>
                <v-card-actions class="mb-n3">
                  <v-spacer></v-spacer>
                  <v-btn
                      class="px-1"
                      color="success darken-2"
                      text
                      @click="onMoreTrendsInABubble(bubble)"
                  >
                    <v-icon>mdi-tray-plus</v-icon>
                    &nbsp; 查看更多
                  </v-btn>
                  <v-btn
                      class="px-1"
                      color="info darken-2"
                      text
                      @click="onGenerateWordCloud(bubble)"
                  >
                    <v-icon>mdi-blur</v-icon>
                    &nbsp; 生成词云
                  </v-btn>
                </v-card-actions>
              </v-card-text>
            </v-card>
          </template>
        </v-hover>
      </v-timeline-item>
    </v-timeline>
    <v-skeleton-loader
        v-else
        type="article@10"
        width="60vw"
        class="mx-auto my-4"
    />
    <v-skeleton-loader
        v-if="stillMoreBubbles"
        type="article@2"
        width="60vw"
        class="mx-auto my-4"
        v-intersect="onScrollToEnd"
    />
    <v-alert
        v-else
        type="warning"
        class="mx-5 my-4"
    >
      没有更多了。
    </v-alert>

    <v-dialog
        v-if="$vuetify.breakpoint.xs"
        v-model="displayReports"
        fullscreen
        transition="dialog-bottom-transition"
    >
      <v-card>
        <v-app-bar fixed dark>
          <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="displayReports = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-app-bar>
        <v-skeleton-loader v-if="loadingReports" type="list-item-three-line@6"/>
        <ArticleList
            v-else
            :items="relativeReports"
        />
      </v-card>
    </v-dialog>

    <v-dialog
        v-else
        v-model="displayReports"
        width="90%"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{dialogTitle}}</span>
        </v-card-title>
        <v-divider/>
        <v-skeleton-loader v-if="loadingReports" type="list-item-three-line@6"/>
        <ArticleList
            v-else
            :items="relativeReports"
        />
      </v-card>
    </v-dialog>

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
      <span>相关报道</span>
    </v-tooltip>

  </v-container>
</template>

<script>
    import WordCloud from '../components/WordCloud';
    import ArticleList from "../components/ArticleList";
    import Vue from "vue";
    import api from "../api";
    import deepcopy from 'deepcopy';
    import {processArticles, colorLerp, hexToRgb} from "../utils";

    const colorGrey = [217, 217, 217];
    const colorGreen = [16, 173, 16];
    const colorDark = [110, 110, 110];
    let colorPrimary;
    let colorAccent;

    export default {
        name: "Trends",
        components: {ArticleList, WordCloud},
        data: () => ({
            loading: false,
            bubbles: [],
            selectedTrends: [],
            selectedDate: {min: null, max: null},
            displayReports: false,
            relativeReports: [],
            fab: false,
            loadingReports: false,
            stillMoreBubbles: true,
        }),
        computed: {
            dialogTitle() {
                let words = this.selectedTrends.map(x => x.name);
                let ret;
                if (words.length === 0) {
                    ret = 'Unselected';
                } else if (words.length <= 3) {
                    ret = words.join(',');
                } else {
                    ret = words.slice(0, 3).join(',') + '...';
                }
                return ret + ' 相关报道';
            }
        },
        methods: {
            async refresh() {
                this.loading = true;
                const today = new Date();
                this.bubbles = await fetchTrendBubbles(today, 1, 7, 30);
                this.loading = false;
            },
            clearCurrentSelection() {
                for (let trend of this.selectedTrends) {
                    trend.selected = false;
                }
                this.selectedTrends = [];
                this.selectedDate = {min: null, max: null};
            },
            async loadRelativeReports() {
                let queryWords = this.selectedTrends.map(x => x.name).join(',');
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
            },
            onGenerateWordCloud(curBubble) {
                this.$refs.MyWorldCloud.drawwordcloud(curBubble);
            },
            onClickSomeTrend(trend, bubble) {
                // this.selectedTrends = [trend];
                // this.selectedDate = bubble.date;
                // return this.onFabClick();
                if (bubble.date !== this.selectedDate) { // not from the same bubble
                    this.clearCurrentSelection();
                    this.selectedDate = bubble.date;
                    this.selectedTrends.push(trend);
                    trend.selected = true;
                } else { // from the same bubble
                    let index = this.selectedTrends.indexOf(trend);
                    if (index >= 0) { // cancel
                        this.selectedTrends.splice(index, 1);
                        trend.selected = false;
                    } else { // select
                        this.selectedTrends.push(trend);
                        trend.selected = true;
                    }
                }
                this.fab = this.selectedTrends.length > 0 || this.displayReports;
            },
            async onFabClick() {
                await this.loadRelativeReports();
                this.displayReports = true;
            },
            async onScrollToEnd(entries, observer, isIntersecting) { // load more bubbles
                if (this.loading || !isIntersecting) return;
                let lastDay = this.bubbles[this.bubbles.length - 1].date.min.addDay(-1);
                let newBubbles = await fetchTrendBubbles(lastDay, 1, 7, 30);
                if (newBubbles.length > 0) this.bubbles = this.bubbles.concat(newBubbles);
                else this.stillMoreBubbles = false; // no more
            },
            async onMoreTrendsInABubble(bubble) {
                let temp = await fetchTrendBubbles(bubble.date.max, 1, 1, bubble.trends.length + 30);
                Object.assign(bubble, temp[0]);
                this.clearCurrentSelection();
            },
        },
        created() {
            colorPrimary = hexToRgb(this.$vuetify.theme.themes.light.primary);
            colorAccent = hexToRgb(this.$vuetify.theme.themes.light.accent);
            this.refresh();
        },
    }

    function valueToDegree(value) {
        return Math.round(value * 1e5 + Number.EPSILON) / 1e2;
    }

    async function fetchTrendBubbles(lastDate, timeWindow, n_bubble, n_trend) {
        const today = new Date();
        let date = {
            max: lastDate,
            min: lastDate.addDay(-timeWindow + 1),
        };
        let bubbles = [];
        let jobs = [];
        for (let i = 0; i < n_bubble; i++, date.min = date.min.addDay(-timeWindow), date.max = date.max.addDay(-timeWindow)) {
            jobs.push(new Promise(async (resolve, reject) => {
                let curIdx = i;
                let curDate = deepcopy(date);
                try {
                    var res = await Vue.axios.get(api.GET_TRENDS_TIMELINE
                        .replace(':dateMin', curDate.min.format('yyyy-mm-dd'))
                        .replace(':dateMax', curDate.max.format('yyyy-mm-dd')), {
                        params: {limit: n_trend}
                    });
                    if (res.data.length === 0) {
                        resolve();
                        return;
                    }
                    let bubble = {
                        title: (timeWindow === 1
                            ? `${curDate.min.format('mm/dd')}`
                            : `${curDate.min.format('mm/dd')} - ${curDate.max.format('mm/dd')}`)
                            + ' 热词',
                        date: curDate,
                        trends: res.data,
                    };
                    { // compute color of bubble, suggested by @Suiyi
                        let alpha = Math.tanh(today.dayDiff(curDate.max) / 10.0); // [0, 1)
                        let color = colorLerp(alpha, colorPrimary, colorAccent);
                        bubble.color = `rgb(${color})`;
                    }
                    for (let trend of bubble.trends) { // render color
                        trend.value = valueToDegree(trend.value);
                        trend.incr = valueToDegree(trend.incr);
                        let alpha = Math.tanh(trend.incr); // (-1, 1)
                        let a2 = alpha * alpha;
                        let color = alpha > 0 ? colorLerp(a2, colorGrey, colorGreen) : colorLerp(a2, colorGrey, colorDark);
                        let textColor = a2 > 0.6 ? 'white' : 'black';
                        Object.assign(trend, {color: `rgb(${color})`, textColor});
                    }
                    // star the first
                    Object.assign(bubble.trends[0], {star: true, color: 'orange', textColor: 'white'});
                    bubbles[curIdx] = bubble;
                    resolve();
                } catch (err) {
                    console.error(`Cannot fetch trends timeline data from backend with ${err}`);
                    reject(err);
                }
            }));
        }
        await Promise.all(jobs);
        return bubbles;
    }

    async function fetchArticlesByWords(words, mode, dateMin, dateMax, articlesLimit = 50) {
        try {
            var res = await Vue.axios.get(api.GET_TRENDS_ARTICLE_IDS
                .replace(':dateMin', dateMin.format('yyyy-mm-dd'))
                .replace(":dateMax", dateMax.format('yyyy-mm-dd')), {
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
            res = await Vue.axios.post(api.GET_ARTICLES_POST, {ids: ids.slice(0, articlesLimit)});
        } catch (e) {
            console.error('error fetching articles by ids:', e);
            return [];
        }
        return processArticles(res.data.articles);
    }

</script>

<style scoped>

</style>
