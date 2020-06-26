import React,{useContext,useState,useEffect} from 'react'
const ReduxContext = React.createContext()
export function Provider({store,children}){
    return (
        <ReduxContext.Provider value={store}>{children}</ReduxContext.Provider>
    )
}
export const connect = (
    mapStateToProps = state=>state,
    mapDispatchToProps = {}
)=>Cmp=>props=>{
    const store = useContext(ReduxContext) 
    const {getState, dispatch, subscribe} = store;
    const getMoreProps = ()=>{
        //返回的state
        const stateProps = mapStateToProps(getState());
        const dispatch = bindActionCreators(
            mapDispatchToProps,
            store.dispatch
            )
        return {...stateProps,...dispatch}
    }
    useEffect(() => {
       let unsubscribe =  store.subscribe(()=>{
            setMoreProps({...moreProps,...getMoreProps()})
        })
      return ()=>{
          unsubscribe && unsubscribe()
      }
    }, [])
    const [moreProps,setMoreProps] = useState(getMoreProps())
    return <Cmp {...props} {...moreProps}></Cmp>
}

//给所有的方法绑定上dispatch
function bindActionCreators(actionCreators,dispatch){
    let obj = {} //避免对象的污染
    for(key in actionCreators){
        obj[key] = bindActionCreator(actionCreators[key],dispatch)
    }
    return obj
}

// actionCreator方法就是function dispatch最终返回的要是一个对象
function bindActionCreator(actionCreator,dispatch){
   return  (...args)=>dispatch(actionCreator(...args))
}