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

| 参数             | 值类型   | 描述                                            | 默认值           |
| ---------------- | -------- | ----------------------------------------------- | ---------------- |
| outputDir        | string   | 生成代码的存放路径                              | /src/client      |
| enumSign         | string   | 用什么标记改类型是枚举                          | enum             |
| enumIsUnify      | boolean  | 枚举是否统一存放                                | true             |
| isIgnoreRequired | boolean  | 是否忽略 required 标记                          | false            |
| baseUrl          | string   | Swagger 请求地址                                | localhost:3000   |
| list             | string[] | Swagger 请求地址。最终的 url 是 baseUrl+list[i] | []               |
| cache            | boolean  | 是否缓存，true 会生成 port.lock.json            | false            |
| version          | string   | Swagger 版本 V2/V3                              | V2               |
| prettierUrl      | string   | 生成文件格式化规则                              | /.prettierrc.yml |
| excludeModule    | string[] | 不要哪些模块生成（1.2.1）                       | 空               |
| GenerateClass    | class    | 自定义 Code 生成器                              | 脚本生成         |

## `GenerateClass` 配置项

具体配置项介绍如下：

#### apiTemplate

描述：生成单个 Api 文件的模板

| 参数          | 描述                |
| ------------- | ------------------- |
| api           | 接口信息            |
| usedModel？   | 接口依赖模型        |
| usedEnum？    | 接口依赖枚举        |
| moduleName？  | 当前 Api 所在模块名 |
| swaggerjson？ | Swagger 全部信息    |

#### apiIndexFile

描述：生成模块 Api 主入口

| 参数         | 描述         |
| ------------ | ------------ |
| apis         | 所有接口信息 |
| moduleName？ | 模块名       |
| usedModel？  | 依赖模型     |
| usedEnum？   | 依赖枚举     |

#### getRequest

描述：生成单个 Api 文件的模板中的 Request

| 参数    | 描述                  |
| ------- | --------------------- |
| request | 当前接口 Request 信息 |

#### transformData

描述：生成单个 Api 文件的模板中的 Params

| 参数 | 描述     |
| ---- | -------- |
| api  | 接口信息 |

#### aliasModelName

描述：type 和 menu 的重命名

| 参数 | 描述                    |
| ---- | ----------------------- |
| name | type 或 menu 的原始名称 |

#### getTagName

描述：自定义获取分组形式（1.2.0 以上）

| 参数 | 描述             |
| ---- | ---------------- |
| url  | 接口 path 的 url |

#### nameRule

描述：自定义 api 生成的名称（1.2.0 以上），默认 url.split('/')最后两个拼接

| 参数 | 描述             |
| ---- | ---------------- |
| url  | 接口 path 的 url |
