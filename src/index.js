import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory, IndexRoute, Redirect } from 'react-router';

import Layout from './components/layout';
import Layout2 from './components/layout2';
import About from './components/about/about';

// base
//import App from './components/main-page/main-page';

// todo list
//import App from './components/todo-list/index';

// reddit
//import App from './components/reddit-post/index';

// comments
import App from './components/comments/comments.index';

// Render the main component into the dom
ReactDOM.render((
    <Router history={browserHistory}>
        <Route path="/" component={Layout}>
            <IndexRoute component={App}/>
        </Route>
        <Route path="/about" component={Layout2}>
            <IndexRoute component={About}/>
            <Route path="/about/:iter" component={About} />
        </Route>
        <Redirect from="*" to="/" />
    </Router>
), document.getElementById('app'));
