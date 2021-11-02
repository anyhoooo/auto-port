const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

import {
    getConfig
} from './config'
const apiConfig = getConfig()

import {
    checkOutputDirExit,
    findDefinitions
} from './utils'

if (apiConfig.cache) {
    checkOutputDirExit('/port.lock.json')
}
const axios = require('axios')

import {
    paths,
    definitions
} from './parse'
import {
    enumFile,
    modelFile,
    apiFile
} from './generate'




//调试用
function readLocalFile() {
    console.time(chalk.blueBright('耗时'))
    let count = 0
    let filelist = ['../mock/swagger.mock4.json']
    checkOutputDirExit(apiConfig.outputDir)
    filelist.forEach(url => {
        fs.readFile(path.resolve(__dirname, url), 'utf-8', function (err, data) {
            if (err) {
                if (filelist.length === ++count) {
                    console.log(chalk.greenBright('API文档生成成功🚀🚀🚀'))
                    console.timeEnd(chalk.blueBright('耗时'))
                }
            } else {
                setTimeout(() => {
                    let res = JSON.parse(data.toString())
                    compile(res, apiConfig.outputDir)
                    if (filelist.length === ++count) {
                        console.log(chalk.greenBright('API文档生成成功🚀🚀🚀'))
                        console.timeEnd(chalk.blueBright('耗时'))
                    }
                }, 2000);

            }

        })
    })


}
// debugger
// readLocalFile()
//正式用
function readOnlineFile() {
    console.time(chalk.blueBright('耗时'))
    let count = 0
    if (apiConfig.groupList) {
        apiConfig.groupList.forEach(item => {
            checkOutputDirExit(item.outputDir)
            item.list.forEach(url => {
                axios.get(apiConfig.baseUrl + url).then(r => {
                    if (r.status === 200) {
                        console.log(chalk.greenBright(url + '地址请求成功'))
                        compile(r.data, item.outputDir)
                        if (item.list.length === ++count) {
                            console.log(chalk.greenBright('API文档生成成功🚀🚀🚀'))
                            console.timeEnd(chalk.blueBright('耗时'))
                        }
                    }
                }).catch(err => {
                    console.log('错误信息:', err);
                    if (err.response.status === 502) {
                        console.log(chalk.redBright(url + '地址请求失败'))
                    } else {
                        console.log(err)
                    }
                    if (item.list.length === ++count) {
                        console.log(chalk.greenBright('API文档生成成功🚀🚀🚀'))
                        console.timeEnd(chalk.blueBright('耗时'))
                    }
                })

            })
        })
    } else {
        checkOutputDirExit(apiConfig.outputDir)
        apiConfig.list.forEach(url => {
            axios.get(apiConfig.baseUrl + url).then(r => {
                if (r.status === 200) {
                    console.log(chalk.greenBright(url + '地址请求成功'))
                    compile(r.data, apiConfig.outputDir)
                    if (apiConfig.list.length === ++count) {
                        console.log(chalk.greenBright('API文档生成成功🚀🚀🚀'))
                        console.timeEnd(chalk.blueBright('耗时'))
                    }
                }
            }).catch(err => {
                console.log('错误信息:', err);
                if (err.response.status === 502) {
                    console.log(chalk.redBright(url + '地址请求失败'))
                } else {
                    console.log(err)
                }
                if (apiConfig.list.length === ++count) {
                    console.log(chalk.greenBright('API文档生成成功🚀🚀🚀'))
                    console.timeEnd(chalk.blueBright('耗时'))
                }
            })

        })
    }

}

readOnlineFile()




function checkFileStructure(dirname) {
    checkOutputDirExit(dirname)
    checkOutputDirExit(dirname + '/apis')
}

function compile(swaggerjson, dirname = './') {


    if(typeof swaggerjson === 'string'){
        let source = swaggerjson.replace(/\n/gm, ' ');
        // 下面校验给定字符串是否为一个合法的json
        try {
            // 再看看是不是jsonp的格式
            let reg = /^([\w\.]+)\(\s*([\s\S]*)\s*\)$/igm;
            let matches = reg.exec(source);
            if (matches != null) {
                funcName = matches[1];
                source = matches[2];
            }
            // 这里可能会throw exception
            swaggerjson = JSON.parse(source);
        } catch (ex) {
            // new Function的方式，能自动给key补全双引号，但是不支持bigint，所以是下下策，放在try-catch里搞
            try {
                swaggerjson = new Function("return " + source)();
            } catch (exx) {
                try {
                    // 再给你一次机会，是不是下面这种情况：  "{\"ret\":\"0\", \"msg\":\"ok\"}"
                    swaggerjson = new Function("return '" + source + "'")();
                    if (typeof swaggerjson === 'string') {
                        // 最后给你一次机会，是个字符串，老夫给你再转一次
                        swaggerjson = new Function("return " + jsonObj)();
                    }
                } catch (exxx) {
                    console.log('====================================');
                    console.log(exxx);
                    console.log('====================================');
                }
            }
        }
    }
    //转换API
    const pathMap = paths(swaggerjson.paths)

    //根据Tag创建对应文件夹
    Object.keys(pathMap).forEach(module => {
        let moduleDir = `${dirname}/${module}`
        checkFileStructure(moduleDir)

        //获取一个swagger提供的所有的枚举和类型
        const {
            enumMap,
            modelMap
        } = definitions(apiConfig.version === 'V2' ? swaggerjson.definitions : swaggerjson.components.schemas)

        let moduleApis = pathMap[module]

        let usedEnum = []
        let usedModel = []
        findDefinitions(moduleApis, usedEnum, usedModel, enumMap, modelMap)

        //生成enum
        if (usedEnum.length) {
            checkOutputDirExit((apiConfig.enumIsUnify ? dirname : moduleDir) + '/Enum')
            enumFile(module, enumMap, usedEnum, (apiConfig.enumIsUnify ? dirname : moduleDir) + '/Enum')
        }
        //生成Request/Response Model
        if (usedModel.length) {
            checkOutputDirExit(moduleDir + '/Type')
            modelFile(module, enumMap, modelMap, usedModel, moduleDir + '/Type')
        }
        //生成API
        apiFile(module, moduleApis, enumMap, modelMap, moduleDir + '/apis', swaggerjson)
    })


}