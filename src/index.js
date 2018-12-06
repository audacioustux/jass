#!/usr/bin/node
import path from 'path';
import chokidar from 'chokidar';
import async from 'async';
import _ from 'lodash';

const jassWatcher = chokidar.watch(path.join(process.cwd(), "/**/[!_.]*.jass.js"), {
    ignored: /(node_modules).+/,
});

// function jassTraverse(object, options){
//     if (isArray(object)) {
//         console.log(object);
//     } else if ((typeof object === 'object') && (object !== null)) {
//         jassTraverse(object);
//     } else {
//         console.log(object);
//     }
// }

const defaultOptions = {
    global: false,
    strict: true
}

function collectOptions(object){
    const _childOptions = object['_options'];
    delete object['_options'];
    const _thisBlockOptions = object['__options'];
    delete object['__options'];
    // TODO: warn if value of '_options' not an [object Object]
    const keys = Object.keys(object);
    async.forEach(keys, key =>{
        if(key[0] == '_'){
            // TODO: warn about wrong option key
            if(key[1] == '_'){
                _thisBlockOptions[key.substring(2)] = object[key]; 
            } else {
                _childOptions[key.substring(1)] = object[key];
            }
            // TODO: delete option keys
        }
    })
    return [_childOptions, _thisBlockOptions];
}

// function jassTraverse(object, store){
    
// }

async function build(path) {
    const jassImport = await import(path);
    const jassObject = jassImport.default();
    if((typeof jassObject === 'object') && 
    !(Array.isArray(jassObject)) && 
    (jassObject !== null)){
        const rootOptions = Object.assign({}, defaultOptions, collectOptions(jassObject)[0]);
        // TODO: warn if `this` block options exist... No use of them in root level
        const store = {
            // index 0: forChild options, 
            // index 1: `this` block
            optionsStack: [
                [defaultOptions],
                [rootOptions]
            ]
        }
        async.forEach(Object.keys(jassObject), key => {
            // jassTraverse(jassObject[key], store);
        })
        console.log(store);
    } else {
        console.log("<export error> Couldn\'t parse: " + path);
    }
}

jassWatcher
    .on("add", path => build(path))
    .on("change", path => build(path));
