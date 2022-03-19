import React from "react";
import { takeKey, unparse_to_string } from "./App";
import { ErrorMessage } from "./ErrorMessage";
import { Environment, Program, Yellow } from "./global-definitions";
//import { yellow } from "./header";
import { Input, InputArray, isValidatedProgInputNonYellow, ProgramInput } from "./input-definitions";
import { interp, parseCheck } from "./interpreter";
import { ValidatedArea } from "./ValidatedArea";

// const yellow = {raw: '', validated: {yellow: 'yellow'}};
interface Props {
    disabled : boolean
    globalEnv : Environment
    dummy: boolean
    inputs: InputArray

    inputsChange: (inputs: InputArray) => void
}

function Inputs(props:Props) {
    function validProg(text:(string | undefined | Yellow)) {
        try {
            parseCheck(text);
        } catch (e) {
            return false;
        }
        return true;
    }

    function inputChange(newInput:Input, oldInput:Input) {
        let alteredInputs:InputArray;
        if (props.dummy) {
            alteredInputs = props.inputs.map((input) => input === oldInput ? { ...newInput, key: takeKey() } : { prog: {raw: '', validated: {yellow: "yellow"}}, key: takeKey() });
            console.log('inputs change, altered input: ', alteredInputs);
        } else {
            alteredInputs = props.inputs.map((input) => input === oldInput ? newInput : input);
        }
        props.inputsChange(alteredInputs);
    }

    // this looks awful...
    let inputFields = props.inputs.map((input, i) => {
        let error = <div />;
        if (props.dummy) {
            return (
                <td key={input.key} >
                    <div className='flex_vert'>
                        <div className='flex_horiz'>
                            <ValidatedArea
                                dummy={props.dummy}
                                placeholder={'Input'}
                                text={props.disabled ? '' : undefined}
                                rawText=''
                                isValid={validProg}
                                onValid={(text:(string)) => inputChange({ prog: {raw: text, validated: (parseCheck(text) as Program)}, key: takeKey()},
                                    input)}
                                onEmpty={()=>null}
                            />
                        </div>
                        {error}
                    </div>
                </td>
            );

        } else {
            if (isValidatedProgInputNonYellow(input.prog.validated)) {
                try {
                    interp(input.prog.validated, props.globalEnv);
                } catch (e) {
                    error = <ErrorMessage error={e as any} />
                }
            }

            return (
                <td key={input.key} >
                    <div className='flex_vert'>
                        <div className='flex_horiz'>
                            <ValidatedArea
                                dummy={props.dummy}
                                placeholder={'Input'}
                                text={props.disabled ? unparse_to_string(input.prog.validated) : undefined}
                                isValid={validProg}
                                onValid={(text:(string)) => inputChange({
                                    ...input,
                                    prog: {raw: text, validated: parseCheck(text)}
                                },
                                    input)}
                                onEmpty={() => inputChange({
                                    ...input,
                                    prog: {raw:"", validated:{yellow:"yellow"}}
                                },
                                    input)}
                                rawText={input.prog.raw}
                            />
                        </div>
                        {error}
                    </div>
                </td>
            );

        }
    });

    return (
        <React.Fragment>
            {inputFields}
        </React.Fragment>
    );
}

export { Inputs };