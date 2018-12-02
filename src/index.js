#!/usr/bin/node
import path from 'path';
import chokidar from 'chokidar';

const jassWatcher = chokidar.watch(path.join(process.cwd(), "/**/*.jass.js"), {
    ignored: /(node_modules).+/,
});
async function build(path) {
    console.log(path)
}
jassWatcher
    .on("add", path => build(path))
    .on("change", path => build(path));