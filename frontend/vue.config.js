module.exports = {
  transpileDependencies: [
    "vuetify"
  ],
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost/',
        ws: true,
        changeOrigin: true
      },
    }
  }
};