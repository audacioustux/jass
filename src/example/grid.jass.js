import * as config from './config.jass'

const styles = (...vars) => {
    return vars.length()
}

console.log(styles(['a','b','c'],[1,2],['md','sm','lg']))