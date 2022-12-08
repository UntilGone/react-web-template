const prodConfig = require('./webpack.prod');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const { merge } = require('webpack-merge');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap(
  // 只对生产环境打包做分析
  merge(prodConfig, {
    plugins: [new BundleAnalyzerPlugin()],
  }),
);
