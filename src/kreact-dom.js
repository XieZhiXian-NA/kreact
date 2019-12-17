import {initVNode} from './kvdom'


function render(vdom,container){
  //container.innerHTML = `<pre>${JSON.stringify(vdom)}</pre>`
   const node  = initVNode(vdom)

   container.appendChild(node)


}
export default {render}