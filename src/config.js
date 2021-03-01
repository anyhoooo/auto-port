class GenerateFunction {
    apiTemplate(api, usedModel, usedEnum, moduleName) {
        return `
		import net from '@/request'
		import { NetConfig } from '@/client/IAxiosConfig'
		${usedModel.map(i=>`import { ${i} } from '../Type/${i}'`).join('\r\n')}
		${usedEnum.map(i=>`import { ${i} } from '../../Enum/${i}'`).join('\r\n')}

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
    apiIndexFile(apis,moduleName,usedModel, usedEnum){
        return `
		/**
		* @description Tag 接口汇总
		*/
		${apis.map(i=>`import { ${i} } from './${i}'`).join('\r\n')}

		export default { ${apis.join(' , ')} }
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

function getBaseConfig() {
    return {
        outputDir: '/src/client',
        enumSign: 'enum', //用什么标记改类型是枚举
        enumIsUnify: true, //枚举是否统一存放
        baseUrl: 'localhost:3000',
        list: [
            '/v2/clue/swagger/v1/swagger.json',
        ],
        cache: false, //是否缓存，true会生成port.lock.json
        version: 'V2', //现在后端给的是V2，BFF给的是V3
        GenerateClass: GenerateFunction
    }

}
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const baseConfig = getBaseConfig()

let apiUserConfig = {}
if (!fs.existsSync(path.resolve(process.cwd() + '/auto-port-config.js'))) {
    fs.copyFileSync(path.resolve(__dirname, '../src/copyConfig.js'), path.resolve(process.cwd() + '/auto-port-config.js'));
    console.log(chalk.greenBright('生成auto-port-config.js文件，请修改baseUrl后再执行一次！！'))
} else {
    const {
        getUserConfig
    } = require(path.resolve(process.cwd() + '/auto-port-config.js'))
    apiUserConfig = getUserConfig()
}
export function getConfig() {
    return Object.assign(baseConfig, apiUserConfig)
}