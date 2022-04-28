import React from "react";
import { takeKey, unparse } from "../App";
import { ProgramArray } from "../global-definitions";
import { Example, InputArray } from "../input-definitions";

interface Props {

    args: ProgramArray
    tableIdx: number

    addExample : (example: Example, tableIdx: number) => any
}

export const AddExampleButton:React.FC<Props> = ({ args, tableIdx, addExample }) => {

    /**
     * Handles the button click to add an example
     * Generates a new Example from the args prop and calls addExample to add the new Example to the table
     */
    const handleClick = () => {
        let newInputs:InputArray = [];
        for (let i = 0; i < args.length; i++) {

            // generates the raw text from args
            let newRaw:string = "";
            newRaw = unparse(args[i]).reduce((prevElem:string, currElem:string) => {
                console.log(prevElem, currElem);
                return prevElem + " " + currElem.toString().trim();
            });
            
            newInputs = [...newInputs, {prog: {raw: newRaw.toString(), validated: args[i]}, key: takeKey() }];
        }

        let newExample:Example = { inputs: newInputs, want: { raw: "", validated: { yellow: "yellow" }}, key: takeKey() };
        addExample(newExample, tableIdx);
    }


    return (
        <>
            <button onClick={() => handleClick()}>Add Example</button>
        </>
    )
}