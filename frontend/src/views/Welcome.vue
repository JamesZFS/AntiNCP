<template>
  <div>

    <v-row justify="center">
      <v-menu transition="slide-x-transition">
        <template v-slot:activator="{ on }">
          <v-btn color="primary" class="ma-2" v-on="on">
            Slide X Transition
          </v-btn>
        </template>
        <v-list>
          <v-list-item
                  v-for="n in 5"
                  :key="n"
                  link
          >
            <v-list-item-title v-text="'Item ' + n"></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <div class="mx-6 hidden-sm-and-down"></div>

      <v-menu transition="scroll-y-transition">
        <template v-slot:activator="{ on }">
          <v-btn color="secondary" class="ma-2" v-on="on">
            Scroll Y Transition
          </v-btn>
        </template>
        <v-list>
          <v-list-item
                  v-for="n in 5"
                  :key="n"
                  link
          >
            <v-list-item-title v-text="'Item ' + n"></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-row>

    <v-card
            height="200"
            class="d-flex"
    >
      <v-card width="100" class="my-auto mx-md-auto mx-0" elevation="8">
        <v-card-text>
          Hello
        </v-card-text>
      </v-card>
    </v-card>

    <div>
      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Harum maiores modi quidem veniam, expedita quis
        laboriosam, ullam facere adipisci, iusto, voluptate sapiente corrupti asperiores rem nemo numquam fuga ab
        at.</p>
      <p class="text-center font-weight-bold">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Harum maiores
        modi quidem
        veniam, expedita quis laboriosam, ullam facere adipisci, iusto, voluptate sapiente corrupti asperiores rem nemo
        numquam fuga ab at.</p>
    </div>
    <blockquote class="blockquote display-1 font-italic">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Harum
      maiores modi quidem
      veniam, expedita quis laboriosam, ullam facere adipisci, iusto, voluptate sapiente corrupti asperiores rem nemo
      numquam fuga ab at.
    </blockquote>
    <div>
      Example of an inline <code>&lt;code&gt;</code> element.
    </div>
    <div>
      To install Vuetify, type <kbd>npm install vuetify</kbd> into your console. Once complete, type
      <kbd>cd<code>&lt;project name&gt;</code></kbd> and run <kbd>npm install</kbd>
    </div>
    <div>
      <div class="d-md-block pa-1 deep-purple success red--text text--accent-1">d-inline</div>
      <div class="d-md-block d-inline pa-1 black white--text">d-conditional</div>
    </div>

    <v-container fluid>
      <v-row>
        <v-col
                cols="12"
                md="4"
        >
          <v-slider
                  v-model="selected"
                  prepend-icon="mdi-pan-horizontal"
                  min="0"
                  max="24"
                  thumb-label
          ></v-slider>
        </v-col>
        <v-col
                cols="12"
                md="4"
                offset-md="3"
        >
          <v-card :elevation="selected" class="flex">
            <v-card-text>
              <p class="text-center ma-0">
                Elevation {{ selected }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-hover>
      <template v-slot="{ hover }">
        <v-card
                :elevation="hover ? 24 : 6"
                class="mx-auto pa-6"
        >
          Prop based elevation
        </v-card>
      </template>
    </v-hover>

    <v-card
            class="d-flex flex-row mb-6 flex-md-nowrap"
            color="grey lighten-2"
            flat
            tile
    >
      <v-card
              v-for="n in 20"
              :key="n"
              class="pa-2"
              outlined
              tile
      >
        Flex item {{ n }}
      </v-card>
    </v-card>
    <v-card
            class="d-flex flex-row-reverse justify-space-around align-center"
            color="grey lighten-2"
            flat
            tile
            height="100"
    >
      <v-card
              v-for="n in 3"
              :key="n"
              class="pa-2 align-self-auto"
              :class="n === 1 && 'ml-auto'"
              outlined
              tile
      >
        Flex item {{ n }}
      </v-card>
    </v-card>

  </div>
</template>

<script>
  export default {
    name: "Home",
    data() {
      return {
        selected: 0
      }
    }
  }
</script>

<style scoped>

</style>