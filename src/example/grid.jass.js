import * as config from './_config.jass'

function media(query){
    return 'sds'
}
const styles = (...vars) => {
    return ({
        _options: {
            global: true,
            unit: 'px',
            childSelector: ' '
        },
        _global: false,
        button: {
            width: 20,
            height: 10,
            red: {
                __s: '>',
                color: 'red',
                black: {
                    bg: 1
                },
                hover: {
                    color: 0
                }
            },
            _s: '+',
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
        },
        col6: {
            display: 'flex'
        },
        col7: {
            display: 'flex'
        },
        col9: {
            display: 'flex'
        },
        col11: {
            display: 'flex'
        }
    })
}

export default styles;