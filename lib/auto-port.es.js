function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var GenerateFunction = /*#__PURE__*/function () {
  function GenerateFunction() {
    _classCallCheck(this, GenerateFunction);
  }

  _createClass(GenerateFunction, [{
    key: "apiTemplate",
    value: function apiTemplate(api, usedModel, usedEnum, moduleName, swaggerjson) {
      return "\n\t\timport net from '@/request'\n\t\timport { NetConfig } from '@/client/IAxiosConfig'\n\t\t".concat(usedModel.map(function (i) {
        return "import { ".concat(i, " } from '../Type/").concat(i, "'");
      }).join('\r\n'), "\n\t\t").concat(usedEnum.map(function (i) {
        return "import { ".concat(i, " } from '../../Enum/").concat(i, "'");
      }).join('\r\n'), "\n\n\t\t/**\n\t\t *\t").concat(api.summary, "\n\t\t* @param {any} [req] \u643A\u5E26\u8BF7\u6C42\u5934\n\t\t* @param {NetConfig} [config] \u8BF7\u6C42\u914D\u7F6E\n\t\t*/\n\t\texport function ").concat(api.name, "(").concat(this.getRequest(api.request), ") {\n\t\t\treturn net<").concat(api.responses, ">(\n\t\t\t\t{\n\t\t\t\t\turl: '/v2/").concat(moduleName.toLocaleLowerCase()).concat(api.url, "',\n\t\t\t\t\tmethod: '").concat(api.method, "',\n\t\t\t\t\t").concat(this.transformData(api), "\n\t\t\t\t\theaders: req.headers,\n\t\t\t\t},\n\t\t\t\tconfig,\n\t\t\t)\n\t\t}\n\t");
    }
  }, {
    key: "apiIndexFile",
    value: function apiIndexFile(apis, moduleName, usedModel, usedEnum) {
      return "\n\t\t/**\n\t\t* @description Tag \u63A5\u53E3\u6C47\u603B\n\t\t*/\n\t\t".concat(apis.map(function (i) {
        return "import { ".concat(i, " } from './").concat(i, "'");
      }).join('\r\n'), "\n\n\t\texport default { ").concat(apis.join(' , '), " }\n\t\t");
    }
  }, {
    key: "getRequest",
    value: function getRequest(request) {
      if (request.length) {
        return 'req: any,' + request.map(function (req) {
          return "".concat(req.name, ": ").concat(req.type);
        }).join(',') + ',config?:NetConfig';
      } else {
        return 'req: any,config?:NetConfig';
      }
    }
  }, {
    key: "transformData",
    value: function transformData(api) {
      if (api.request.length === 0) {
        return '';
      } //get一般都是params


      if (api.method === 'get') {
        return "params: {\n\t\t\t\t".concat(api.request.map(function (req) {
          return req.name;
        }).join(','), "\n\t\t\t },");
      }

      var req = '';
      var query = api.request.filter(function (i) {
        return i["in"] === 'query';
      });

      if (query.length) {
        req += "params: {\n\t\t\t\t".concat(query.map(function (req) {
          return req.name;
        }).join(','), "\n\t\t\t },");
      }

      var body = api.request.filter(function (i) {
        return i["in"] === 'body';
      });

      if (body.length) {
        req += 'data: body,';
      }

      var formData = api.request.filter(function (i) {
        return i["in"] === 'formData';
      });

      if (formData.length) {
        req += '_file: file,';
      }

      return req;
    }
  }, {
    key: "aliasModelName",
    value: function aliasModelName(name) {
      return name;
    }
  }]);

  return GenerateFunction;
}();

function getBaseConfig() {
  return {
    outputDir: '/src/client',
    enumSign: 'enum',
    //用什么标记改类型是枚举
    enumIsUnify: true,
    //枚举是否统一存放
    baseUrl: 'localhost:3000',
    list: ['/v2/clue/swagger/v1/swagger.json'],
    cache: false,
    //是否缓存，true会生成port.lock.json
    version: 'V2',
    //现在后端给的是V2，BFF给的是V3
    GenerateClass: GenerateFunction
  };
}

var fs = require('fs');

var path = require('path');

var chalk = require('chalk');

var baseConfig = getBaseConfig();
var apiUserConfig = {};

if (!fs.existsSync(path.resolve(process.cwd() + '/auto-port-config.js'))) {
  fs.copyFileSync(path.resolve(__dirname, '../src/copyConfig.js'), path.resolve(process.cwd() + '/auto-port-config.js'));
  console.log(chalk.greenBright('生成auto-port-config.js文件，请修改baseUrl后再执行一次！！'));
} else {
  var _require = require(path.resolve(process.cwd() + '/auto-port-config.js')),
      getUserConfig = _require.getUserConfig;

  apiUserConfig = getUserConfig();
}

function getConfig() {
  return Object.assign(baseConfig, apiUserConfig);
}

var fs$1 = require('fs');

var path$1 = require('path');

var md5 = require('md5');

var chalk$1 = require('chalk');
var apiConfig = getConfig();
/** C#的类型转为 TS的类型 */

function transCSharpTypeToTyscriptType(origintype, format) {
  var typeEnmu = {
    integer: 'number',
    string: 'string',
    "boolean": 'boolean',
    number: 'number',
    array: '[]',
    object: 'object',
    int64: 'string',
    int32: 'number',
    date: 'string',
    'date-time': 'string',
    't': 'T'
  };

  if (format) {
    return typeEnmu[format.toLocaleLowerCase()];
  } else {
    return typeEnmu[origintype.toLocaleLowerCase()];
  }
}
/** 获取引用类型名称 */

function getModeleType(str) {
  // return str.replace('#/definitions/', '')
  return str.match(/(\w+)$/g)[0];
}
/** 写入文件 */

function writeFile(name, data, dirname) {
  if (!fs$1.existsSync(path$1.resolve(process.cwd() + dirname))) {
    fs$1.mkdirSync(path$1.resolve(process.cwd() + dirname));
  }

  var filePath = path$1.resolve(process.cwd() + dirname, name + '.ts');
  fs$1.writeFileSync(filePath, data);
  prettierFiles(filePath);
}

var prettier = require('prettier');

var prettierConfigPath = require.resolve(apiConfig.prettierUrl ? path$1.resolve(process.cwd() + apiConfig.prettierUrl) : '../.prettierrc.yml');
/** 格式化文件 */


var prettierFiles = function prettierFiles(file) {
  var options = prettier.resolveConfig.sync(file, {
    config: prettierConfigPath
  });
  var fileInfo = prettier.getFileInfo.sync(file);

  if (fileInfo.ignored) {
    return;
  }

  try {
    var input = fs$1.readFileSync(file, 'utf8');

    var withParserOptions = _objectSpread2(_objectSpread2({}, options), {}, {
      parser: fileInfo.inferredParser
    });

    var output = prettier.format(input, withParserOptions);

    if (output !== input) {
      fs$1.writeFileSync(file, output, 'utf8');
    }
  } catch (e) {
    console.log('格式化出错了');
  }
};
/** 校正文件(删除无用的文件) */


function correctionFile(dirname, list, module, type) {
  var dataFiles = list.map(function (i) {
    return i + '.ts';
  }).sort(function (a, b) {
    return a.localeCompare(b);
  });
  var currentFiles = fs$1.readdirSync(path$1.resolve(process.cwd() + dirname)).sort(function (a, b) {
    return a.localeCompare(b);
  });

  if (dataFiles.join() !== currentFiles.join()) {
    if (dataFiles.length > currentFiles.length) {
      console.log('看看是不是哪里出错了~~~~~~');
    } else {
      currentFiles.forEach(function (fileName) {
        if (!dataFiles.includes(fileName)) {
          fs$1.unlinkSync(path$1.resolve(process.cwd() + dirname + '/' + fileName));
          removeCache(type, module + '/' + fileName.split('.')[0]);
          console.log(chalk$1.redBright('删除了' + dirname + '/' + fileName));
        }
      });
    }
  }
}
/** 检查是否存在文件夹 */

function checkOutputDirExit(outputDir) {
  var dirList = outputDir.split('/').filter(function (i) {
    return i;
  });

  if (!fs$1.existsSync(path$1.resolve(process.cwd() + outputDir))) {
    if (outputDir === '/port.lock.json') {
      fs$1.writeFileSync(path$1.resolve(process.cwd() + outputDir), '{"enum":{},"type":{},"api":{},"tag":{}}');
    } else {
      var url = '';
      dirList.forEach(function (dir) {
        url += '/' + dir;

        if (!fs$1.existsSync(path$1.resolve(process.cwd() + url))) {
          fs$1.mkdirSync(path$1.resolve(process.cwd() + url));
        }
      });
    }
  }
}
/** 获取Tag名称 */

function getTagName(str) {
  if (str.length === 0) {
    throw new Error('无所属模块');
  } else {
    return str[0];
  }
}

function removeCache(type, key) {
  if (apiConfig.cache) {
    var cacheData = require(path$1.resolve(process.cwd() + '/port.lock.json'));

    delete cacheData[type][key];
    fs$1.writeFileSync(path$1.resolve(process.cwd() + '/port.lock.json'), JSON.stringify(cacheData, null, 2));
  }
}
/** 判断是否需要更新 */


function checkIsNeedUpdate(type, key, value) {
  if (apiConfig.cache) {
    var cacheData = require(path$1.resolve(process.cwd() + '/port.lock.json')); //如果缓存有，进去比较hash


    if (cacheData[type][key]) {
      if (cacheData[type][key] !== md5(JSON.stringify(value))) {
        cacheData[type][key] = md5(JSON.stringify(value));
        fs$1.writeFileSync(path$1.resolve(process.cwd() + '/port.lock.json'), JSON.stringify(cacheData, null, 2));
        return true;
      } else {
        return false;
      }
    } else {
      //如果没有，创建hash
      cacheData[type][key] = md5(JSON.stringify(value));
      fs$1.writeFileSync(path$1.resolve(process.cwd() + '/port.lock.json'), JSON.stringify(cacheData, null, 2));
      return true;
    }
  } else {
    return true;
  }
}
/** 获取依赖的enum和model */

function findDefinitions(target, usedEnum, usedModel, enumMap, modelMap) {
  var isDeep = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
  target.forEach(function (i) {
    if (i.definitions.length) {
      i.definitions.forEach(function (j) {
        if (enumMap[j] && !usedEnum.includes(j)) {
          usedEnum.push(j);
        } else if (modelMap[j] && !usedModel.includes(j)) {
          usedModel.push(j);

          if (isDeep) {
            findDefinitions([modelMap[j]], usedEnum, usedModel, enumMap, modelMap);
          }
        }
      });
    }
  });
}
module.exports = {
  transCSharpTypeToTyscriptType: transCSharpTypeToTyscriptType,
  getModeleType: getModeleType,
  writeFile: writeFile,
  checkOutputDirExit: checkOutputDirExit,
  getTagName: getTagName,
  checkIsNeedUpdate: checkIsNeedUpdate,
  correctionFile: correctionFile,
  findDefinitions: findDefinitions
};

var apiConfig$1 = getConfig();
/** 处理Swagger中的Definitions字段。包含DTO和enum */

function definitions(definitions) {
  var types = Object.keys(definitions);
  var modelMap = {};
  var enumMap = {};
  types.map(function (name) {
    var target = definitions[name];

    if (target[apiConfig$1.enumSign]) {
      enumMap[name] = parseEnum(target, name);
    } else {
      modelMap[name] = parseModel(target, name);
    }
  });
  return {
    modelMap: modelMap,
    enumMap: enumMap
  };
}
/** 处理Menu，返回枚举通用模型 */

function parseEnum(target, name) {
  return {
    name: name,
    description: target.description,
    "enum": target["enum"],
    enumname: target.fields
  };
}
/** 处理后端模型，返回通用模型 */


function parseModel(target, name) {
  var definitions = [];
  return {
    name: name,
    description: target.description || '注释缺失',
    property: parseProperties(target, definitions),
    definitions: definitions // type: target.allOf ? 'object' : target.type,
    // extends: target.allOf ? getExtendsType(target) : null,

  };
}
/** 处理对象参数 */


function parseProperties(target, definitions) {
  if (!target.properties) {
    return [];
  }

  var propetys = []; //必填字段

  var requiredArr = target.required || [];
  Object.keys(target.properties).map(function (pro) {
    var targetPro = target.properties[pro]; // const issimple = targetPro.allOf ? false : ifSimpleType(targetPro)

    propetys.push({
      name: pro,
      type: getTyscriptType(targetPro, definitions),
      description: targetPro.description || '注释缺失',
      required: requiredArr.includes(pro) ? true : false
    });
  });
  return propetys;
}
/** 获取TS格式的类型声明 */


function getTyscriptType(target, definitions) {
  if (target === '') {
    return "null";
  }

  if (target.allOf && target.allOf.length == 1) {
    var type = getModeleType(target.allOf[0].$ref);
    !definitions.includes(type) && definitions.push(type);
    return "".concat(type);
  } //引用其他类型


  if (target.$ref) {
    var _type = getModeleType(target.$ref);

    !definitions.includes(_type) && definitions.push(_type);
    return "".concat(_type);
  } else {
    if (target.oneOf) {
      //普通联合类型  number | string
      return target.oneOf.map(function (i) {
        return transCSharpTypeToTyscriptType(i.type);
      }).join('|');
    } else if (target.allOf) {
      //正常response包裹类型
      var data = target.allOf[1].properties.data; //数组类型

      if (data.type === "array") {
        if (data.items.$ref) {
          var _type2 = getModeleType(data.items.$ref);

          !definitions.includes(_type2) && definitions.push(_type2);
          return "".concat(_type2, "[]");
        } else if (data.items.oneOf) {
          return data.items.oneOf.map(function (i) {
            if (i.$ref) {
              var _type3 = getModeleType(i.$ref);

              !definitions.includes(_type3) && definitions.push(_type3);
              return "".concat(_type3, "[]");
            } else {
              return transCSharpTypeToTyscriptType(i.type);
            }
          }).join('|');
        } else {
          return "".concat(transCSharpTypeToTyscriptType(data.items.type, data.items.format), "[]");
        }
      } else {
        if (data.allOf) {
          var _type4 = getModeleType(data.allOf[0].$ref);

          !definitions.includes(_type4) && definitions.push(_type4);
          var innerData = data.allOf[1].properties[Object.keys(data.allOf[1].properties)[0]];

          if (innerData.type === "array") {
            if (innerData.items.$ref) {
              var innerType = getModeleType(innerData.items.$ref);
              !definitions.includes(innerType) && definitions.push(innerType);
              return "".concat(_type4, "<").concat(innerType, "[]>");
            } else {
              return "".concat(_type4, "<").concat(transCSharpTypeToTyscriptType(innerData.items.type, innerData.items.format), "[]>");
            }
          } else {
            if (innerData.$ref) {
              var _innerType = getModeleType(innerData.$ref);

              !definitions.includes(_innerType) && definitions.push(_innerType);
              return "".concat(_type4, "<").concat(_innerType, ">");
            } else {
              if (innerData.type === void 0) {
                //当type为undefined的时候 存在其实是枚举类型的参数的情况
                //TODO
                return 'any';
              }

              return transCSharpTypeToTyscriptType(innerData.type, innerData.format);
            }
          }
        } else if (data.$ref) {
          var _type5 = getModeleType(data.$ref);

          !definitions.includes(_type5) && definitions.push(_type5);
          return "".concat(_type5);
        } else {
          if (data.type === void 0) {
            //当type为undefined的时候 存在其实是枚举类型的参数的情况
            //TODO
            return 'any';
          }

          return transCSharpTypeToTyscriptType(data.type, data.format);
        }
      }
    } else {
      //数组类型
      if (target.type === "array") {
        if (target.items.$ref) {
          var _type6 = getModeleType(target.items.$ref);

          !definitions.includes(_type6) && definitions.push(_type6);
          return "".concat(_type6, "[]");
        } else if (target.items.oneOf) {
          return target.items.oneOf.map(function (i) {
            if (i.$ref) {
              var _type7 = getModeleType(i.$ref);

              !definitions.includes(_type7) && definitions.push(_type7);
              return "".concat(_type7, "[]");
            } else {
              return transCSharpTypeToTyscriptType(i.type);
            }
          }).join('|');
        } else {
          return "".concat(transCSharpTypeToTyscriptType(target.items.type, target.items.format), "[]");
        }
      } else {
        if (target.type === void 0) {
          //当type为undefined的时候 存在其实是枚举类型的参数的情况
          //TODO
          return 'any';
        }

        return transCSharpTypeToTyscriptType(target.type, target.format);
      }
    }
  }
}
/** 处理Swagger中的paths字段。里面都是Api */


function paths(paths) {
  var pathMap = {};
  Object.keys(paths).forEach(function (api) {
    var name = api.split('/');
    var info = {
      name: name[name.length - 2] + name[name.length - 1],
      method: paths[api].get ? 'get' : 'post',
      url: api,
      request: [],
      summary: ''
    };
    var data = paths[api][info.method];
    var definitions = [];
    info.summary = data.summary;

    if (data.parameters) {
      info.request = parseParameters(data.parameters, definitions);
    }

    if (data.requestBody) {
      info.request.push({
        name: 'body',
        desc: data.requestBody.description || '描述缺失',
        type: getTyscriptType(data.requestBody.content['application/json'].schema, definitions),
        "in": 'body'
      });
    }

    info.responses = parseResponses(data.responses, definitions);
    info.definitions = definitions;
    var tag;

    if (data.tags) {
      tag = getTagName(data.tags);
    } else {
      console.log('该Api没有标识Tag，默认放到Other里');
      tag = 'Other';
    }

    if (!pathMap[tag]) {
      pathMap[tag] = [];
    }

    pathMap[tag].push(info);
  });
  return pathMap;
}
/** 处理接口入参 */

function parseParameters(parameters, definitions) {
  var argument = [];
  parameters.map(function (param) {
    if (param["in"] === 'query' || param["in"] === 'body') {
      argument.push({
        //todo 临时处理参数名称是Page.Pagesize
        name: param.name.includes('.') ? param.name.split('.')[1] : param.name,
        desc: param.description || '描述缺失',
        type: getTyscriptType(param.schema || param, definitions),
        "in": param["in"]
      });
    }

    if (param["in"] === 'formData') {
      argument.push({
        name: param.name,
        desc: param.description || '描述缺失',
        type: 'any',
        "in": param["in"]
      });
    }
  });
  return argument;
}
/** 处理接口出参 */


function parseResponses(responses, definitions) {
  var res = responses['200'];

  if (apiConfig$1.version === 'V2') {
    return getTyscriptType(res.schema || '', definitions);
  } else {
    return getTyscriptType(res.content && res.content[Object.keys(res.content)[0]].schema || '', definitions);
  }
}

module.exports = {
  definitions: definitions,
  paths: paths
};

var apiConfig$2 = getConfig(); // const enumDir = apiConfig.enumIsUnify ? '../../Enum' : '../Enum'

var GenerateFunction$1 = /*#__PURE__*/function () {
  function GenerateFunction() {
    _classCallCheck(this, GenerateFunction);
  }

  _createClass(GenerateFunction, [{
    key: "apiTemplate",
    value: function apiTemplate(api, usedModel, usedEnum, moduleName, basePath) {
      return "\n\t\timport net from '@/request'\n\t\timport { NetConfig } from '@/client/IAxiosConfig'\n\t\t".concat(usedModel.map(function (i) {
        return "import { ".concat(i, " } from '../Type/").concat(i, "'");
      }).join('\r\n'), "\n\t\t").concat(usedEnum.map(function (i) {
        return "import { ".concat(i, " } from '").concat(apiConfig$2.enumIsUnify ? '../../Enum/' + i : '../Enum/' + i, "'");
      }).join('\r\n'), "\n\n\t\t/**\n\t\t *\t").concat(api.summary, "\n\t\t* @param {any} [req] \u643A\u5E26\u8BF7\u6C42\u5934\n\t\t* @param {NetConfig} [config] \u8BF7\u6C42\u914D\u7F6E\n\t\t*/\n\t\texport function ").concat(api.name, "(").concat(this.getRequest(api.request), ") {\n\t\t\treturn net<").concat(api.responses, ">(\n\t\t\t\t{\n\t\t\t\t\turl: '/v2/").concat(moduleName.toLocaleLowerCase()).concat(api.url, "',\n\t\t\t\t\tmethod: '").concat(api.method, "',\n\t\t\t\t\t").concat(this.transformData(api), "\n\t\t\t\t\theaders: req.headers,\n\t\t\t\t},\n\t\t\t\tconfig,\n\t\t\t)\n\t\t}\n\t");
    }
  }, {
    key: "apiIndexFile",
    value: function apiIndexFile(apis) {
      "\n\t\t/**\n\t\t* @description Tag \u63A5\u53E3\u6C47\u603B\n\t\t*/\n\t\t".concat(apis.map(function (i) {
        return "import { ".concat(i, " } from './").concat(i, "'");
      }).join('\r\n'), "\n\n\t\texport default { ").concat(apis.join(' , '), " }\n\t\t");
    }
  }, {
    key: "getRequest",
    value: function getRequest(request) {
      if (request.length) {
        return 'req: any,' + request.map(function (req) {
          return "".concat(req.name, ": ").concat(req.type);
        }).join(',') + ',config?:NetConfig';
      } else {
        return 'req: any,config?:NetConfig';
      }
    }
  }, {
    key: "transformData",
    value: function transformData(api) {
      if (api.request.length === 0) {
        return '';
      } //get一般都是params


      if (api.method === 'get') {
        return "params: {\n\t\t\t\t".concat(api.request.map(function (req) {
          return req.name;
        }).join(','), "\n\t\t\t },");
      }

      var req = '';
      var query = api.request.filter(function (i) {
        return i["in"] === 'query';
      });

      if (query.length) {
        req += "params: {\n\t\t\t\t".concat(query.map(function (req) {
          return req.name;
        }).join(','), "\n\t\t\t },");
      }

      var body = api.request.filter(function (i) {
        return i["in"] === 'body';
      });

      if (body.length) {
        req += 'data: body,';
      }

      var formData = api.request.filter(function (i) {
        return i["in"] === 'formData';
      });

      if (formData.length) {
        req += '_file: file,';
      }

      return req;
    }
  }, {
    key: "aliasModelName",
    value: function aliasModelName(name) {
      return name;
    }
  }]);

  return GenerateFunction;
}();
/** 生成枚举文件 */


function enumFile(module, enumMap, used, dirname) {
  var generateFun = apiConfig$2.GenerateClass ? new apiConfig$2.GenerateClass() : new GenerateFunction$1();
  var enumList = [];
  Object.keys(enumMap).forEach(function (key) {
    if (used.includes(key)) {
      var item = enumMap[key];
      var context = '';

      if (!item.enumname) {
        if (_typeof(item["enum"][0]) === 'object') {
          Object.keys(item["enum"][0]).forEach(function (i) {
            context += "".concat(i, " = ").concat(item["enum"][0][i], ",");
          });
        } else {
          console.log("\u8BA9\u540E\u7AEF\u628A".concat(key, "\u8FD9\u4E2A\u679A\u4E3E\u52A0\u4E0A\u63CF\u8FF0"));
          item["enum"].forEach(function (i, index) {
            context += "Enum".concat(index, " = ").concat(item["enum"][index], ",");
          });
        }
      } else {
        item.enumname.forEach(function (i) {
          context += "\n                        //".concat(i.comment, "\n                        ").concat(i.name, " = ").concat(i.value, ",");
        });
      }

      var template = "\n\t\t\t\texport enum ".concat(generateFun.aliasModelName(item.name), " {\n\t\t\t\t\t").concat(context, "\n\t\t\t\t}");

      if (checkIsNeedUpdate('enum', apiConfig$2.enumIsUnify ? key : module + '/' + key, item)) {
        writeFile(generateFun.aliasModelName(key), template, dirname); // console.log(chalk.greenBright(dirname + '/' + key + ' 枚举已更新'))
      }

      enumList.push(generateFun.aliasModelName(key));
    }
  });

  if (!apiConfig$2.enumIsUnify) {
    correctionFile(dirname, enumList, module, 'enum');
  }
}
/** 生成后端模型文件 */

function modelFile(module, enumMap, modelMap, used, dirname) {
  var generateFun = apiConfig$2.GenerateClass ? new apiConfig$2.GenerateClass() : new GenerateFunction$1();
  var modelList = [];
  Object.keys(modelMap).forEach(function (key) {
    if (used.includes(key)) {
      var item = modelMap[key];
      var usedModel = [];
      var usedEnum = [];
      findDefinitions([item], usedEnum, usedModel, enumMap, modelMap, false);
      var context = '';
      var isHaveT = false;
      item.property.forEach(function (key, i) {
        if (key.type === 'T') {
          isHaveT = true;
        }

        context += "\n\t\t\t\t\t/**  ".concat(key.description, " **/\n\t\t\t\t\t").concat(key.name).concat(key.required ? '' : '?', ": ").concat(generateFun.aliasModelName(key.type), "\n\t\t\t\t\t");
      });
      var template = "\n\t\t\t\t".concat(usedModel.map(function (i) {
        return i === key ? ' ' : "import { ".concat(generateFun.aliasModelName(i), " } from './").concat(generateFun.aliasModelName(i), "'");
      }).join('\r\n'), "\n\t\t\t\t").concat(usedEnum.map(function (i) {
        return "import { ".concat(generateFun.aliasModelName(i), " } from '").concat(apiConfig$2.enumIsUnify ? '../../Enum/' + generateFun.aliasModelName(i) : '../Enum/' + generateFun.aliasModelName(i), "'");
      }).join('\r\n'), "\n\n\t\t\t\t/**  ").concat(item.description, " **/\n\t\t\t\texport interface ").concat(generateFun.aliasModelName(item.name)).concat(item["extends"] ? ' extends ' + item["extends"].join(',') : '', " ").concat(isHaveT ? '<T>' : '', " {\n\t\t\t\t\t").concat(context, "\n\t\t\t\t}");

      if (checkIsNeedUpdate('type', module + '/' + generateFun.aliasModelName(key), item)) {
        writeFile(generateFun.aliasModelName(key), template, dirname); // console.log(chalk.greenBright(dirname + '/' + key + ' 模型已更新'))
      }

      modelList.push(generateFun.aliasModelName(key));
    }
  });
  correctionFile(dirname, modelList, module, 'type');
}
/** 生成后端API文件 */

function apiFile(module, apis, enumMap, modelMap, dirname, swaggerjson) {
  var generateFun = apiConfig$2.GenerateClass ? new apiConfig$2.GenerateClass() : new GenerateFunction$1();
  var apiList = [];
  var requestUsedAllEnum = [];
  var requestUsedAllModel = [];
  apis.forEach(function (api) {
    if (checkIsNeedUpdate('api', module + '/' + api.name, api)) {
      var usedModel = [];
      var usedEnum = [];
      findDefinitions([api], usedEnum, usedModel, enumMap, modelMap, false);
      api.request.map(function (i) {
        i.oldType = i.type;
        i.type = generateFun.aliasModelName(i.type);
        return i;
      });
      api.responses = generateFun.aliasModelName(api.responses);
      writeFile(api.name, generateFun.apiTemplate(api, usedModel.map(function (i) {
        return generateFun.aliasModelName(i);
      }), usedEnum.map(function (i) {
        return generateFun.aliasModelName(i);
      }), module, swaggerjson), dirname); // console.log(chalk.greenBright(dirname + '/' + api.name + ' 接口已更新'))

      if (api.request) {
        api.request.forEach(function (req) {
          if (enumMap[req.type] && !requestUsedAllEnum.includes(req.type)) {
            requestUsedAllEnum.push(req.type);
          } else {
            if (modelMap[req.oldType] && !requestUsedAllModel.includes(req.type)) {
              requestUsedAllModel.push(req.type);
            }
          }
        });
      }
    }

    apiList.push(api.name);
  });

  if (checkIsNeedUpdate('tag', module, apiList.join(' , '))) {
    writeFile('index', generateFun.apiIndexFile(apis, module, requestUsedAllModel, requestUsedAllEnum), dirname); // console.log(chalk.yellowBright(module + '控制器已更新'))
  } //Api 改名相当于新建一个，删除无用的
  //删除没有的Api


  apiList.push('index');
  correctionFile(dirname, apiList, module, 'api');
}
module.exports = {
  enumFile: enumFile,
  modelFile: modelFile,
  apiFile: apiFile
};

require('fs');

require('path');

var chalk$2 = require('chalk');
var apiConfig$3 = getConfig();

if (apiConfig$3.cache) {
  checkOutputDirExit('/port.lock.json');
}

var axios = require('axios');
//正式用


function readOnlineFile() {
  console.time(chalk$2.blueBright('耗时'));
  var count = 0;

  if (apiConfig$3.groupList) {
    apiConfig$3.groupList.forEach(function (item) {
      checkOutputDirExit(item.outputDir);
      item.list.forEach(function (url) {
        axios.get(apiConfig$3.baseUrl + url).then(function (r) {
          if (r.status === 200) {
            console.log(chalk$2.greenBright(url + '地址请求成功'));
            compile(r.data, item.outputDir);

            if (item.list.length === ++count) {
              console.log(chalk$2.greenBright('API文档生成成功🚀🚀🚀'));
              console.timeEnd(chalk$2.blueBright('耗时'));
            }
          }
        })["catch"](function (err) {
          console.log('错误信息:', err);

          if (err.response.status === 502) {
            console.log(chalk$2.redBright(url + '地址请求失败'));
          } else {
            console.log(err);
          }

          if (item.list.length === ++count) {
            console.log(chalk$2.greenBright('API文档生成成功🚀🚀🚀'));
            console.timeEnd(chalk$2.blueBright('耗时'));
          }
        });
      });
    });
  } else {
    checkOutputDirExit(apiConfig$3.outputDir);
    apiConfig$3.list.forEach(function (url) {
      axios.get(apiConfig$3.baseUrl + url).then(function (r) {
        if (r.status === 200) {
          console.log(chalk$2.greenBright(url + '地址请求成功'));
          compile(r.data, apiConfig$3.outputDir);

          if (apiConfig$3.list.length === ++count) {
            console.log(chalk$2.greenBright('API文档生成成功🚀🚀🚀'));
            console.timeEnd(chalk$2.blueBright('耗时'));
          }
        }
      })["catch"](function (err) {
        console.log('错误信息:', err);

        if (err.response.status === 502) {
          console.log(chalk$2.redBright(url + '地址请求失败'));
        } else {
          console.log(err);
        }

        if (apiConfig$3.list.length === ++count) {
          console.log(chalk$2.greenBright('API文档生成成功🚀🚀🚀'));
          console.timeEnd(chalk$2.blueBright('耗时'));
        }
      });
    });
  }
}

readOnlineFile();

function checkFileStructure(dirname) {
  checkOutputDirExit(dirname);
  checkOutputDirExit(dirname + '/apis');
}

function compile(swaggerjson) {
  var dirname = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : './';
  //转换API
  var pathMap = paths(swaggerjson.paths); //根据Tag创建对应文件夹

  Object.keys(pathMap).forEach(function (module) {
    var moduleDir = "".concat(dirname, "/").concat(module);
    checkFileStructure(moduleDir); //获取一个swagger提供的所有的枚举和类型

    var _definitions = definitions(apiConfig$3.version === 'V2' ? swaggerjson.definitions : swaggerjson.components.schemas),
        enumMap = _definitions.enumMap,
        modelMap = _definitions.modelMap;

    var moduleApis = pathMap[module];
    var usedEnum = [];
    var usedModel = [];
    findDefinitions(moduleApis, usedEnum, usedModel, enumMap, modelMap); //生成enum

    if (usedEnum.length) {
      checkOutputDirExit((apiConfig$3.enumIsUnify ? dirname : moduleDir) + '/Enum');
      enumFile(module, enumMap, usedEnum, (apiConfig$3.enumIsUnify ? dirname : moduleDir) + '/Enum');
    } //生成Request/Response Model


    if (usedModel.length) {
      checkOutputDirExit(moduleDir + '/Type');
      modelFile(module, enumMap, modelMap, usedModel, moduleDir + '/Type');
    } //生成API


    apiFile(module, moduleApis, enumMap, modelMap, moduleDir + '/apis', swaggerjson);
  });
}
