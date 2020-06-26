import React, {Component} from "react";
import {createBrowserHistory} from "history";
import matchPath from "./matchPath";
const RouterContext = React.createContext();

// export default class Router extends Component{
//     componentWillMount
// }



export class BrowserRouter extends Component{
  
  constructor(props){
      super(props)
      this.history = createBrowserHistory(this.props)
  }
  render(){
      return (
         <Router history={this.history}>
              {this.props.children}
         
         </Router>
         
      )
  }
}

export class Router extends Component{
    static computeRootMatch(pathname) {
        return {path: "/", url: "/", params: {}, isExact: pathname === "/"};
    }
  constructor(props){
      super(props)
      this.state = {
          location:props.history.location
      }
      this.unlisten = props.history.listen(location=>{
          this.setState(location)
      })
    }
  componentWillUnmount(){
      this.unlisten && this.unlisten()
  }
  render(){
      return (
          <RouterContext.Provider
            value={{
                history:this.props.history,
                location:this.state.location,
                match:Router.computeRootMatch(this.state.location.pathname)
            }}
          >
          {this.props.children}
          </RouterContext.Provider>
      )
  }
}

export default class Route extends Component {
    render(){
        return (
            <RouterContext.Consumer>
                {ctx=>{
                    const {location} = ctx;
                    const {path,children,component,render} = this.props;
                    const match = path?matchPath(location.pathname,this.props):ctx.match
                    const props = {
                        ...ctx,
                        location,
                        match
                    }
                    return (
                        <RouterContext.Provider value={props}>
                           {
                               // 匹配到：按优先级
                               // 匹配不到，查看有没有children,若没有children,才为null
                               match
                               ? children 
                                    ? typeof children === 'function' ? children(props):children
                                    : component ? React.createElement(component,props):render ? render(props) : null
                               : typeof children === 'function' ? children(props) :null
                           }
                        </RouterContext.Provider>
                    )
                }}
            </RouterContext.Consumer>
        )
    }
    

}

export function Link(props){ 
    const {children,to} = this.props
    const  {location,history} = useContext(RouterContext)
    handleClick = (e)=>{
      e.preventDefault();
      history.push(to)
    }
    return  <a href={to} onClick={handleClick}>{children}</a>
}
   