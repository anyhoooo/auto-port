const fs = require('fs')
const path = require('path')
const md5 = require('md5');
const chalk = require('chalk')
import {
    getConfig
} from './config'
const apiConfig = getConfig()

/** C#的类型转为 TS的类型 */
export function transCSharpTypeToTyscriptType(origintype) {

    const typeEnmu = {
        integer: 'number',
        string: 'string',
        boolean: 'boolean',
        number: 'number',
        array: '[]',
        object: 'object',
        int64: 'number',
        int32: 'number',
        date: 'string',
    }
    return typeEnmu[origintype.toLocaleLowerCase()]

}

/** 获取引用类型名称 */
export function getModeleType(str) {
    // return str.replace('#/definitions/', '')
    return str.match(/(\w+)$/g)[0]
}

/** 写入文件 */
export function writeFile(name, data, dirname) {
    if (!fs.existsSync(path.resolve(process.cwd() + dirname))) {
        fs.mkdirSync(path.resolve(process.cwd() + dirname))
    }
    const filePath = path.resolve(process.cwd() + dirname, name + '.ts')
    fs.writeFileSync(filePath, data)
    prettierFiles(filePath)
}


const prettier = require('prettier')
const prettierConfigPath = require.resolve(apiConfig.prettierUrl ? path.resolve(process.cwd() + apiConfig.prettierUrl) : '../.prettierrc.yml')
/** 格式化文件 */
const prettierFiles = file => {


    const options = prettier.resolveConfig.sync(file, {
        config: prettierConfigPath,
    })
    const fileInfo = prettier.getFileInfo.sync(file)
    if (fileInfo.ignored) {
        return
    }
    try {
        const input = fs.readFileSync(file, 'utf8')
        const withParserOptions = {
            ...options,
            parser: fileInfo.inferredParser,
        }
        const output = prettier.format(input, withParserOptions)
        if (output !== input) {
            fs.writeFileSync(file, output, 'utf8')
        }
    } catch (e) {
        console.log('格式化出错了')
    }
}

/** 校正文件(删除无用的文件) */
export function correctionFile(dirname, list, module, type) {
    let dataFiles = list.map(i => i + '.ts').sort((a, b) => a.localeCompare(b))
    let currentFiles = fs.readdirSync(path.resolve(process.cwd() + dirname)).sort((a, b) => a.localeCompare(b));
    if (dataFiles.join() !== currentFiles.join()) {
        if (dataFiles.length > currentFiles.length) {
            console.log('看看是不是哪里出错了~~~~~~')
        } else {
            currentFiles.forEach(fileName => {
                if (!dataFiles.includes(fileName)) {
                    fs.unlinkSync(path.resolve(process.cwd() + dirname + '/' + fileName))
                    removeCache(type, module + '/' + fileName.split('.')[0])
                    console.log(chalk.redBright('删除了' + dirname + '/' + fileName))
                }
            })
        }
    }
}

/** 检查是否存在文件夹 */
export function checkOutputDirExit(outputDir) {
    let dirList = outputDir.split('/').filter(i => i)
    if (!fs.existsSync(path.resolve(process.cwd() + outputDir))) {
        if (outputDir === '/port.lock.json') {
            fs.writeFileSync(path.resolve(process.cwd() + outputDir), '{"enum":{},"type":{},"api":{},"tag":{}}')
        } else {
            let url = ''
            dirList.forEach(dir => {
                url += '/' + dir
                if (!fs.existsSync(path.resolve(process.cwd() + url))) {
                    fs.mkdirSync(path.resolve(process.cwd() + url))
                }

            })

        }

    }
}

/** 获取Tag名称 */
export function getTagName(str) {
    if (str.length === 0) {
        throw new Error('无所属模块')
    } else {
        return str[0]
    }
}

function removeCache(type, key) {
    if (apiConfig.cache) {
        const cacheData = require(path.resolve(process.cwd() + '/port.lock.json'))
        delete cacheData[type][key]
        fs.writeFileSync(path.resolve(process.cwd() + '/port.lock.json'), JSON.stringify(cacheData, null, 2))
    }

}
/** 判断是否需要更新 */
export function checkIsNeedUpdate(type, key, value) {
    if (apiConfig.cache) {
        const cacheData = require(path.resolve(process.cwd() + '/port.lock.json'))
        //如果缓存有，进去比较hash
        if (cacheData[type][key]) {
            if (cacheData[type][key] !== md5(JSON.stringify(value))) {
                cacheData[type][key] = md5(JSON.stringify(value))
                fs.writeFileSync(path.resolve(process.cwd() + '/port.lock.json'), JSON.stringify(cacheData, null, 2))
                return true
            } else {
                return false
            }
        } else {
            //如果没有，创建hash
            cacheData[type][key] = md5(JSON.stringify(value))
            fs.writeFileSync(path.resolve(process.cwd() + '/port.lock.json'), JSON.stringify(cacheData, null, 2))
            return true
        }
    } else {
        return true
    }

}

/** 获取依赖的enum和model */
export function findDefinitions(target, usedEnum, usedModel, enumMap, modelMap, isDeep = true) {
    target.forEach(i => {
        if (i.definitions.length) {
            i.definitions.forEach(j => {
                if (enumMap[j] && !usedEnum.includes(j)) {
                    usedEnum.push(j)
                } else if (modelMap[j] && !usedModel.includes(j)) {
                    usedModel.push(j)
                    if (isDeep) {
                        findDefinitions([modelMap[j]], usedEnum, usedModel, enumMap, modelMap)
                    }
                }
            })
        }
    })
}

module.exports = {
    transCSharpTypeToTyscriptType,
    getModeleType,
    writeFile,
    checkOutputDirExit,
    getTagName,
    checkIsNeedUpdate,
    correctionFile,
    findDefinitions
}