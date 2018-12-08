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
        [Symbol()]: {
            _important: true,
            red: {
                color: 'red'
            }
        },
        [Symbol()]: {
            _important: false,
            blue: {
                color: 'blue'
            },
            red: {
                color: 'red'
            }
        },
        _global: false,
        button: {
            [Symbol()]: {
                _s: ' ',
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
            },
            _s: '+',
            green: {
                color: 'green',
                size: [10,20]
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
        }
    })
}

const moreStyle = {
    [Symbol()]: {
        display: 'fle'
    }
}

export default [styles(), [moreStyle, {postfix: '_morestyle'}]];
// export default styles();