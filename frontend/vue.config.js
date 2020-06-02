module.exports = {
  transpileDependencies: [
    "vuetify"
  ],
  publicPath: process.env.REPO === 'GH_PAGES'
      ? '/AntiNCP/'
      : '/',
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true
      },
    }
  }
};
