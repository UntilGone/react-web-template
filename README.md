# 项目模板

## TODO

利用懒加载处理不同页面文件

## 备注

.browserlistrc 文件用于声明支持的浏览器版本，在 autoprefixer 进行 css 支持的时候会用到。

### 关于 output 的 hash 模式

对于 js 文件，选择用 chunk hash，对于资源文件如 css、img 等选择用 content hash。因为对于 js 文件，会根据公共库、业务代码之类的进行分包处理，那么对于部分公共库的 chunk 是不会变的。而资源文件的内容更适合。

pnpm add @pmmmwh/react-refresh-webpack-plugin 时需要另外装的依赖：
error-stack-parser
html-entities
ansi-html-community
stackframe
scheduler
events
core-js-pure

## 运行环境

这里是指搭建时可以正常运行的环境，并不是最低支持
pnpm 7.9.0
npm 8.17.0
node 16.16.0
