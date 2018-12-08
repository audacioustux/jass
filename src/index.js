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

function jassTraverse(object, store){
    if(Array.isArray(object)){
        object.forEach(value => {
            jassTraverse(value, store);
        })
    } else if (isDicklike(object)){
        console.log('*');
        console.log(store.optionsStack)
        const _options = collectOptions(object);
        store.optionsStack.push(_options);
        const keys = [...Object.keys(object),...Object.getOwnPropertySymbols(object)];
        keys.forEach(key => {
            jassTraverse(object[key], store);
        })
        store.optionsStack.pop();
    } else {
        
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
        const store = {
            // index 0: forChild options, 
            // index 1: `this` block
            optionsStack: [
                [defaultOptions, {}],
                // [rootOptions]
            ]
        }
        if(Array.isArray(jassObject)){
            jassObject.forEach(value => {
                if(Array.isArray(value)){
                    if(isDicklike(value[0])){
                        jassTraverse(value[0], store);
                        // TODO: use value[1] settings to save generated css
                    } else {
                        console.log("<wrong export format>")
                    }
                } else if (isDicklike(value)){
                    jassTraverse(value, store);
                } else {
                    console.log("<wrong export format>")
                }
            });
        } else {
            // const keys = [...Object.keys(jassObject),...Object.getOwnPropertySymbols(jassObject)]
            // async.forEach(keys, key => {
                jassTraverse(jassObject, store);
            // })
        }
    } else {
        console.log("<export error> Couldn\'t parse: " + path);
    }
}

jassWatcher
    .on("add", path => build(path))
    .on("change", path => build(path));
