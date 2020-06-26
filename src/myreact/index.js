var nextUnitOfWork = null
var wipRoot = null //working in progress 进行中的任务,当前工作fiber的根节点
var currentRoot = null
function createElement(type,props,...children){
  delete props.__self
  delete props.__source
  return {
      type,
      props:{
          ...props,
          children:children.map(child=>{
             return typeof child === 'object' ? child:createTextElement(child)

          })
      }
  }
}

function createTextElement(text){
    return {
        type:"TEXT",
        props:{
        nodeValue:text,
        children:[]
       }}
    
}

function render(vdom,container){
   //跟fiber调度逻辑息息相关
   //    container.innerHTML = '<pre>' + JSON.stringify(vdom,null,2) + '</pre>';
   wipRoot = {
       dom:container,
       props:{
           children:[vdom]
       },
       base:currentRoot
   }
   nextUnitOfWork = wipRoot
}

function createDom(vdom){
    const dom  = vdom.type === 'TEXT'
    ? document.createTextNode('')
    : document.createElement(vdom.type)
    updateDom(dom,{},vdom.props)
   return dom
}
//设置dom属性
function updateDom(dom,prevProps,nextProps){
   // 删除不存在新dom节点的属性
   console.log('333',dom)
   Object.keys(prevProps)
   .filter(name=>name!=='children') 
   .filter(name=>!(name in nextProps))
   .forEach(name=>{
       if(name.slice(0,2)==='on'){
             //    onClick => click()
         dom.removeEventListener(name.slice(2).toLowerCase(),prevProps[name],false)
       }else{
         dom[name] = ''
       }
       }
      )
    Object.keys(nextProps)
   .filter(name=>name!=='children') 
   .forEach(name=>{
       if(name.slice(0,2)==='on'){
             //    onClick => click()
         dom.addEventListener(name.slice(2).toLowerCase(),nextProps[name],false)
       }else{
         dom[name] = nextProps[name]
       }
       }
      )
}
// 提交修改后，直接更新
function commitRoot(){
    console.log(wipRoot)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
} 

function commitWork(fiber){
      if(!fiber){
          return 
      }
      
      let domParentFiber = fiber.parent
      console.log('ddd',fiber)
      while(!domParentFiber.dom){
          domParentFiber = domParentFiber.parent
      }
      const domParent = domParentFiber.dom
      if(fiber.effectTag==='PLACEMENT' && fiber.dom!=null){
          domParent.appendChild(fiber.dom)
      }else if(fiber.effectTag==='UPDATE' && fiber.dom!=null){
           updateDom(fiber.dom,fiber.base.props,fiber.props)
      }
      commitWork(fiber.child)
      commitWork(fiber.sibling)
}
// 开始任务 = null
// 调度 
// fiber任务变成一个链表，记住当前要做的任务即可，通过当前任务，指向下一个
function workLoop(deadline){
    while(nextUnitOfWork && deadline.timeRemaining()>1){
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
    if(!nextUnitOfWork && wipRoot){
        //执行dom修改 diff结束
        commitRoot()
    }
    window.requestIdleCallback(workLoop)
}
window.requestIdleCallback(workLoop)
//下一个单元任务
function performUnitOfWork(fiber){
   // 根据当前任务，计算diff,返回下一个任务 子兄父

   // 更新vdom的逻辑

   const isFuncComponent = fiber.type instanceof Function
   if(isFuncComponent)  {
     // 更新函数组件 处理vdom,将其转化为需要的fiber结构的对象，并标记怎么去更新当前节点，
     // 当时并不更新，只是标记，异步更新为dom 
     updateFuncComponent(fiber)
   }else{
       //更新dom标签hostComponent 浏览器自定义 p div
       updateHostComponent(fiber ) 
   }
   if(fiber.child){
       return fiber.child
   }
   let newFiber  = fiber
   while(newFiber){
       if(newFiber.sibling){
           return newFiber.sibling
       }
       // 如果没有兄弟元素，返回上一级，返回父元素查找
       newFiber = newFiber.parent
   }

}
//更新函数组件 只考虑hooks
var wipFiber = null
var hookIndex = null
function updateFuncComponent(fiber){
    wipFiber = fiber
    hookIndex = 0
    wipFiber.hooks = []//存储hooks的地方
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber,children)
    console.log('wipFiber',wipFiber)
}
//更新宿主组件
function updateHostComponent(fiber){
  if(!fiber.dom){
      fiber.dom = createDom(fiber)
  }
  reconcileChildren(fiber,fiber.props.children)
}
// 将vdom转换为fiber结构的对象
function reconcileChildren(wipFiber,elements){
 //子元素的遍历 和vdom diff核心逻辑一直，找出最小的修改，操作最少的dom
 let index = 0
 let oldFiber = wipFiber.base && wipFiber.base.child
 let prevSibling = null
 while(index<elements.length || oldFiber!=null ){
     let element = elements[index]
     let newFiber = null
     //对比新老元素
     const sameType = oldFiber && element && oldFiber.type === element.type
     if(sameType){
         newFiber = {
             type:oldFiber.type,
             props:element.props,
             dom:oldFiber.dom,
             parent:wipFiber,
             base:oldFiber,
             effectTag:'UPDATE'
         }
     }
     if(element && !sameType){
        newFiber = {
            type:element.type,
            props:element.props,
            dom:null,
            parent:wipFiber,
            base:null,
            effectTag:'PLACEMENT'
        }
     }
     if(oldFiber){
         oldFiber = oldFiber.sibling
     }
     if(index === 0) {
         wipFiber.child = newFiber
     }else{
         prevSibling.sibling = newFiber
     }
     prevSibling = newFiber
     index++
 }
    

 
}
//状态修改
function useState(init){
  // 启动任务队列
  // 初始化开始任务
  // hooks就是一个数组，每一个数据记录着当前的数据
  // 如果修改了,更新wipRoot，启动workLoop就oK 自动performUnitOfwork就开始
  const oldHook = wipFiber.base && wipFiber.base.hooks && wipFiber.base.hooks[hookIndex]
  const hook = {
      state:oldHook?oldHook.state:init,
      queue:[]
  }
  const actions = oldHook?oldHook.queue:[]
  actions.forEach(action=>{
      hook.state = action
  })

  // 所谓的异步修改 
  const setState = action =>{
      hook.queue.push(action)
      // 通过nextUbitOfWork 启动
      wipRoot = {
          dom:currentRoot.dom,
          props:currentRoot.props,
          base:currentRoot //找到上一个节点
      }
      nextUnitOfWork = wipRoot
  }
  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state,setState]
}



//react16是hooks fiber的天下
export default {
    createElement,
    render,
    useState
}