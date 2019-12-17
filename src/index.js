//import React from 'react'
import  React, {Component}from './kreact'
import ReactDom from './kreact-dom'

function Comp(props){
return <h2>hi {props.name}</h2>
}
class Comp2 extends Component{
    render(){
        return (
            <div>
                comp2
            </div>
        )
    }
}
const foor = "democlass"
const users = [{name:'tom'},{name:'jerry'}]
const jsx = (
    <div id="demo" className={foor}>
        <span>hi</span>
        {/* 又开始调用createment函数*/}
        <Comp name="函数组件"></Comp>
        {users.map(u=><h1>kkkk</h1>)}
        <Comp2 name="类组件"></Comp2>
    </div>
)
//一个vdom  
console.log(jsx)
ReactDom.render(jsx,document.querySelector('#root')) 


//1 创建kreact.js 实现createElement并返回vdom
//2 创建kreact-dom.js 实现render，能将kvdom返回的dom添加至container
//3 创建kvdom.js 实现initVNode，能够将vdom转换为dom