import React from "react";
import { takeKey } from "./App";
import { ErrorMessage } from "./ErrorMessage";
import { Environment, Program, Yellow } from "./global-definitions";
import { Input, InputArray, isValidatedProgInputNonYellow } from "./input-definitions";
import { interp, parseCheck } from "./interpreter";
import { ValidatedArea } from "./ValidatedArea";

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
        } else {
            alteredInputs = props.inputs.map((input) => input === oldInput ? newInput : input);
        }
        props.inputsChange(alteredInputs);
    }

    function validInputChange(newInput: Input, oldInput: Input, newRawInputString: string) {
        try {
            inputChange({...newInput, 
                prog: { raw: newRawInputString, validated: parseCheck(newRawInputString) } 
            }, 
                oldInput);
        } catch (e) {
            inputChange({...newInput, 
                prog: { raw: newRawInputString, validated: newInput.prog.validated } 
            }, 
            oldInput);
        }
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
                                disabled={props.disabled}
                                isValid={validProg}
                                onValid={(text:string) => validInputChange({ prog: { raw: text, validated: { yellow: "yellow" } }, key: takeKey() }, input, text)}
                                
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
                                text={props.disabled ? input.prog.raw : undefined}
                                isValid={validProg}
                                onValid={(text:string) => validInputChange(input, input, text)}
                                onEmpty={() => inputChange({
                                    ...input,
                                    prog: {raw:"", validated:{yellow:"yellow"}}
                                },
                                    input)}
                                rawText={input.prog.raw}
                                disabled={props.disabled}
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