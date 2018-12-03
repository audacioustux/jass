#!/usr/bin/node
import path from 'path';
import chokidar from 'chokidar';

const jassWatcher = chokidar.watch(path.join(process.cwd(), "/**/[!_.]*.jass.js"), {
    ignored: /(node_modules).+/,
});

function jassTraverse(object){
    if (isArray(object)) {
        console.log(object);
    } else if ((typeof object === 'object') && (object !== null)) {
        jassTraverse(object);
    } else {
        console.log(object);
    }
}

async function build(path) {
    const jassImport = await import(path);
    const jassObject = jassImport.default();

    if((typeof jassObject === 'object') && 
    !(Array.isArray(jassObject)) && 
    (jassObject !== null)){
        
    } else {
        console.log("<export error> Couldn\'t parse: " + path);
    }
}

jassWatcher
    .on("add", path => build(path))
    .on("change", path => build(path));
