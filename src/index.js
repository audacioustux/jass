import * as config from './example/config.jass';
import {cartesianProductOf} from './utils/cartesianProduct'

const c = [2,3];
const [a,b] = c;
console.log(a);
// const a = (template, data) => {
//     console.log(cartesianProductOf(...Object.values(data)));
// }

// a('col#{viewport}#{width}', {viewport: Object.keys(config.breakPointsMap), width: Object.keys(config.widths)})