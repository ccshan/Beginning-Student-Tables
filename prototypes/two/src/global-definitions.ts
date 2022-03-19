import { NameInput, ValidatedProgInput } from "./input-definitions";
import { RBOOL_T } from "./interpreter";
import { Image } from "./image-definitions";

/*
interface Yellow {
    yellow: 'yellow' | "green" | "pink" | ""
}

enum Yellow {
    yellow = 'yellow',
    gray = 'gray',
    pink = 'pink'
}
*/

enum CellColors {
    yellow = "yellow",
    gray = "gray",
    pink = "pink"
}

type Yellow = { "yellow": "yellow"} | { "gray": "gray" } | { "pink": "pink"};

export const gray = {"gray": "gray"};
export const yellow = {"yellow": "yellow"};
export const pink = {"pink": "pink"};

enum Types {
    RVAR_T = 0,
    RAPP_T = 1,
    RFUNCT_T = 2,
    RNUM_T = 3,
    RBOOL_T = 4,
    RSTRING_T = 5,
    RLIST_T = 6,
    RSYM_T = 7,
    RIMAGE_T = 8,
    RCOLOR_T = 9,
    RIF_T = 10,
    RSTRUCT_T = 11,
    RCLOS_T = 12,

}

interface Variable {
    value: string
    type: Types.RVAR_T
}

interface Application {
    value: { funct: RFunction, args: ProgramArray },
    type: Types.RAPP_T
}

interface RFunction {
    value: Function
    type: Types.RFUNCT_T
}

interface RNum {
    value: number
    type: Types.RNUM_T
}

interface RBool {
    value: boolean
    type: Types.RBOOL_T
}

interface RList {
    value: null | { a: Program, d: RList }
    type: Types.RLIST_T
};

interface RStruct {
    value: Struct
    type: Types.RSTRUCT_T
}

interface RImage {
    value: Image
    type: Types.RIMAGE_T
}

interface Struct {
    id: string
    fields: Array<Field>
}

interface Field {
    id: string
    binding: Program
}

type Program = Variable | Application | RFunction | RNum | RBool | RList | RStruct | RImage;

type ProgramArray = Array<Program>;

interface EnvironmentVariable {
    name: NameInput
    binding: Program | null// should be Value after interp change
}

type Environment = Array<EnvironmentVariable>;

export function isRBOOL(prog: ValidatedProgInput): prog is RBool {
    return (prog as RBool).type === RBOOL_T;
}

export type { Yellow, Types, Program, ProgramArray, Variable, Environment, EnvironmentVariable, CellColors };