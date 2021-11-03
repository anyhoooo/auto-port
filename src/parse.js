import {
    getConfig
} from './config'
const apiConfig = getConfig()
import {
    getModeleType,
    transCSharpTypeToTyscriptType,
    getTagName
} from './utils'
const md5 = require('md5');


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
            ...targetPro,
            name: pro,
            type: getTyscriptType(targetPro, definitions,pro),
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
function getTyscriptType(target, definitions,name) {
    if (target === '') {
        return `null`
    }
    // if(target.enum){
    //     if(process.enumCache[md5(target.enum.join())]){
    //         process.enumCache[md5(target.enum.join())] = ++process.enumCache[md5(target.enum.join())]
    //         return 'string'
    //     }else{
    //         process.enumCache[md5(target.enum.join())] = 1
    //         return  'string'
    //     }
    // }
    if(target.allOf && target.allOf.length == 1){
        let type = getModeleType(target.allOf[0].$ref);
        !definitions.includes(type) && definitions.push(type);
        return `${type}`
    }
    //引用其他类型
    if (target.$ref) {
        let type = getModeleType(target.$ref);
        !definitions.includes(type) && definitions.push(type);
        return `${type}`
    } else {

        if (target.oneOf) {
            //普通联合类型  number | string
            return target.oneOf.map(i => transCSharpTypeToTyscriptType(i.type)).join('|')
        } else if (target.allOf) {
            //正常response包裹类型
            let data = target.allOf[1].properties.data
            //数组类型
            if (data.type === "array") {
                if (data.items.$ref) {
                    let type = getModeleType(data.items.$ref);
                    !definitions.includes(type) && definitions.push(type)
                    return `${type}[]`
                } else if(data.items.oneOf){
                    return data.items.oneOf.map(i =>{
                        if(i.$ref){
                            let type = getModeleType(i.$ref);
                            !definitions.includes(type) && definitions.push(type)
                            return `${type}[]`
                        }else{
                            return transCSharpTypeToTyscriptType(i.type)
                        }
                    }).join('|')
                }else {
                    return `${transCSharpTypeToTyscriptType(data.items.type,data.items.format)}[]`
                }
            } else {
                if (data.allOf) {
                    let type = getModeleType(data.allOf[0].$ref);
                    !definitions.includes(type) && definitions.push(type)
                    let innerData = data.allOf[1].properties[Object.keys(data.allOf[1].properties)[0]]
                    if (innerData.type === "array") {
                        if (innerData.items.$ref) {
                            let innerType = getModeleType(innerData.items.$ref);
                            !definitions.includes(innerType) && definitions.push(innerType)
                            return `${type}<${innerType}[]>`
                        } else {
                            return `${type}<${transCSharpTypeToTyscriptType(innerData.items.type,innerData.items.format)}[]>`
                        }
                    } else {
                        if (innerData.$ref) {
                            let innerType = getModeleType(innerData.$ref);
                            !definitions.includes(innerType) && definitions.push(innerType);
                            return `${type}<${innerType}>`
                        } else {
                            if (innerData.type === void 0) {
                                //当type为undefined的时候 存在其实是枚举类型的参数的情况
                                //TODO
                                return 'any'
                            }
                            return transCSharpTypeToTyscriptType(innerData.type, innerData.format)
                        }
                    }
                } else if (data.$ref) {
                    let type = getModeleType(data.$ref);
                    !definitions.includes(type) && definitions.push(type);
                    return `${type}`
                } else {
                    if (data.type === void 0) {
                        //当type为undefined的时候 存在其实是枚举类型的参数的情况
                        //TODO
                        return 'any'
                    }
                    return transCSharpTypeToTyscriptType(data.type, data.format)
                }
            }
        } else {
            //数组类型
            if (target.type === "array") {
                if (target.items.$ref) {
                    let type = getModeleType(target.items.$ref);
                    !definitions.includes(type) && definitions.push(type)
                    return `${type}[]`
                } else if(target.items.oneOf){
                    return target.items.oneOf.map(i =>{
                        if(i.$ref){
                            let type = getModeleType(i.$ref);
                            !definitions.includes(type) && definitions.push(type)
                            return `${type}[]`
                        }else{
                            return transCSharpTypeToTyscriptType(i.type)
                        }
                    }).join('|')
                }else {
                    return `${transCSharpTypeToTyscriptType(target.items.type,target.items.format)}[]`
                }
            } else {
                if (target.type === void 0) {
                    //当type为undefined的时候 存在其实是枚举类型的参数的情况
                    //TODO
                    return 'any'
                }
                return transCSharpTypeToTyscriptType(target.type, target.format)
            }
        }
    }

}
/** 处理Swagger中的paths字段。里面都是Api */
export function paths(paths) {
    const pathMap = {}
    Object.keys(paths).forEach(api => {
        let name = api.split('/')
        const info = {
            name:new apiConfig.GenerateClass().nameRule?new apiConfig.GenerateClass().nameRule(api): name[name.length - 2] + name[name.length - 1],
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
        if (data.requestBody) {
            info.request.push({
                name: 'body',
                desc: data.requestBody.description || '描述缺失',
                type: getTyscriptType(data.requestBody.content['application/json'].schema, definitions,''),
                in: 'body'
            })
        }
        info.responses = parseResponses(data.responses, definitions)
        info.definitions = definitions
        let tag
        if (data.tags) {
            tag = new apiConfig.GenerateClass().getTagName? new apiConfig.GenerateClass().getTagName(api): getTagName(data.tags)
        } else {
            console.log('该Api没有标识Tag，默认放到Other里')
            tag = 'Other'
        }

        if(!(apiConfig.excludeModule && apiConfig.excludeModule.includes(tag))){
            if (!pathMap[tag]) {
                pathMap[tag] = []
            }
            pathMap[tag].push(info)
        }
       
    })
    return pathMap
}
const conflictName=['function','void','number','string','int']
/** 处理接口入参 */
function parseParameters(parameters, definitions) {
    const argument = []

    parameters.map(param => {

        if (param.in === 'query' || param.in === 'body') {
            if(conflictName.includes(param.name)){
                argument.push({
                    ...param,
                    name: param.name,
                    conflictName:`_${param.name}`,
                    desc: param.description || '描述缺失',
                    type: getTyscriptType(param.schema || param, definitions,param.name),
                    in: param.in
                })
            }else{
                argument.push({
                    ...param,
                    //todo 临时处理参数名称是Page.Pagesize
                    name: param.name.includes('.') ? param.name.split('.')[1] : param.name,
                    desc: param.description || '描述缺失',
                    type: getTyscriptType(param.schema || param, definitions,param.name),
                    in: param.in
                })
            }

        }
        if (param.in === 'formData') {
            argument.push({
                ...param,
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
        return getTyscriptType(res.schema || '', definitions,'')
    } else {
        return getTyscriptType(res.content && res.content[Object.keys(res.content)[0]].schema || '', definitions,'');
    }

}
module.exports = {
    definitions,
    paths
}