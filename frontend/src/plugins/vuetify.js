import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors'
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

const opts = {
  theme: {
    themes: {
      light: {
        secondary: colors.purple.darken2,
        accent: colors.lightBlue.lighten4,
      }
    },
  }
};

export default new Vuetify(opts);
