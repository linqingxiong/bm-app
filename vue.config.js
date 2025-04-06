module.exports = {
  publicPath: './',
  outputDir: 'D:\\IDEA_Location\\bitManager\\src\\main\\resources\\static', // 构建到项目根目录/build 文件夹
  configureWebpack: {
    entry: {
      app: './src/main.js' // 明确指定 Webpack 入口
    },
    output: {
      globalObject: 'window' // 确保异步加载的代码块使用 window 作为全局对象
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    },
    port: 8070
  }
}
