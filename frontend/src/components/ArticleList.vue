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
          <v-list-item-title class="d-inline-flex mr-2">
            <a
                    :href="item.link"
                    target="_blank"
            >
              {{item.title}}
            </a>
          </v-list-item-title>
          <v-list-item-subtitle v-html="item.content"></v-list-item-subtitle>
        </v-list-item-content>

      </v-list-item>
    </template>
  </v-list>
</template>

<script>
  export default {
    name: "ArticleList",
    props: ['items']
  }
</script>

<style scoped>

</style>