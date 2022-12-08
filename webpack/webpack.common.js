/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { BASE_ENV } = process.env; // 实际意义的环境参数
const { NODE_ENV } = process.env; // webpack会根据这个变量赋值给mode 也就决定了打包方式
const isDev = NODE_ENV === 'development';
const SCOPE_NAME = '[path][name]__[local]';

module.exports = {
  entry: path.join(__dirname, '../src/index.tsx'), // 入口文件
  output: {
    filename: 'static/js/[name].[chunkhash:8].js',
    path: path.join(__dirname, '../dist'),
    clean: true, // webpack5 内置的clean webpack plugin
    publicPath: '/', // 公共前缀 这里会影响到后面asset loader的publicPath
  },
  // loader配置
  // loader的执行顺序是arr.pop() 也就是说rules是从下往上执行 use是从右至左
  module: {
    rules: [
      {
        include: /src/, // 只对src里的内容进行处理
        exclude: /node_modules/, // 不处理node_modules
        test: /\.(ts|tsx)$/, // 处理ts和tsx 其实这里ts和tsx是可以拆分开来处理  在ts文件的时候就不需要react的babel处理了
        use: [
          // 这里只给ts和tsx加 是因为不支持css插件MiniCssExtractPlugin
          'thread-loader', // 多线程loader 体量不大的话可以不开 因为启动该loader也需要资源
          {
            loader: 'babel-loader',
            // 这里可以通过babel.config.js把babel loader的配置文件提取出来
            options: {
              // 预设执行顺序由右往左,所以先处理ts,再处理jsx,在进行js的polyfill
              presets: [
                [
                  '@babel/preset-env', // 处理js
                  {
                    useBuiltIns: 'usage', // 根据配置的浏览器兼容
                    corejs: 3, // core-js版本
                  },
                ],
                [
                  '@babel/preset-react', // 处理react
                  {
                    runtime: 'automatic', // 自动编译React 不需要在文件里单独引入React
                  },
                ],
                '@babel/preset-typescript', // 处理ts
              ],
              plugins: [
                // [
                //   'module-resolver',
                //   {
                //     extensions: ['.js', '.jsx', '.ts', '.tsx', '.less', '.css'],
                //   },
                // ],
                // 热更新过程中 css修改会直接改变页面 因为style-loader对热更新进行了处理 直接替换了style标签 但是tsx/jsx的改变会引起页面刷新 需要插件处理
                // react热更新插件  在新增或者删除hook时 组件状态不会保留
                isDev ? require.resolve('react-refresh/babel') : null, // 开发模式下 启动react热更新插件
              ].filter(Boolean), // 过滤掉空值  处理isDev的内容
            },
          },
        ],
      },
      {
        include: /src/, // 只对src里的内容进行处理
        exclude: /node_modules/, // 不处理node_modules ps: 如果项目里用antd等UI库 要注意
        test: /\.(css)$/, // 处理css
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader, // 打包模式抽离css 抽离的目的是压缩
          'css-loader',
        ],
      },
      // 这里把css和less拆分的目的是 避免在css中使用less-loader
      {
        include: /src/, // 只对src里的内容进行处理
        exclude: /node_modules/, // 不处理node_modules ps: 如果项目里用antd等UI库 要注意
        test: /\.(less)$/, // 处理less
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: SCOPE_NAME,
              },
              importLoaders: 3,
              sourceMap: false,
            },
          },
          'less-loader',
        ],
      },
      {
        include: /src/, // 只对src里的内容进行处理
        // 处理图片文件 其他资源也可以这么处理
        test: /\.(png|jpg|jpeg|gif|svg)$/, // 图片文件
        type: 'asset', // 之前是用url-loader和file-loader处理 现在webpack内置了asset-module
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb的图片转成base64
          },
        },
        generator: {
          filename: 'static/images/[name].[contenthash:8][ext]', // 文件输出位置
        },
      },
      {
        include: /src/, // 只对src里的内容进行处理
        test: /\.(mp4|mp3)$/, // 媒体处理 需要可以补充其他类型
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb的图片转成base64
          },
        },
        generator: {
          filename: 'static/media/[name].[contenthash:8][ext]', // 文件输出位置
        },
      },
      {
        include: /src/, // 只对src里的内容进行处理
        test: /\.(ttf)$/, // 字体处理 需要可以补充其他类型
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb的图片转成base64
          },
        },
        generator: {
          filename: 'static/fonts/[name].[contenthash:8][ext]', // 文件输出位置
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.tsx', '.ts', '.less', 'css'],
    // 配置别名
    alias: {
      '@': path.join(__dirname, '../src'),
      // TODO: 添加components pages等其他别名
    },
    // 确定node_modules搜索范围 避免一级一级向上查的时候的消耗
    modules: [path.resolve(__dirname, '../node_modules')],
  },
  // TODO: 这个需要看一下
  cache: {
    type: 'filesystem', // 使用文件缓存
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.ejs'), // 模板取定义root节点的模板
      inject: true, // 自动注入静态资源
    }),
    // 编译过程中会把对应的key替换为后面的value
    // 注意 这里是直接替换 而不是声明了一个变量 也就是代码里ENV全都替换为BASE_ENV 实际上全局变量里并不存在ENV也不存在BASE_ENV
    new webpack.DefinePlugin({
      ENV: JSON.stringify(BASE_ENV),
    }),
  ],
};
