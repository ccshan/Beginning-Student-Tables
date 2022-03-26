import { isRBOOL, Yellow } from './global-definitions';
import { isOutputNonYellow, isYellowProgramGray, OutputArray } from './input-definitions';

/************
    Colors
************/


// value to put in child formulas that don't have an output for that row
export const gray:Yellow = {gray: 'gray'};
// value to put in child formulas that have an error output for that row (non-boolean and non-gray)
export const pink:Yellow = {pink: 'pink'};
// value that indicates an uninitialized input
export const yellow:Yellow = {yellow: 'yellow'};

/*********************
   Functions I Want
*********************/
// [Program] -> Boolean
// returns true if progs has at least one member and all of its members are boooleans
//    otherwise returns false
export function allBools(outputs:OutputArray){
    if (outputs.length === 0 || outputs.every((output) => !isOutputNonYellow(output) && isYellowProgramGray(output))) {
        return false;
    }

    return outputs.every((output) =>  (!isOutputNonYellow(output) && isYellowProgramGray(output)) || (isOutputNonYellow(output) && isRBOOL(output)));
}
