
//要返回vdom 是个对象
function createElement(type,props,...children){
    //返回vdom对象
    props.children = children
    delete props.__self;
    delete props.__source;

    //能够区分组件类型
    //vtype :1-->原生标签 2：-函数组件 3-类组件
    let vtype;
    if(typeof type === 'string'){
       vtype=1;
    }else{
       if(type.isReactComponent){
           vtype = 3
       }
       else{
           vtype =2
       }
    }
    return {type,props,vtype}
}

export class Component{
    static isReactComponent = true
    constructor(props){
        this.props = props
        this.state={}
    }
    setState(){

    }
    forceUpdate(){
        
    }
}
export default {createElement}