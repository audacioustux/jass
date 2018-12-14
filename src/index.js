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

function jassTraverse(object, options, keyStack){
    if(Array.isArray(object)){
        return object.map(value => {
            return jassTraverse(value, options, keyStack);
        })
    } else if (isDicklike(object)){
        const _options = collectOptions(object);
        const thisBlockOptions = Object.assign({}, options, _options[1]);
        const keys = [...Object.keys(object), ...Object.getOwnPropertySymbols(object)];
        return Object.assign({}, ...keys.map(key => {
            if(isDicklike(object[key]) && !Array.isArray(object[key])){
                const childOptions = Object.assign({}, options, _options[0]);
                keyStack.push(key);
                console.log(keyStack)
                const childTraversed = jassTraverse(object[key], childOptions, keyStack);
                const _key = keyStack.pop().toString();
                
                return {[_key]: childTraversed}
            } else {
                const childOptions = Object.assign({}, options, _options[0]);
                const childTraversed = jassTraverse(object[key], childOptions, keyStack);
                // if(_.kebabCase(key) != key){
                //     Object.defineProperty(object, _.kebabCase(key), Object.getOwnPropertyDescriptor(object, key));
                //     delete object[key];
                // }
                return {[_.kebabCase(key)]: childTraversed}
            }
        }))
    } else {
        return object;
    }
}

async function build(path) {
    const jassImport = await import(path);
    const jassObject = jassImport.default;
    if((typeof jassObject === 'object') && (jassObject !== null)){
        if(Array.isArray(jassObject)){
            jassObject.forEach(value => {
                if(Array.isArray(value)){
                    if(isDicklike(value[0])){
                        jassTraverse(value[0], defaultOptions, []);
                        // TODO: use value[1] settings to save generated css
                    } else {
                        console.log("<wrong export format>")
                    }
                } else if (isDicklike(value)){
                    console.log(jassTraverse(value, defaultOptions, []))
                    // jassTraverse(value, defaultOptions, [])
                } else {
                    console.log("<wrong export format>")
                }
            });
        } else {
            jassTraverse(jassObject, defaultOptions, []);
        }
    } else {
        console.log("<export error> Couldn\'t parse: " + path);
    }
}

jassWatcher
    .on("add", path => build(path))
    .on("change", path => build(path));
