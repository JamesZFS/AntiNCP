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

            <v-radio-group v-if="advanced" v-model="mode" row class="mt-3 mx-2">
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

          <!--    Date Picker    -->
          <v-row v-if="advanced" class="mt-3">
            <v-dialog
                    ref="dialog1"
                    v-model="dialog.min"
                    :return-value.sync="date"
                    width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                        v-model="date.min"
                        label="起始日期"
                        prepend-icon="mdi-calendar"
                        readonly
                        solo-inverted
                        hide-details
                        class="mr-2"
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

            <v-dialog
                    ref="dialog2"
                    v-model="dialog.max"
                    :return-value.sync="date"
                    width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                        v-model="date.max"
                        label="截止日期"
                        prepend-icon="mdi-calendar"
                        readonly
                        solo-inverted
                        hide-details
                        class="mr-2"
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
          </v-row>
          <!--    Date picker end    -->
        </v-col>

      </v-toolbar>

      <v-skeleton-loader
              v-if="loading"
              class="mx-auto"
              type="list-item-three-line@6"
              loading
      ></v-skeleton-loader>

      <!--   Article list view   -->
      <ArticleList
              :items="articles"
              v-else
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
  import api from '@/api';
  import ArticleList from "@/components/ArticleList";
  import ChipTextInput from "@/components/ChipTextInput";
  import {processArticles} from '@/utils';

  const articlesLimit = 30;
  const defaultChips = ['coronavirus', 'COVID', 'Wuhan', 'China', 'quarantine', '...'];

  export default {
    name: "Reports",
    created() {
      this.refresh();
      let history = Vue.$cookies.get('searchHistory');
      this.candidateChips = history ? JSON.parse(history) : defaultChips;
    },
    methods: {
      async refresh() {
        this.loading = true;
        this.articles = processArticles(await this.fetchArticlesWithinTime());
        this.loading = false;
        // console.log('refreshed');
      },
      async onSearchBtn() {
        this.query = this.$refs.textInput.chips.join();
        console.log('on search:', this.query);
        this.loading = true;
        let res;
        if (this.query === '') {
          res = processArticles(await this.fetchArticlesWithinTime(this.date.min, this.date.max));
        } else { // fetch by words
          res = processArticles(await this.fetchArticlesByWords(this.query, this.mode, this.date.min, this.date.max));
        }
        if (res.length > 0) { // update search history
          this.articles = res;
          if (this.query.length !== '') {
            this.candidateChips.unshift(...this.query.split(','));
            this.candidateChips = this.candidateChips.slice(0, 6);
            Vue.$cookies.set('searchHistory', JSON.stringify(this.candidateChips));
          }
        }
        this.loading = false;
      },
      async fetchArticlesWithinTime(timeMin, timeMax) {
        // console.log(timeMin, timeMax);
        timeMin = timeMin ? new Date(timeMin) : new Date().addDay(-7);
        timeMax = timeMax ? new Date(timeMax) : new Date();
        try {
          var res = await Vue.axios.get(api.GET_ARTICLES_WITHIN_TIME
              .replace(':timeMin', timeMin.toISOString())
              .replace(':timeMax', timeMax.toISOString()), {
            params: {limit: articlesLimit}
          });
        } catch (e) {
          this.error = true;
          this.errorMessage = 'Unknown';
          console.error('error fetching articles by ids:', e);
          return [];
        }
        if (res.data.articles.length === 0) {
          this.error = true;
          this.errorMessage = '没有找到相关结果';
        }
        return res.data.articles;
      },
      async fetchArticlesByWords(words, mode, dateMin, dateMax) {
        // console.log(dateMin, dateMax);
        dateMin = dateMin ? new Date(dateMin) : new Date('2020/1/1');
        dateMax = dateMax ? new Date(dateMax) : new Date();
        try {
          var res = await Vue.axios.get(api.GET_TRENDS_ARTICLE_IDS
              .replace(':dateMin', dateMin.toISOString())
              .replace(":dateMax", dateMax.toISOString()), {
            params: {words, mode}
          });
        } catch (e) {
          this.error = true;
          this.errorMessage = '（请勿使用停用词查询，一次查询的查询词别输入太多哦~）';
          console.error('error fetching articles ids by words:', e);
          return [];
        }
        let ids = res.data.articleIds;
        if (ids.length === 0) {
          this.error = true;
          this.errorMessage = '没有找到相关结果';
          return [];
        }
        try {
          res = await Vue.axios.get(api.GET_ARTICLES, {params: {ids: ids.slice(0, articlesLimit).join(',')}});
        } catch (e) {
          this.error = true;
          this.errorMessage = 'Unknown';
          console.error('error fetching articles by ids:', e);
          return [];
        }
        this.success = true;
        this.successMessage = '已自动按相关顺序排序';
        return res.data.articles;
      }
    },
    data: () => ({
      loading: null,
      advanced: false,
      candidateChips: [],
      query: '',
      mode: 'and',
      success: false,
      successMessage: '',
      error: false,
      errorMessage: '',
      articles: [],
      dialog: {min: false, max: false},
      date: {min: null, max: null},
    }),
    components: {ArticleList, ChipTextInput}
  }

</script>

<style scoped>

</style>
