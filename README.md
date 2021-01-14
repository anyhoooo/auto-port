# auto-port [![NPM Version][npm-image]][npm-url]

[size-image]: https://badgen.net/bundlephobia/min/auto-port
[size-url]: https://bundlephobia.com/result?p=auto-port
[npm-image]: https://badgen.net/npm/v/auto-port
[npm-url]: https://npmjs.org/package/auto-port
[downloads-image]: https://badgen.net/npm/dt/auto-port

## 描述

基于 Swagger 生成的 json 文件生成 TS 语言的 Api 脚本

## 依赖

-   `Axios`
-   `md5`
-   `prettier`

## Install

```js
npm install auto-port

or

yarn add auto-port
```

## Usage

```js
//执行
npx port
//会在项目根目录生成auto-port-config.js
//可以自由配置一些生成相关内容
```

![](https://cdn.nlark.com/yuque/0/2021/png/105422/1610433456229-32ee6ed0-fbd6-4561-a328-4651cdec89f0.png)

## `auto-port-config.js` 配置项

具体配置项介绍如下：

#### outputDir

值类型：string

描述：生成代码的存放路径，必填

#### enumSign

值类型：string

描述：用什么标记改类型是枚举，必填

#### baseUrl

值类型：string

描述：Swagger 请求地址，必填。最终的 url 是 baseUrl+list[i]

#### list

值类型：string[]

描述：Swagger 请求地址，必填。最终的 url 是 baseUrl+list[i]

#### cache

值类型：boolean

描述：是否缓存，true 会生成 port.lock.json。默认是 false

#### version

值类型：string

描述：现在后端给的是 V2，BFF 给的是 V3，必填

#### prettierUrl

值类型：string

描述：生成文件格式化规则，默认规则看源码

#### GenerateClass

值类型：class

描述：自定义 Code 生成器

## `GenerateClass` 配置项

具体配置项介绍如下：

#### apiTemplate

描述：生成单个 Api 文件的模板，源码已经复制到 auto-port-config.js 中

#### getRequest

描述：生成单个 Api 文件的模板中的 Request

#### transformData

描述：生成单个 Api 文件的模板中的 Params
