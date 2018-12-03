import * as config from './_config.jass'

function media(query){
    return 'sds'
}
const styles = (...vars) => {
    return ({
        _option: {
            global: true,
            unit: 'px'
        },
        button: {
            width: 20,
            height: 10,
            red: {
                __s: '>',
                color: 'red',
                hover: {
                    color: 000000
                }
            },
            _s: ' ',
            green: {
                color: 'green'
            }
        },
        [/regex/]: {
            [media({minWidth: 1366})]: {
                col6: {
                    display: 'flex'
                }
            }
        }
    })
}

export default styles;