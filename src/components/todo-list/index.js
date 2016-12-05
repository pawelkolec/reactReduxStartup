import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import todoApp from './reducers'
import App from './App'

let store = createStore(todoApp);

class ProviderTodoList extends React.Component {
    
    constructor() {
        super()
    }
    
    render() {
        return(
            <Provider store={store}>
                <App />
            </Provider>
        );
    }
}

export default ProviderTodoList;