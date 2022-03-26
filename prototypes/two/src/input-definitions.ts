import type { Yellow, Program } from './global-definitions';

interface Table {
    name: NameInput
    examples: ExampleArray
    formulas: FormulaArray
    params: ParameterArray
    purpose: string | Yellow | undefined
    signature: string | Yellow | undefined
    key: number
}
type ParameterArray = Array<Parameter>;

interface Parameter {
    name: NameInput
    key: number
}

type NameInput = string | Yellow | undefined ;

type ExampleArray = Array<Example>;

interface Example {
    inputs: InputArray
    want: ProgramInput
    key: number
}

type InputArray = Array<Input>;

interface Input {
    prog: ProgramInput
    key: number
}

interface ProgramInput {
    raw: string
    validated: ValidatedProgInput
    // add boolean whether raw is actually validated
}

interface BooleanFormula {
    prog: ProgramInput
    outputs: OutputArray
    thenChildren: FormulaArray
    key: number
}

interface NonBooleanFormula {
    prog: ProgramInput
    outputs: OutputArray
    key: number
}

type Formula = BooleanFormula | NonBooleanFormula

type Output = Program | Yellow;

type OutputArray = Array<Output>;

type FormulaArray = Array<Formula>;

type ValidatedProgInput = Yellow | Program;

interface CheckExpect {
    name: string
    inputs: Array<ProgramInput>
    want: {raw: string, validated: Program }
}

interface DefStruct {
    superID: string
    filedIDs: Array<string>
    type: 'struct'
}

interface Define {
    name: string
    binding: Program
    type: 'define'
}

// add type for err msg

type PrefixExpression = CheckExpect | DefStruct | Define;

/// Type Guards
export function isTableNonEmpty(table: ({} | Table)): table is Table {
    return (table as Table).key !== undefined;
}
export function isBooleanFormula(formula: Formula): formula is BooleanFormula {
    return (formula as BooleanFormula).thenChildren !== undefined;
}

export function isParameterNonEmpty(param: ({} | Parameter)): param is Parameter {
    return (param as Parameter).key !== undefined;
}

// I am deepy ashamed of this function naming :(
export function isValidatedProgInputNonYellow(progInput: ValidatedProgInput) : progInput is Program {
    return (progInput as Program) === undefined || (progInput as Program).type !== undefined;
}

export function isTableNameYellow(tableName: NameInput): tableName is Yellow {
    return (tableName as string).length === undefined;
}

export function isParamNonYellow(param: Parameter): param is Parameter {
    return (param.name as string).length !== undefined;
}

export function isExampleNonEmpty(example: ({} | Example)) : example is Example {
    return (example as Example).key !== undefined;
}

export function isFormulaNonEmpty(formula: ({} | Formula)) : formula is Formula {
    return (formula as Formula).key !== undefined;
}

export function isOutputNonYellow(output: Output) : output is Program {
    return (output as Program).type !== undefined;
}

export function isYellowProgramGray(prog: Yellow):boolean {
    return "gray" in prog;
}

export type { Input, InputArray, Yellow, ProgramInput, ValidatedProgInput, 
    Table, BooleanFormula, NonBooleanFormula, Formula, FormulaArray,
    Parameter, ParameterArray, Example, ExampleArray, NameInput, PrefixExpression, CheckExpect, Output, OutputArray};