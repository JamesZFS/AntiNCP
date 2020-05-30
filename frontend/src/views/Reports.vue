<template>
  <v-container class="fill-height align-start">
    <v-card
        width="100vw"
        class="mx-auto"
        :loading="loading"
    >
      <v-toolbar
          class="secondary"
          height="auto"
          dark
      >
        <v-col>
          <v-row>
            <v-tooltip bottom :open-delay="300">
              <template v-slot:activator="{on}">
                <v-app-bar-nav-icon
                    v-on="on"
                    class="ml-n3"
                    @click="advanced ^= 1"
                />
              </template>
              <span>高级搜索</span>
            </v-tooltip>

            <!--   Search field:   -->
            <ChipTextInput
                ref="textInput"
                prompt="查询关键词...（键入或选择）"
                class="mr-2"
                style="max-width: 80%"
                :items="candidateChips"
            />

            <v-radio-group v-show="advanced" v-model="mode" row class="mt-3 mx-2">
              <v-radio
                  label="AND"
                  value="and"
              />
              <v-radio
                  label="OR"
                  value="or"
              />
            </v-radio-group>

            <v-tooltip bottom :open-delay="600">
              <template v-slot:activator="{on}">
                <v-btn icon v-on="on" @click="onSearchBtn">
                  <v-icon>mdi-magnify</v-icon>
                </v-btn>
              </template>
              <span>Search</span>
            </v-tooltip>

            <v-spacer></v-spacer>

            <v-tooltip bottom :open-delay="600">
              <template v-slot:activator="{on}">
                <v-btn icon v-on="on" @click="refresh">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </template>
              <span>Refresh</span>
            </v-tooltip>
          </v-row>

          <v-row v-show="advanced" class="my-n2">
            <!--    Topic picker    -->
            <v-col cols="4">
              <ChipTextInput
                  ref="topicInput"
                  prompt="主题..."
                  :items="topicNames"
              />
            </v-col>
            <!--    Date Picker    -->
            <v-col cols="4">
              <v-dialog
                  ref="dialog1"
                  v-model="dialog.min"
                  width="290px"
                  :return-value.sync="date"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                      v-model="date.min"
                      label="起始日期"
                      readonly
                      solo-inverted
                      hide-details
                      v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                    v-model="date.min"
                    color="success"
                    scrollable
                    no-title
                    show-current
                    :allowed-dates="x => new Date(x) <= new Date(date.max || Date())"
                    @input="$refs.dialog1.save(date)"
                >
                </v-date-picker>
              </v-dialog>
            </v-col>

            <v-col cols="4">
              <v-dialog
                  ref="dialog2"
                  v-model="dialog.max"
                  width="290px"
                  :return-value.sync="date"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                      v-model="date.max"
                      label="截止日期"
                      readonly
                      solo-inverted
                      hide-details
                      v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                    v-model="date.max"
                    color="primary"
                    scrollable
                    no-title
                    show-current
                    :allowed-dates="x => new Date(x) >= new Date(date.min || Date())"
                    @input="$refs.dialog2.save(date)"
                >
                </v-date-picker>
              </v-dialog>
            </v-col>
          </v-row>
          <!--    Date picker end    -->
        </v-col>

      </v-toolbar>

      <v-pagination
          v-model="curPage"
          :total-visible="10"
          :length="pageCount"
          @input="setPage"
          circle
          class="mb-n5 mt-5"
      />

      <v-skeleton-loader
          v-if="loading"
          class="mx-auto my-10"
          type="list-item-three-line@8"
          loading
      ></v-skeleton-loader>

      <!--   Article list view   -->
      <ArticleList
          :items="articles"
          @click-topic="onClickTopic"
          v-else
      />

      <v-pagination
          v-if="curPageCount >= 6"
          v-model="curPage"
          :total-visible="10"
          :length="pageCount"
          @input="setPage"
          circle
          class="mb-8"
      />

    </v-card>

    <v-snackbar
        v-model="success"
        :timeout="3000"
        color="success"
    >
      Miao~ {{successMessage}}
      <v-btn
          dark
          text
          @click="success = false"
      >
        Close
      </v-btn>
    </v-snackbar>

    <v-snackbar
        v-model="error"
        color="error"
    >
      出错了 QAQ {{errorMessage}}
      <v-btn
          dark
          text
          @click="error = false"
      >
        Close
      </v-btn>
    </v-snackbar>

  </v-container>
</template>

<script>
    import Vue from 'vue';
    import api from '../api';
    import ArticleList from "../components/ArticleList";
    import ChipTextInput from "../components/ChipTextInput";
    import {processArticles} from '../utils';

    const defaultChips = ['coronavirus', 'COVID', 'Wuhan', 'China', 'quarantine', '...'];
    const notFoundMsg = '没有找到相关结果';
    const unknownMsg = '未知错误';
    const longAgo = '2020/1/1';
    const tipMsg = '（请勿使用停用词查询，一次查询的查询词别输入太多哦~）';

    export default {
        name: "Reports",
        async mounted() {
            this.topicNames = (await this.axios.get(api.GET_TOPIC_NAMES)).data['topic_names'];
            let history = Vue.$cookies.get('searchHistory');
            this.candidateChips = history ? JSON.parse(history) : defaultChips;
            let query = this.$route.query;
            // console.log(query);
            if (query.hasOwnProperty('words') || query.hasOwnProperty('topics') ||
                query.hasOwnProperty('dateMin') || query.hasOwnProperty('dateMax')) {
                // parse query from route and do search
                this.queryWords = query.words || '';
                this.queryTopics = query.topics || '';
                if (this.queryWords) this.$refs.textInput.chips.push(...this.queryWords.split(','));
                if (this.queryTopics) this.$refs.topicInput.chips.push(...this.queryTopics.split(',').map(i => this.topicNames[i]));
                this.date.min = query.dateMin;
                this.date.max = query.dateMax;
                this.mode = query.mode || 'and';
                if (query.dateMin || query.dateMax || query.mode || query.topics) this.advanced = true;
                this.doSearch();
            } else {
                // show default layout
                this.refresh();
            }
        },
        methods: {
            // on clicking refresh btn or created()
            async refresh() {
                this.loading = true;
                this.articleIds = await this.fetchArticleIdsWithinTime();
                this.setPage(1);
                this.loading = false;
                // console.log('refreshed');
            },
            onSearchBtn() {
                this.queryWords = this.$refs.textInput.chips.join();
                this.queryTopics = this.$refs.topicInput.chips.map(x => this.topicNames.indexOf(x)).join();
                let query = {words: this.queryWords, topics: this.queryTopics};
                if (this.date.min) query.dateMin = this.date.min;
                if (this.date.max) query.dateMax = this.date.max;
                query.mode = this.mode;
                this.$router.push({query});  // dump search query to route
                this.doSearch();
            },
            async doSearch() {
                console.log('do search:', this.queryWords);
                this.loading = true;
                if (this.queryWords === '') { // search only via date
                    this.articleIds = await this.fetchArticleIdsWithinTime(this.date.min, this.date.max, this.queryTopics);
                } else { // fetch by words
                    this.articleIds = await this.fetchArticleIdsByWords(this.queryWords, this.mode, this.date.min, this.date.max, this.queryTopics);
                }
                this.setPage(1);
                this.loading = false;
                if (this.articleIds.length > 0 && this.queryWords !== '') { // update search history, if success
                    this.candidateChips.unshift(...this.queryWords.split(','));
                    this.candidateChips = this.candidateChips.slice(0, 6);
                    Vue.$cookies.set('searchHistory', JSON.stringify(this.candidateChips));
                }
            },
            // Will change `this.articles`
            async setPage(input) {
                this.curPage = input;
                // load article details when page changes
                let ids = this.articleIds.slice((this.curPage - 1) * this.articlesPerPage, this.curPage * this.articlesPerPage);
                // console.log('set page:', (this.curPage - 1) * this.articlesPerPage, this.curPage * this.articlesPerPage);
                this.loading = true;
                try {
                    this.articles = await this.fetchArticlesViaIds(ids);
                    this.curPageCount = this.articles.length;
                    this.articles = processArticles(this.articles);
                } catch (e) {
                    this.error = true;
                    this.errorMessage = unknownMsg;
                    console.error('cannot fetch articles via ids:', e)
                }
                this.loading = false;
            },
            /**
             * @param ids{int[]}
             * @return {Promise<Object[]>} article array
             */
            async fetchArticlesViaIds(ids) {
                try {
                    var res = await this.axios.post(api.GET_ARTICLES_POST, {ids});
                } catch (e) {
                    this.error = true;
                    this.errorMessage = unknownMsg;
                    console.error('error fetching articles via ids:', e);
                    return [];
                }
                if (res.data.count === 0) {
                    this.error = true;
                    this.errorMessage = notFoundMsg;
                }
                return res.data.articles;
            },
            /**
             * @return {Promise<int[]>}  array of article ids
             */
            async fetchArticleIdsWithinTime(dateMin, dateMax, topics) {
                // console.log(dateMin, dateMax);
                dateMin = dateMin ? new Date(dateMin) : new Date(longAgo);
                dateMax = dateMax ? new Date(dateMax) : new Date();
                try {
                    var res = await Vue.axios.get(api.GET_ARTICLES_WITHIN_TIME
                        .replace(':dateMin', dateMin.format('yyyy-mm-dd'))
                        .replace(':dateMax', dateMax.format('yyyy-mm-dd')), {
                        params: {topics}
                    });
                } catch (e) {
                    this.error = true;
                    this.errorMessage = unknownMsg;
                    console.error('error fetching article ids within time:', e);
                    return [];
                }
                if (res.data.count === 0) {
                    this.error = true;
                    this.errorMessage = notFoundMsg;
                }
                return res.data.articleIds;
            },
            /**
             * @param words{string}
             * @param mode{string}
             * @param dateMin{Date}
             * @param dateMax{Date}
             * @param topics{string}
             * @return {Promise<int[]>}  array of article ids
             */
            async fetchArticleIdsByWords(words, mode, dateMin, dateMax, topics) {
                // console.log(dateMin, dateMax);
                dateMin = dateMin ? new Date(dateMin) : new Date(longAgo);
                dateMax = dateMax ? new Date(dateMax) : new Date();
                try {
                    var res = await Vue.axios.get(api.GET_TRENDS_ARTICLE_IDS
                        .replace(':dateMin', dateMin.toISOString())
                        .replace(":dateMax", dateMax.toISOString()), {
                        params: {words, mode, topics}
                    });
                } catch (e) {
                    this.error = true;
                    this.errorMessage = tipMsg;
                    console.error('error fetching articles ids by words:', e);
                    return [];
                }
                if (res.data.count === 0) {
                    this.error = true;
                    this.errorMessage = notFoundMsg;
                } else {
                    this.success = true;
                    this.successMessage = `共找到 ${res.data.count} 条结果，已按相关顺序排序`;
                }
                return res.data.articleIds;
            },
            onClickTopic(topic) {
                this.advanced = true;
                topic = this.topicNames[topic];
                if (this.$refs.topicInput.chips.indexOf(topic) >= 0) return;
                this.$refs.topicInput.chips.push(topic);
            }
        },
        data: () => ({
            loading: null,
            articleIds: [],  // cached article ids after search / refresh
            articles: [],  // articles of current page
            curPage: 0,
            curPageCount: 0,
            articlesPerPage: 30,
            advanced: false,
            candidateChips: [],
            mode: 'and',
            success: false,
            successMessage: '',
            error: false,
            errorMessage: '',
            dialog: {min: false, max: false},
            queryWords: '',
            queryTopics: '',
            date: {min: null, max: null},
            topicNames: [], // map id -> str
        }),
        computed: {
            pageCount() {
                return Math.ceil(this.articleIds.length / this.articlesPerPage);
            }
        },
        components: {ArticleList, ChipTextInput}
    }

</script>

<style scoped>

</style>
