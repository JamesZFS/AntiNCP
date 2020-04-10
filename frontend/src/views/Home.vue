<template>
  <v-container>
    <v-snackbar
            v-model="success"
            :timeout="3000"
            color="success"
    >
      连接成功
      <v-btn
              dark
              text
              @click="success = false"
      >
        Close
      </v-btn>
    </v-snackbar>
    <v-snackbar
            v-model="fail"
            :timeout="3000"
            color="error"
    >
      连接失败
      <v-btn
              dark
              text
              @click="fail = false"
      >
        Close
      </v-btn>
    </v-snackbar>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
                src="../assets/logo.png"
                class="my-3"
                contain
                height="300"
        />
      </v-col>

      <v-col class="mb-4">
        <h1 class="display-1 font-weight-bold mb-5">
          Hi, welcome to AntiNCP!
        </h1>

        <h1 class="display-1 font-weight-bold mb-5">
          <span class="font-weight-light">欢迎来到</span> <span class="font-weight-light green--text">抗疫者</span>
        </h1>

        <h3 class="mb-3" style="margin-top: 50px">
          I'm an intelligent information visualizer & analyzer on COVID-2019 pandemic.
        </h3>

        <h3 class="mb-3">
          一个<span class="purple--text">2019新冠疫情</span>数据的智能可视化与检索系统
        </h3>

      </v-col>
      <v-col
              class="mb-5"
              cols="12"
      >
        <h2 class="headline font-weight-bold mb-3">
          Click menu icon to continue
        </h2>

        <h2 class="headline font-weight-bold mb-5">
          点击左上角的菜单按钮以继续
        </h2>

        <v-btn class="success" @click="$emit('click-menu')">点我也行</v-btn>

      </v-col>

      <v-col
              class="mb-5"
              cols="12"
      >
        <h2 class="headline font-weight-bold mb-3">
          Related Web Links
        </h2>

        <h2 class="headline font-weight-bold mb-3">
          相关网站传送门
        </h2>

        <v-row justify="center">
          <a
                  v-for="(link, i) in relatives"
                  :key="i"
                  :href="link.href"
                  class="subheading mx-3"
                  target="_blank"
          >
            {{ link.text }}
          </a>
        </v-row>
      </v-col>

      <v-col
              class="mb-5"
              cols="12"
      >
        <h2 class="headline font-weight-bold mb-3">
          For Developers & Researchers
        </h2>

        <h2 class="headline font-weight-bold mb-3">
          开发者 & 科研人员福利
        </h2>

        <v-row justify="center">
          <a
                  v-for="(res, i) in resources"
                  :key="i"
                  :href="res.href"
                  class="subheading mx-3"
                  target="_blank"
          >
            {{ res.text }}
          </a>
        </v-row>

        <p style="margin-top: 200px">
          我网挂了吗？↓
        </p>
        <v-btn class="accent" @click="test">Test</v-btn>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'HelloWorld',
    data: () => ({
      resources: [
        {
          text: 'API documents',
          href: '/doc',
        },
        {
          text: 'Source code',
          href: '/code'
        }
      ],
      relatives: [
        {
          text: 'United Against COVID-19',
          href: 'http://united-against-covid.org/'
        },
        {
          text: 'I am COVID',
          href: 'https://iamcovid-19.netlify.com/'
        },
        {
          text: 'Coronaviurs Map by NY Times',
          href: 'https://www.nytimes.com/interactive/2020/world/coronavirus-maps.html#us'
        }
      ],
      success: null,
      fail: null,
    }),
    methods: {
      async test() {
        this.success = this.fail = null;
        try {
          let res = await this.axios.get('/api/test');
          // console.log(res);
          if (res.data === 'OK!') this.success = true;
          else this.fail = true;
        } catch (e) {
          // console.error(e);
          this.fail = true;
        }
      }
    }
  }
</script>
