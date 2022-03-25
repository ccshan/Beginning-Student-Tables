import React from "react";
import { takeKey, peekKey, unparse_to_string } from './App';
import { RemButton } from "./RemButton";
import { DepictFormula } from "./DepictFormula";
import { Environment, Yellow } from "./global-definitions";
import { FormulaArray, Formula, ParameterArray, ExampleArray, isBooleanFormula } from "./input-definitions";
import { parseCheck } from "./interpreter";
import { ParametersComp } from "./ParametersComp";
import { ValidatedArea } from './ValidatedArea'

function isNonEmptyFormula(formula: (Formula | {})): formula is Formula {
    return (formula as Formula).key !== undefined;
}

interface Props {
    formulas: FormulaArray
    params: ParameterArray
    globalEnv: Environment
    examples: ExampleArray
    tableNames: Array<string | Yellow | undefined>
    disabled: boolean

    paramsExamplesChange: (params: ParameterArray, examples: ExampleArray) => void
    formulasChange: (formuals: FormulaArray) => void

}
function SuccinctHead(props: Props) {
    // String -> Boolean
    // checks if the given string is a valid program
    function validProg(text: (string | Yellow | undefined)) {
        let isgood = true;

        try {
            parseCheck(text);
        } catch (e) {
            if (e instanceof SyntaxError) {
                isgood = false;
            } else { // this should never happen
                throw e;
            }
        }

        return isgood;
    }

    // Formula -> Side Effect
    // removes a given formula from the tree
    function remFormula(deadForm: Formula) {
        const aliveForms: FormulaArray = props.formulas.filter((formula) => formula !== deadForm);
        props.formulasChange(aliveForms);
    }

    // Formula -> Formula -> Side Effect
    // replaces one formula with another one
    function formulaChange(newForm: Formula, oldForm: ({} | Formula)) {

        // exists = oldTab == {} ? false : props.tables.indexOf(oldTab) === -1;
        let alteredForms:FormulaArray;
        if ((isNonEmptyFormula(oldForm) && props.formulas.indexOf(oldForm) === -1) || !isNonEmptyFormula(oldForm)) {
            alteredForms = [...props.formulas, newForm];
        } else {
            alteredForms = props.formulas.map((form) => form === oldForm ? newForm : form);
        }
        props.formulasChange(alteredForms);
    }

    
    // if the the formula is valid, pass formula up with the string's parsed validated value,
    // else, pass the formula up with the previous validated value
    // this ensures that the rawString will be passed back down, while handling erros
    function validFormulaChange(newFormula: Formula, oldFormula: ( {} | Formula), newFormulaString: string) {
        try {
            formulaChange({
                ...newFormula,
                prog: {raw: newFormulaString, validated: parseCheck(newFormulaString)}
            },
                oldFormula)
        } catch (e) {
            formulaChange({
                ...newFormula,
                prog: {raw: newFormulaString, validated: newFormula.prog.validated}
            },
                oldFormula)
        }
    }
    

    // Formula -> Number -> Number
    // gives the maximum depth of a Formula, second parameter is an accumulator
    function maxDepth(formula: Formula, curMax: number): number {
        if (isBooleanFormula(formula)) {
            return formula.thenChildren.reduce((acc, child) => Math.max(acc, maxDepth(child, curMax + 1)), curMax + 1);
        } else {
            return curMax;
        }
    }

    function countWidth(formula: Formula): number {
        if (!isBooleanFormula(formula)) {
            return 1;
        } else {
            return formula.thenChildren.reduce((acc, child) => acc + countWidth(child), 2);
        }
    }

    // Number -> [Number]
    // takes a number, returns an array that counts from 1 to that number, input of 0 gives empty array
    // e.g. countUp(5) -> [1, 2, 3, 4, 5]
    function countUp(num: number): Array<number> {
        // special case: want an empty array for 0
        if (num === 0) {
            return [];
        } else if (num === 1)
            return [1];
        else
            return [...countUp(num - 1), num];
    }

    const abyss = props.formulas.reduce((acc, formula) => Math.max(acc, maxDepth(formula, 0)), 0);
    const numParams = props.params.length;

    // the text property can be removed later on in this
    const reals = props.formulas.map((formula) => (
        <th key={formula.key} colSpan={countWidth(formula)} >
            <div className='flex_horiz'>
                <ValidatedArea
                    placeholder={'Formula'}
                    dummy={false}
                    text={props.disabled ? unparse_to_string(formula.prog.validated) : undefined}
                    rawText={formula.prog.raw}
                    disabled={props.disabled}
                    isValid={validProg}
                    onValid={(text) => validFormulaChange(formula, formula, text)}
                    onEmpty={() => formulaChange({
                        ...formula,
                        prog: { raw: '', validated: { yellow: 'yellow' } }
                    },
                        formula)}
                />
                <RemButton
                    title={'Remove this formula'}
                    onClick={props.disabled ? undefined : (() => remFormula(formula))}
                />
            </div>
        </th>
    ));

    const dummy = (
        <th key={peekKey()} colSpan={1}>
            <div className='flex_horiz'>
                <ValidatedArea
                    dummy={true}
                    placeholder='Formula'
                    text={props.disabled ? '' : undefined}
                    rawText=''
                    disabled={props.disabled}
                    isValid={validProg}
                    onValid={(text) => validFormulaChange({
                        prog: { raw: text, validated: { yellow: 'yellow' }},
                        outputs: props.examples.map((_) => ({ raw: '', validated: { yellow: 'yellow'} })),
                                                key: takeKey()
                                            },
                                            { }, text)}
                onEmpty={()=>null}
                />
            </div>
        </th>
    );

    const children = countUp(abyss).map((depth) => (
        <tr key={depth}>
            <th colSpan={numParams + 2}>{/* empty cell to align with example RemButton and Parameters */}</th>
            {props.formulas.map((formula) => (
                <DepictFormula
                    disabled={props.disabled}
                    key={formula.key}
                    formula={formula}
                    depth={depth}
                    numExamples={props.examples.length}
                    formulaChange={(newForm: Formula) => formulaChange(newForm, formula)}
                />
            ))}
            {Array(depth).map((_, i) => (<th key={i}>{/* empty cell under some parent dummy formula */}</th>))}
            <th>{/* empty cell above wants */}</th>
        </tr>
    ));

    return (
        <thead>
            <tr>
                <ParametersComp
                    disabled={props.disabled}
                    globalEnv={props.globalEnv}
                    params={props.params}
                    examples={props.examples}
                    tableNames={props.tableNames}
                    paramsExamplesChange={props.paramsExamplesChange}
                />
                {/* top level formulas */}
                {[...reals, dummy, <th key={peekKey(1)}>{/* empty cell above wants */}</th>]}
            </tr>
            {/* rest of formulas */}
            {children}
        </thead>
    );
}

export { SuccinctHead }