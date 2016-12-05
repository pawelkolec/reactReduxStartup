import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'

import rootReducer from '../api/reducers/api.reducers'
import { getComments } from '../api/actions/api.actions'


const store = createStore(
    rootReducer,
    applyMiddleware(
        thunkMiddleware
    )
)

store.dispatch(getComments()).then(() =>
  console.dir(store.getState())
)