import { combineReducers } from 'redux'
import { REQUEST_POSTS, RECEIVE_POSTS, REQUEST_ERROR } from '../actions/api.actions'

function posts(state = {
    isFetching: false,
    didInvalidate: false,
    items:[]
}, action) {
    
    switch(action.type) {
        case REQUEST_POSTS:
            return Object.assign({},state, {
                isFetching: true,
                didInvalidate: false
            });
        case RECEIVE_POSTS:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                items: action.posts,
                lastUpdated: action.receivedAt
            });
        case REQUEST_ERROR:
            return Object.assign({}, state, {
                didInvalidate: false
            });
        default:
            return state;
    }
}

function comments(state = {}, action) {
    
    switch(action.type) {
        case REQUEST_ERROR:
        case REQUEST_POSTS:
        case RECEIVE_POSTS:
            return Object.assign({}, state, {
                CommentsModel: posts(state[action.comments], action)
            });
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    comments
});

export default rootReducer;