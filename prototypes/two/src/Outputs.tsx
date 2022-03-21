import React from "react";
import { DummyCell } from "./DummyCell";
import { Environment } from "./global-definitions";
import { Formula, FormulaArray, isBooleanFormula, ProgramInput } from "./input-definitions";
import { TestCell } from "./TestCell";

interface Props {
    formulas: FormulaArray
    dummy?: boolean
    globalEnv: Environment
    want: ProgramInput
    row: number


}

function Outputs(props:Props) {
    function countWidth(formula:Formula):number {
        if (!isBooleanFormula(formula)) {
            return 1;
        } else {
            return formula.thenChildren.reduce((acc, child) => acc + countWidth(child), 2);
        }
    }
    if (props.dummy) {
        return (
            <React.Fragment>
                {props.formulas.map((formula:Formula) => (
                    <td key={formula.key} colSpan={countWidth(formula)}>{/* empty cell */}</td>
                ))}
            </React.Fragment>
        );
    } else {
        return (
            <React.Fragment>
                {props.formulas.map((formula:Formula) => (
                    <React.Fragment key={formula.key}>
                        <TestCell
                            globalEnv={props.globalEnv}
                            output={formula.outputs[props.row]}
                            want={props.want}
                        />
                        {isBooleanFormula(formula) ?
                            <React.Fragment>
                                <Outputs
                                    globalEnv={props.globalEnv}
                                    formulas={formula.thenChildren}
                                    want={props.want}
                                    row={props.row}
                                />
                                <DummyCell
                                    parentOutput={formula.outputs[props.row]}
                                />
                            </React.Fragment>
                            : <script />}
                    </React.Fragment>
                ))}
            </React.Fragment>
        );
    }
}

export {Outputs};