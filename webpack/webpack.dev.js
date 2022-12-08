/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CommonConfig = require('./webpack.common');

module.exports = merge(CommonConfig, {
  mode: 'development', // 开发模式,打包更加快速,省了代码优化步骤
  // source map规则
  devtool: 'eval-cheap-module-source-map', // eval 通过eval的方式执行代码 cheap 只定位行 不定位列 module 展示源码错误位置 source 生成source map
  devServer: {
    port: 3000,
    compress: false, // 代码压缩
    hot: true, // 热更新
    // historyApiFallback: true, // 解决history路由404的问题
    static: {
      directory: path.join(__dirname, '../public'), // 托管静态资源public文件夹
    },
  },
  plugins: [new ReactRefreshWebpackPlugin()],
});
