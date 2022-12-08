const path = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin'); // webpack5之后内置了 如果用pnpm的话 可能需要重新装一下
const CompressionPlugin = require('compression-webpack-plugin'); // gzip

const BASE_ENV = process.env.BASE_ENV; // 实际意义的环境参数
const NODE_ENV = process.env.NODE_ENV; // webpack会根据这个变量赋值给mode 也就决定了打包方式

module.exports = merge(commonConfig, {
  mode: 'production', // 生产模式,会开启tree-shaking和压缩代码,以及其他优化
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(), // css压缩
      // 本来webpack内置了压缩过程 但是因为上面配置了css压缩 需要重新补充一下
      new TerserPlugin({
        parallel: true, // 开启多线
        terserOptions: {
          compress: {
            pure_funcs: ['console.log'], // 删除log
          },
        },
      }),
    ],
    // 代码分割
    splitChunks: {
      cacheGroups: {
        vendors: {
          // 提取node_modules代码
          test: /node_modules/, // 匹配node_modules里的模块
          name: 'vendors',
          minChunks: 1, //  使用次数 只用1次就提取出来
          chunks: 'initial', // 只提取初始化就能获取到的模块 不管异步的
          minSize: 0, // 提取代码体积大于这个数的就提取出来
          priority: 1, // 提取优先级
        },
        common: {
          // 提取公共代码
          name: 'commons',
          minChunks: 2, // 同上
          chunks: 'initial',
          minSize: 0,
        },
      },
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public'), // 从public里面复制
          to: path.resolve(__dirname, '../dist'), // 复制到dist目录中
          filter: (source) => !source.includes('index.ejs'), // 忽略index.ejs
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css', // 抽离css后输出的目录和名称
    }),
    new CompressionPlugin({
      test: /\.(js|css)$/, // 只处理js和css文件
      filename: '[path][base].gz',
      algorithm: 'gzip',
      threshold: 10240, // 大于10k的资源才压缩
      minRatio: 0.8, // 压缩率
    }),
  ],
});
