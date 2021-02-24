// const utils = require('./utils')
import {
    getConfig
} from './config'
const apiConfig = getConfig()
// const enumDir = apiConfig.enumIsUnify ? '../../Enum' : '../Enum'

import {
    checkIsNeedUpdate,
    writeFile,
    correctionFile,
    findDefinitions
} from './utils'
class GenerateFunction {
    apiTemplate(api, usedModel, usedEnum, moduleName) {
        return `
		import net from '@/request'
		import { NetConfig } from '@/client/IAxiosConfig'
		${usedModel.map(i=>`import { ${i} } from '../Type/${i}'`).join('\r\n')}
		${usedEnum.map(i=>`import { ${i} } from '${apiConfig.enumIsUnify ? '../../Enum/'+i : '../Enum/'+i}'`).join('\r\n')}

		/**
		 *	${api.summary}
		* @param {any} [req] 携带请求头
		* @param {NetConfig} [config] 请求配置
		*/
		export function ${api.name}(${this.getRequest(api.request)}) {
			return net<${api.responses}>(
				{
					url: '/v2/${moduleName.toLocaleLowerCase()}${api.url}',
					method: '${api.method}',
					${this.transformData(api)}
					headers: req.headers,
				},
				config,
			)
		}
	`
    }
    getRequest(request) {
        if (request.length) {
            return 'req: any,' + request.map(req => {

                return `${req.name}: ${req.type}`
            }).join(',') + ',config?:NetConfig'
        } else {
            return 'req: any,config?:NetConfig'
        }

    }
    transformData(api) {
        if (api.request.length === 0) {
            return ''
        }
        //get一般都是params
        if (api.method === 'get') {
            return `params: {
				${api.request.map(req=>req.name).join(',')}
			 },`
        }
        let req = ''
        let query = api.request.filter(i => i.in === 'query')
        if (query.length) {
            req += `params: {
				${query.map(req=>req.name).join(',')}
			 },`
        }
        let body = api.request.filter(i => i.in === 'body')
        if (body.length) {
            req += 'data: body,'
        }
        let formData = api.request.filter(i => i.in === 'formData')
        if (formData.length) {
            req += '_file: file,'
        }
        return req
    }
}

/** 生成枚举文件 */
export function enumFile(module, enumMap, used, dirname) {
    let enumList = []
    Object.keys(enumMap)
        .forEach(key => {
            if (used.includes(key)) {
                const item = enumMap[key]
                let context = ''
                if (!item.enumname) {
                    if (typeof item.enum[0] === 'object') {
                        Object.keys(item.enum[0]).forEach(i => {
                            context += `${i} = ${item.enum[0][i]},`
                        })
                    } else {
                        console.log(`让后端把${key}这个枚举加上描述`)
                        item.enum.forEach((i, index) => {
                            context += `Enum${index} = ${item.enum[index]},`
                        })
                    }
                } else {
                    item.enumname.forEach((i) => {
                        context += `
                        //${i.comment}
                        ${i.name} = ${i.value},`
                    })
                }
                let template = `
				export enum ${item.name} {
					${context}
				}`
                if (checkIsNeedUpdate('enum', apiConfig.enumIsUnify ? key : module + '/' + key, item)) {
                    writeFile(key, template, dirname)
                    // console.log(chalk.greenBright(dirname + '/' + key + ' 枚举已更新'))
                }
                enumList.push(key)
            }

        })
    if (!apiConfig.enumIsUnify) {
        correctionFile(dirname, enumList, module, 'enum')
    }
}

/** 生成后端模型文件 */
export function modelFile(module, enumMap, modelMap, used, dirname) {
    let modelList = []
    Object.keys(modelMap)
        .forEach(key => {
            if (used.includes(key)) {
                const item = modelMap[key]
                let usedModel = []
                let usedEnum = []
                findDefinitions([item], usedEnum, usedModel, enumMap, modelMap, false)

                let context = ''
                item.property.forEach((key, i) => {
                    context += `
					/**  ${key.description} **/
					${key.name}${key.required ? '' : '?'}: ${key.type}
					`
                })
                let template = `
				${usedModel.map(i=>i===key?' ':`import { ${i} } from './${i}'`).join('\r\n')}
				${usedEnum.map(i=>`import { ${i} } from '${apiConfig.enumIsUnify ? '../../Enum/'+i : '../Enum/'+i}'`).join('\r\n')}

				/**  ${item.description} **/
				export interface ${item.name}${item.extends ? ' extends ' + item.extends.join(',') : ''} {
					${context}
				}`
                if (checkIsNeedUpdate('type', module + '/' + key, item)) {
                    writeFile(key, template, dirname)
                    // console.log(chalk.greenBright(dirname + '/' + key + ' 模型已更新'))
                }
                modelList.push(key)
            }
        })

    correctionFile(dirname, modelList, module, 'type')
}
/** 生成后端API文件 */
export function apiFile(module, apis, enumMap, modelMap, dirname) {

    let template = (apiList) =>
        `
		/**
		* @description Tag 接口汇总
		*/
		${apiList.map(i=>`import { ${i} } from './${i}'`).join('\r\n')}

		export default { ${apiList.join(' , ')} }
		`
    const generateFun = apiConfig.GenerateClass ? new apiConfig.GenerateClass() : new GenerateFunction()
    let apiList = []
    apis.forEach(api => {

        if (checkIsNeedUpdate('api', module + '/' + api.name, api)) {
            let usedModel = []
            let usedEnum = []
            findDefinitions([api], usedEnum, usedModel, enumMap, modelMap, false)
            writeFile(api.name, generateFun.apiTemplate(api, usedModel, usedEnum, module), dirname)
            // console.log(chalk.greenBright(dirname + '/' + api.name + ' 接口已更新'))
        }

        apiList.push(api.name)
    })

    if (checkIsNeedUpdate('tag', module, apiList.join(' , '))) {
        writeFile('index', template(apiList), dirname)
        // console.log(chalk.yellowBright(module + '控制器已更新'))
    } else {
        // console.log(chalk.whiteBright(module + '控制器不需要更新'))
    }
    //Api 改名相当于新建一个，删除无用的
    //删除没有的Api
    apiList.push('index')
    correctionFile(dirname, apiList, module, 'api')

}



module.exports = {
    enumFile,
    modelFile,
    apiFile,
}