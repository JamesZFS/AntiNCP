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

    <!--  Mobile view of Reports:  -->
    <v-dialog
        v-if="$vuetify.breakpoint.xs"
        v-model="displayReports"
        fullscreen
        transition="dialog-bottom-transition"
    >
      <v-card>
        <v-app-bar fixed dark>
          <v-toolbar-title>{{dialogTitle}} 相关报道</v-toolbar-title>
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

    <!--  PC view of Reports:  -->
    <v-dialog
        v-else
        v-model="displayReports"
        width="90%"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{dialogTitle}} 相关报道</span>
        </v-card-title>
        <v-divider/>
        <v-skeleton-loader v-if="loadingReports" type="list-item-three-line@6"/>
        <ArticleList
            v-else
            :items="relativeReports"
        />
      </v-card>
    </v-dialog>

    <!--  PC view of Curve:  -->
    <v-dialog
        v-model="displayCurve"
        width="90%"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{dialogTitle}} 热度趋势</span>
        </v-card-title>
        <v-divider/>
        <v-skeleton-loader v-if="loadingCurve" type="image@3"/>
        <MultiAxisChart v-show="!loadingCurve" ref="MyCurve"></MultiAxisChart>
      </v-card>
    </v-dialog>

    <WordCloud ref="MyWorldCloud" class="d-block" style="width: 96%;"></WordCloud>

    <!--  Fetch reports button:  -->
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
              @click="onReportsFabClick"
          >
            <v-icon>mdi-pencil-box-outline</v-icon>
          </v-btn>
        </v-scale-transition>
      </template>
      <span>相关报道</span>
    </v-tooltip>

    <!--  Display curve button:  -->
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
              color="yellow darken-2"
              style="margin-bottom: 160px"
              @click="onCurveFabClick"
          >
            <v-icon>mdi-chart-bell-curve</v-icon>
          </v-btn>
        </v-scale-transition>
      </template>
      <span>热度趋势</span>
    </v-tooltip>

  </v-container>
</template>

<script>
    import WordCloud from '../../components/WordCloud';
    import ArticleList from "../../components/ArticleList";
    import MultiAxisChart from "../../components/MultiAxisChart";
    import {hexToRgb} from "../../utils";
    import {fetchArticlesByWords, fetchTrendBubbles, fetchTrendsCurve} from "./helpers.js";

    export default {
        name: "Trends",
        components: {ArticleList, WordCloud, MultiAxisChart},
        data: () => ({
            loading: false,
            bubbles: [],
            selectedTrends: [],
            selectedDate: {min: null, max: null},
            displayReports: false,
            displayCurve: false,
            relativeReports: [],
            fab: false,
            loadingReports: false,
            loadingCurve: false,
            stillMoreBubbles: true,
        }),
        computed: {
            dialogTitle() {
                let words = this.selectedTrends.map(x => x.name);
                if (words.length === 0) {
                    return 'Unselected';
                } else if (words.length <= 3) {
                    return words.join(', ');
                } else {
                    return words.slice(0, 3).join(', ') + '...';
                }
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
                // return this.onReportsFabClick();
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
            async onReportsFabClick() {
                this.displayReports = true;
                await this.loadRelativeReports();
            },
            async onCurveFabClick() {
                this.displayCurve = true;
                this.loadingCurve = true;
                let words = this.selectedTrends.map(x => x.name);
                let queryWords = words.join(',');
                let today = new Date();
                let aMonthAgo = today.addDay(-30);
                let {labels, series} = await fetchTrendsCurve(queryWords, aMonthAgo, today);
                this.$refs.MyCurve.draw(labels, words, series);
                this.loadingCurve = false;
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
            window.colorPrimary = hexToRgb(this.$vuetify.theme.themes.light.primary);
            window.colorAccent = hexToRgb(this.$vuetify.theme.themes.light.accent);
            this.refresh();
        },
    }

</script>

<style scoped>

</style>
