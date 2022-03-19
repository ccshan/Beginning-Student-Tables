import React from "react";
import { peekKey, takeKey } from "./App";
import { RemButton } from "./RemButton";
import { Environment, Yellow } from "./global-definitions";
import { ExampleArray, Parameter, ParameterArray, isParameterNonEmpty } from "./input-definitions";
import { ValidatedInput } from "./ValidatedInput";
import { nameRE } from "./parser";

interface Props {
    params: ParameterArray
    tableNames: Array<string | Yellow | undefined>
    globalEnv: Environment
    examples: ExampleArray
    disabled: boolean

    paramsExamplesChange: (params: ParameterArray, examples: ExampleArray) => void

}
function ParametersComp(props: Props) {
    function validParam(text: (string | undefined | Yellow), modParam: ({} | Parameter)) {
        function inEnv(name: (string | undefined | Yellow), env: Environment) {
            return env.reduce((acc, variable) => {
                if (acc) {
                    return true;
                }

                return variable.name === name;

            }, false);
        }

        // These are not technically Variables, see note above
        let paramVars = props.params.filter((param) => param !== modParam).map((param) => ({ name: param.name, binding: null }));
        let tableVars = props.tableNames.map((name) => ({ name: name, binding: null }));
        let env:Environment = [...props.globalEnv, ...tableVars, ...paramVars];

        return typeof text === "string" ? nameRE.test(text) && !inEnv(text, env) : false;
    }

    function remParam(deadParam: Parameter) {
        const deadIndex = props.params.indexOf(deadParam);
        const aliveParams = props.params.filter((param) => param !== deadParam);

        // need to maintain #inputs = #params
        const modExamples = props.examples.map((example => ({
            ...example,
            inputs: example.inputs.filter((_, i) => i !== deadIndex)
        })));

        props.paramsExamplesChange(aliveParams, modExamples);
    }

    // String, Number -> Side Effect
    // changes the name of the given parameter
    // if that parameter doesn't exist yet, it makes it
    function paramChange(newParam: Parameter, modParam: ({} | Parameter)): void {
        console.log('param change called');

        let alteredParams: ParameterArray, alteredExamples: ExampleArray;
        // check if the param exists in params
        if ((isParameterNonEmpty(modParam) && props.params.indexOf(modParam) === -1) || !isParameterNonEmpty(modParam)) {
            alteredParams = [...props.params, newParam];
            alteredExamples = props.examples.map((example) => ({
                ...example,
                inputs: [...example.inputs, { prog: { raw: '', validated: { yellow: 'yellow' } }, key: takeKey() }]
            }));
        } else {
            alteredParams = props.params.map((param) => param === modParam ? newParam : param);
            alteredExamples = props.examples;
            console.log(alteredExamples, alteredParams);
        }
        return props.paramsExamplesChange(alteredParams, alteredExamples);
    }

    const reals = props.params.map((param) => (
        <th key={param.key} >
            <div className='flex_horiz'>
                <ValidatedInput
                    dummy={false}
                    placeholder='Parameter'
                    text={props.disabled ? param.name : undefined}
                    rawText={''}
                    isValid={(text: (Yellow | string)) => validParam(text, param)}
                    onValid={(text: (Yellow | string)) => paramChange({
                        ...param,
                        name: text
                    },
                        param)}
                    onEmpty={() => paramChange({
                        ...param,
                        name: { yellow: 'yellow' }
                    },
                        param)}
                />
                <RemButton
                    title='Remove this parameter'
                    onClick={props.disabled ? undefined : (() => remParam(param))}
                />
            </div>
        </th>
    ));

    const dummy = (
        <th key={peekKey()}>
            <div className='flex_horiz'>
                <ValidatedInput
                    dummy={true}
                    placeholder='Parameter'
                    text={props.disabled ? '' : undefined}
                    rawText={''}
                    isValid={(text) => validParam(text, {})}
                    onValid={(text) => paramChange({
                        name: text,
                        key: takeKey()
                    },
                        {})}
                    onEmpty={()=>null}
                />
            </div>
        </th>
    );

    return (
        <React.Fragment>
            <th>{/* empty cell to align with example RemButtons */}</th>
            <React.Fragment>
                {[...reals, dummy]}
            </React.Fragment>
        </React.Fragment>
    );
}

export { ParametersComp };