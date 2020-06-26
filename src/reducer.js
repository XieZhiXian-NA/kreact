import isPromise from "is-promise";

// compose函数最后返回的是一个f1(f2(f3(...args)))的复合函数
function compose(...funcs) {
    const len = funcs.length
    if (len === 0) return arg => arg;
    if (len === 1) return funcs[0]
    return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

export function createStore(reducer,enhancer) {
    if(enhancer) {
       return  enhancer(createStore)(reducer)
    }
    let currentState = undefined
    const listeners = []
    function getState() {
        return currentState
    }
    function dispatch(action) {
        currentState = reducer(currentState, action)
        listeners.forEach(listener => listener())
        return action;
    }
    function subscribe(cb) {
        listeners.push(cb)
        //返回一个当当前组件卸载时，要清除该组件上面的监听强制更新事件
        return () => {
            const index = listeners.indexOf(cb);
            listeners.splice(index, 1);
        };
    }
    //初始化reducer里面的state
    dispatch({type:'@IMOOC/KKB-REDUX'})
    return {
        getState,
        dispatch,
        subscribe
    }
}

export function applyMiddleware(...middlewares){
    return createStore=>(...args)=>{
        const store = createStore(...args)
        let dispatch = store.dispatch
        let midApi = {
            getState:store.getState,
            dispatch:(action,...args)=>dispatch(action,...args)
        }
        // 中间件运行，传入中间件中可能用到的dispatch,getState参数，每个中间件返回的是一个函数，该函数接受一个dispatch参数
        const chain = middlewares.map(mw=>mw(midApi))
        // 加强dispatch方法，即是f1(f2(f3(dispatch))) //最后一个函数要传入没有加强过的dispatch方法，最后返回到的是一个加强过的dispatch方法。
        // 此时的dispatch是加强版本的
        dispatch = compose(...chain)(dispatch)
        return {...store,dispatch}
    }

}

export function combineReducers(reducers){
    return function combination(state={},action){
        let nextState = {}
        let hasChanged = false;
        for(let key in reducers){
            const reducer = reducers[key]
            nextState[key] = reducer(state[key],action)
            hasChanged = nextState[key] !== state[key]
        }
        hasChanged = hasChanged || Object.keys(reducers).length!==Object.keys(state).length;
        return hasChanged ?nextState:state
    }
}

// logger中间件 第一个中间件中的next是一个纯净的dispatch
function logger({getState}){
    return next=>action=>{
        console.log('------------------------------');
        const prevState = getState()
        console.log('prev state',prevState)

        const returnValue = next(action);
        const nextState = getState()
        console.log('next state',nextState,returnValue)

        console.log('------------------------------');
        return returnValue
    }
}

// 对于此时的中间件来说，返回给加强版的dispatch是 action=>{}
// 如果在组件中传入的action是异步的，直接调用的是action(加强版的dispatch)
// 如果不是异步的，此时的next是上一个中间件处理以后返回的action=>{}
function thunk({dispatch,getState}){
    return next => action =>{
        if(typeof action==='function') return action(dispatch,getState)
        return next(action)
    }
}

function promise({dispatch}){
    return next=>action=>{
        return isPromise(action)?action.then(dispatch):next(action);
    }
}