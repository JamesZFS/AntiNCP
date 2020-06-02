<template>
  <v-list three-line>
    <template v-for="(item, index) in items">
      <v-subheader
          v-if="item.header"
          :key="index"
          v-text="item.header"
          :class="item.bold && 'font-weight-bold'"
      ></v-subheader>

      <v-divider
          v-else-if="item.divider"
          :key="index"
          :inset="item.inset"
      ></v-divider>

      <v-list-item
          v-else
          :key="index"
      >
        <v-list-item-avatar>
          <!--suppress HtmlUnknownTarget -->
          <v-img :src="item.img" :alt="item.sourceShort"></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-action-text style="font-size: medium">
            <a
                :href="item.link"
                target="_blank"
            >
              {{item.title}}
            </a>
            <v-chip
                x-small
                class="ml-1 lighten-3"
                @click="$emit('click-topic', item.topic)"
                :color="topicColors[item.topic]"
            >
              {{ topicNames[item.topic] }}
            </v-chip>
          </v-list-item-action-text>
          <div>
            <v-list-item-action-text
                v-if="viewMore[index]"
                style="font-size: medium"
                v-html="item.content"
            />
            <v-list-item-subtitle
                v-else
                style="font-size: medium"
                @click="onClickItemContent(index)"
                v-html="item.content"
            />
          </div>
        </v-list-item-content>

      </v-list-item>
    </template>
  </v-list>
</template>

<script>
    import api from '../api';

    export default {
        name: "ArticleList",
        props: {items: Array},
        data: () => ({
            viewMore: [],
            topicNames: [], // map id -> str
            topicColors: ['red', 'blue', 'yellow', 'grey', 'green']
        }),
        async created() {
            this.topicNames = (await this.axios.get(api.GET_TOPIC_NAMES)).data['topic_names'];
        },
        methods: {
            onClickItemContent(index) {
                this.viewMore[index] = true;
                this.$forceUpdate();
            }
        }
    }
</script>

<style scoped>

</style>