//执行和ｖｄｏｍ相关的操作
export function initVNode(vnode){
    let {vtype} = vnode
    if(!vtype){
         //文本节点
         return document.createTextNode(vnode)
    }
    if(vtype == 1){
        //原生标签
        return createNativeElement(vnode)
    }else if(vtype == 2){
        return createFuncComp(vnode)
    }else{
        return createClassComp(vnode)
    } 
}

function createNativeElement(vnode){
    //1.vnode[type]
    const {type,props} = vnode
   const node =  document.createElement(type)//真实节点
    //过滤特殊属性
    const {key,children,...rest} = props

    Object.keys(rest).forEach(k=>{
        //任然需特殊处理的 htmlFor className
        if(k === 'className'){
            node.setAttribute('class',rest[k])
        }else if(k === 'htmlFor'){
            node.setAttribute('for',rest[k])
        }else{
            node.setAttribute(k,rest[k])
        }
    })
    //递归children
    children.forEach(child=>{
        //将生成的ｄｏｍ作为ｎｏｄｅ节点的孩子节点
        //这就是vdom数组可以自动展开的原因
        if(Array.isArray(child)){
        child.forEach(c=>node.appendChild(initVNode(c)))
        }else{
             node.appendChild( initVNode(child))
        }
         
    })

　　　 return node;
}
function createFuncComp(vnode){
   const {type,props} = vnode
   //此处的type是一个函数
   //该函数返回的是一个jsx 直接执行该函数
   const vdom = type(props)
   return initVNode(vdom)
}
function createClassComp(vnode){
    //此处的type是一个class
    const {type,props} = vnode
    const component = new type(props)
    const vdom = component.render()
    return initVNode(vdom)
}