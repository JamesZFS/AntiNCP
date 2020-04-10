<template>
  <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
  >
    <template v-slot:activator="{ on }">
      <v-text-field
              :value="date"
              :label="prompt"
              prepend-icon="mdi-calendar"
              readonly
              solo-inverted
              hide-details
              v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker
            v-model="date"
            :color="color"
            no-title
            scrollable
            :allowed-dates="allowedDates"
            @input="$refs.menu.save(date)"
    >
    </v-date-picker>
  </v-menu>
</template>

<script>
  export default {
    props: ['date', 'color', 'prompt', 'allowedDates'],
    model: {prop: 'date', event: 'change'},
    data: () => ({
      menu: false
    }),
  }
</script>

<style scoped>
  .scale-transition-leave-active {
    transition: .6s;
  }
</style>