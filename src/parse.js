import {
    getConfig
} from './config'
const apiConfig = getConfig()
import {
    getModeleType,
    transCSharpTypeToTyscriptType,
    getTagName
} from './utils'



/** 处理Swagger中的Definitions字段。包含DTO和enum */
export function definitions(definitions) {
    const types = Object.keys(definitions)
    const modelMap = {}
    const enumMap = {}
    types.map(name => {
        const target = definitions[name]

        if (target[apiConfig.enumSign]) {
            enumMap[name] = parseEnum(target, name)
        } else {
            modelMap[name] = parseModel(target, name)
        }

    })
    return {
        modelMap,
        enumMap
    }
}
/** 处理Menu，返回枚举通用模型 */
function parseEnum(target, name) {
    return {
        name: name,
        description: target.description,
        enum: target.enum,
        enumname: target.fields,
    }
}
/** 处理后端模型，返回通用模型 */
function parseModel(target, name) {
    const definitions = []
    return {
        name: name,
        description: target.description || '注释缺失',
        property: parseProperties(target, definitions),
        definitions: definitions
        // type: target.allOf ? 'object' : target.type,
        // extends: target.allOf ? getExtendsType(target) : null,
    }
}
/** 处理对象参数 */
function parseProperties(target, definitions) {
    if (!target.properties) {
        return []
    }
    const propetys = []
    //必填字段
    const requiredArr = target.required || []
    Object.keys(target.properties).map(pro => {
        const targetPro = target.properties[pro]
        // const issimple = targetPro.allOf ? false : ifSimpleType(targetPro)
        propetys.push({
            name: pro,
            type: getTyscriptType(targetPro, definitions),
            description: targetPro.description || '注释缺失',
            required: requiredArr.includes(pro) ? true : false,
        })
    })
    return propetys
}

function getReplaceNames(type) {
    if (type.includes('IPagedResponse')) {
        return {
            name: type.replace('IPagedResponse', ''),
            toArray: false
        }
    } else
    if (type.includes('IListResponse')) {
        return {
            name: type.replace('IListResponse', ''),
            toArray: true
        }
    } else
    if (type.includes('IResponse')) {
        return {
            name: type.replace('IResponse', ''),
            toArray: false
        }
    } else {
        return {
            name: type,
            toArray: false
        }
    }
}
/** 获取TS格式的类型声明 */
function getTyscriptType(target, definitions) {
    if (target === '') {
        return `null`
    }
    //引用其他类型
    if (target.$ref) {
        let type = getModeleType(target.$ref);
        // let {
        // 	name,
        // 	isArray
        // } = getReplaceNames(type);
        // !definitions.includes(name) && definitions.push(name)
        // return `${name}${isArray?'[]':''}`
        !definitions.includes(type) && definitions.push(type);
        return `${type}`
    } else {
        //联合类型
        if (target.oneOf) {
            return target.oneOf.map(i => transCSharpTypeToTyscriptType(i.type)).join('|')
        } else {
            //数组类型
            if (target.type === "array") {
                if (target.items.$ref) {
                    let type = getModeleType(target.items.$ref);
                    !definitions.includes(type) && definitions.push(type)
                    return `${type}[]`
                } else {
                    return `${transCSharpTypeToTyscriptType(target.items.type)}[]`
                }
            } else {
                if (target.type === void 0) {
                    //当type为undefined的时候 存在其实是枚举类型的参数的情况
                    //TODO
                    return 'any'
                }
                return transCSharpTypeToTyscriptType(target.type)
            }
        }
    }

}
/** 处理Swagger中的paths字段。里面都是Api */
export function paths(paths) {
    const pathMap = {}
    Object.keys(paths).forEach(api => {
        const info = {
            name: api.split('/').pop(),
            method: paths[api].get ? 'get' : 'post',
            url: api,
            request: [],
            summary: '',
        }
        const data = paths[api][info.method]
        const definitions = []
        info.summary = data.summary
        if (data.parameters) {
            info.request = parseParameters(data.parameters, definitions)


        }

        info.responses = parseResponses(data.responses, definitions)
        info.definitions = definitions
        let tag
        if (data.tags) {
            tag = getTagName(data.tags)
        } else {
            console.log('该Api没有标识Tag，默认放到Other里')
            tag = 'Other'
        }
        if (!pathMap[tag]) {
            pathMap[tag] = []
        }
        pathMap[tag].push(info)
    })
    return pathMap
}
/** 处理接口入参 */
function parseParameters(parameters, definitions) {
    const argument = []

    parameters.map(param => {

        if (param.in === 'query' || param.in === 'body') {
            argument.push({
                //todo 临时处理参数名称是Page.Pagesize
                name: param.name.includes('.') ? param.name.split('.')[1] : param.name,
                desc: param.description || '描述缺失',
                type: getTyscriptType(param.schema || param, definitions),
                in: param.in
            })
        }
        if (param.in === 'formData') {
            argument.push({
                name: param.name,
                desc: param.description || '描述缺失',
                type: 'any',
                in: param.in
            })
        }
    })
    return argument

}
/** 处理接口出参 */
function parseResponses(responses, definitions) {
    const res = responses['200']
    if (apiConfig.version === 'V2') {
        return getTyscriptType(res.schema || '', definitions)
    } else {
        return getTyscriptType(res.content && res.content[Object.keys(res.content)[0]].schema || '', definitions);
    }

}
module.exports = {
    definitions,
    paths
}