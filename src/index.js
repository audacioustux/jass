#!/usr/bin/node
import path from 'path';
import chokidar from 'chokidar';
import async from 'async';
import _ from 'lodash';

const jassWatcher = chokidar.watch(path.join(process.cwd(), "/**/[!_.]*.jass.js"), {
    ignored: /(node_modules).+/,
});

const defaultOptions = {
    global: false,
    strict: true
}

function isDicklike(object){
    return (typeof object === 'object') && (object !== null)
}

function collectOptions(object){
    const _childOptions = {...object['_options']};
    delete object['_options'];
    const _thisBlockOptions = {...object['__options']};
    delete object['__options'];
    // TODO: warn if value of '_options' not an [object Object]
    const keys = Object.keys(object);
    async.forEach(keys, key =>{
        // TODO: warn if options aren't decleared first in 'strict' mode
        if(key[0] == '_'){
            // TODO: warn about wrong option key
            // TODO: warn if option decleared more than once in same block
            if(key[1] == '_'){
                _thisBlockOptions[key.substring(2)] = object[key]; 
            } else {
                _childOptions[key.substring(1)] = object[key];
            }
            delete object[key];
        }
    })
    return [_childOptions, _thisBlockOptions];
}

function jassTraverse(object, options){
    if(Array.isArray(object)){
        object.forEach(value => {
            jassTraverse(value, options);
        })
    } else if (isDicklike(object)){
        const _options = collectOptions(object);
        const thisBlockOptions = Object.assign({}, options, _options[1]);
        // console.log(thisBlockOptions);
        const keys = [...Object.keys(object),...Object.getOwnPropertySymbols(object)];
        keys.forEach(key => {
            const childOptions = Object.assign({}, options, _options[0]);
            jassTraverse(object[key], childOptions);
            
            if(isDicklike(object[key]) && !Array.isArray(object[key])){
                if(typeof key !== "symbol"){
                    console.log("class: " + key);
                }
            } else {
                if(_.kebabCase(key) != key){
                    Object.defineProperty(object, _.kebabCase(key), Object.getOwnPropertyDescriptor(object, key));
                    delete object[key];
                }
                console.log("property: " + key)
            }
        })
    } else {
        console.log('value: ' + object);
    }
}

async function build(path) {
    const jassImport = await import(path);
    const jassObject = jassImport.default;
    if((typeof jassObject === 'object') && 
    // !(Array.isArray(jassObject)) && 
    (jassObject !== null)){
        // const rootOptions = Object.assign({}, defaultOptions, collectOptions(jassObject)[0]);
        // TODO: warn if `this` block options exist... No use of them in root level
        // const store = {
        //     // index 0: forChild options, 
        //     // index 1: `this` block
        //     optionsStack: [
        //         [defaultOptions, {}],
        //         // [rootOptions]
        //     ]
        // }
        // NOTE: concurrency issue with store
        if(Array.isArray(jassObject)){
            jassObject.forEach(value => {
                if(Array.isArray(value)){
                    if(isDicklike(value[0])){
                        jassTraverse(value[0], defaultOptions);
                        // TODO: use value[1] settings to save generated css
                    } else {
                        console.log("<wrong export format>")
                    }
                } else if (isDicklike(value)){
                    jassTraverse(value, defaultOptions);
                } else {
                    console.log("<wrong export format>")
                }
            });
        } else {
            // const keys = [...Object.keys(jassObject),...Object.getOwnPropertySymbols(jassObject)]
            // async.forEach(keys, key => {
                jassTraverse(jassObject, defaultOptions);
            // })
        }
        console.log(jassObject);
    } else {
        console.log("<export error> Couldn\'t parse: " + path);
    }
}

jassWatcher
    .on("add", path => build(path))
    .on("change", path => build(path));
