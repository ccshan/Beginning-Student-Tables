import React from "react";
import { takeKey, unparse } from "../App";
import { Program, ProgramArray } from "../global-definitions";
import { Example, Input } from "../input-definitions";
import { parse } from "../parser";

interface Props {

    args: ProgramArray
    tableIdx: number

    addExample : (example: Example, tableIdx: number) => any
}

export const AddExampleButton:React.FC<Props> = ({ args, tableIdx, addExample }) => {

    /**
     * adds the examle generated from the passed args prop
     */
    const handleClick = () => {
        let rawInput:any = args.flatMap(a => [' ', ...unparse(a)]);
        // for whatever reason .join().trim() cannot be done on the same line as flatMap
        rawInput = rawInput.join("").trim();
        let newValidated:Program = parse(rawInput).prog;
        
        let input:Input = { prog: { raw: rawInput, validated: newValidated }, key: takeKey() };
        let newExample:Example = { inputs: [input], want: { raw: "", validated: { yellow: "yellow" }}, key: takeKey() };
        addExample(newExample, tableIdx);
    }


    return (
        <>
            <button onClick={() => handleClick()}>Add Input</button>
        </>
    )
}