import fetch from 'isomorphic-fetch'
import React from 'react';
import _ from 'lodash';

export const REQUEST_POSTS = 'REQUEST_POSTS';
export function requestPosts(conf) {
    return {
        type: REQUEST_POSTS,
        conf
    }
}

export const RECEIVE_POSTS = 'RECEIVE_POSTS';
export function receivePosts(conf, json) {
    return {
        type: RECEIVE_POSTS,
        conf,
        posts: json,
        receiveAt: Date.now()
    }
}

export const REQUEST_ERROR = 'REQUEST_ERROR';
export function requestError(conf, error) {
    return {
        type: INVALIDATE_SUBREDDIT,
        conf,
        error,
        receiveAt: Date.now()
    }
}

function Api(dispatch) {
    
    var config = {
        apiConfig: { url: "/api/config", responseType: "json", method: "GET" },
        fakeRootUrl: "src/components/api/fakeResources/",
        rootUrl: null,
        endpoints: null,
        domain: '',
        initialized: false
    };
    
    var self = this;
    self.dispatch = dispatch;
    self.config = config;
    self.request = request;
    self.makeRequest = makeRequest;
    self.getApiConfig = getApiConfig;

    function request(endpoint, configuration) {
        
        // If endpoint contains parameters that should be replaced by specific values
        // you should add replacements array into configuration object. Example:
        // [{ target: '{UID}', value: 1 }]
        var rootAddress = config.rootUrl;

        // to remove on production
        if (configuration && configuration.fake) {
            config.rootAddress = config.fakeRootUrl;
        }

        return new Promise(function(resolve, reject) {
            
            if (!endpoint) {
                return reject('No endpoint provided.');
            }

            if (rootAddress && config.endpoints && config.endpoints[endpoint]) {
                return makeRequest(resolve, reject, rootAddress + config.endpoints[endpoint], configuration);
            }

            if (config.initialized) {
                return reject('Api error or no such endpoint.');
            }

            getApiConfig(config.apiConfig).then(function() {
                return request(endpoint, configuration).then(function(results) {
                        return resolve(results);
                    }, function(results) {
                        return reject(results);
                    })
                }, function(results) {
                    return reject(results);
                });
        });
    }

    function makeRequest(resolve, reject, endpoint, configuration) {
        var config = { responseType: "json" };
        var replacementLength = 0;
        var requestCounter = 0;

        // replace parameters in endpoint if needed, example configuration.replacements:
        // [{ target: '{UID}', value: 1 }]
        if (configuration && configuration.replacements && typeof configuration.replacements.length !== 'undefined') {
            replacementLength = configuration.replacements.length;

            for (var i = 0; i < replacementLength; i++) {
                if (!configuration.replacements[i].target || !configuration.replacements[i].value) {
                    continue;
                }

                endpoint = endpoint.replace(configuration.replacements[i].target, configuration.replacements[i].value);
            }
        }
        /*
        if (cmSession.getCSRF()) {
            if (!configuration.headers) {
                configuration.headers = {};
            }

            Object.assign(configuration.headers, JSON.parse(cmSession.getCSRF()));
        }*/

        Object.assign(config, { url: endpoint });

        if (typeof configuration !== 'undefined') {
            Object.assign(config, configuration);
        }

        // add empty data if no data provided
        if ((config.method === 'POST' || config.method === 'post') && !config.data) {
            config.data = '';
        }

        return new Promise(callBackend).then(function(res) {
            return resolve(res);
        }, function(res) {
            return reject(res);
        });

        function callBackend(resolve, reject) {
            
            self.dispatch(requestPosts(config));
            
            fetch(config.url, {
                method: config.method,
                headers: {
                    dataType: 'json',
                    contentType: 'application/json, charset=utf-8'
                },
                body: JSON.stringify(config.data)
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(response) {

                if (response && response.error) {
                    return reject(response.data.error);
                }
                
                self.dispatch(receivePosts(config, response));
                return resolve(response);

            })
            .catch(function(ex) {

                if (requestCounter > 2) {
                    
                    self.dispatch(requestError(config, ex));
                    return reject(response);
                }

                requestCounter ++;
                setTimeout(callBackend(resolve, reject), 3000);
            });
        }
    }

    function getApiConfig(data) {
        
        return fetch(data.url, {
            method: data.method,
            headers: {
                dataType: 'json',
                contentType: 'application/json, charset=utf-8'
            },
            body: JSON.stringify(data.data)
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {

            config.initialized = true;
            config.rootUrl = response.root || null;
            config.endpoints = response.endpoints || null;
            config.domain = response.domain || '';
            //cmSession.setDomain(domain);

        })
        .catch(function(ex) {

            config.initialized = true;
            return _.reject(response);
        });
    }
    
    return self;
}


export function getComments(configuration) {

    return (dispatch) => {
        var conf = { method: 'GET' };
        if (typeof configuration !== 'undefined') {
            Object.assign(conf, configuration);
        }

        var api = new Api(dispatch);

        return api.request('comments', conf);
    }

}