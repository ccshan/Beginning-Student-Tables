import React from "react";
import { isRBOOL } from "./global-definitions";
import { gray, pink, yellow } from "./header";
import { isOutputNonYellow, isYellowProgramGray, Output } from "./input-definitions";

interface Props {
    parentOutput: Output

}
function DummyCell(props:Props) {
    // i am pretty sure this is the intended thing that is supposed to happen
    if ((!isOutputNonYellow(props.parentOutput) && isYellowProgramGray(props.parentOutput)) || (isOutputNonYellow(props.parentOutput) && isRBOOL(props.parentOutput.validated) && props.parentOutput.validated.value === false)) {
        return (
            <td className={'gray'}>
            </td>
        );
    } else if (props.parentOutput === pink || (isOutputNonYellow(props.parentOutput) && !isRBOOL(props.parentOutput.validated))) {
        return (
            <td className={'pink'}>
            </td>
        );
    } else {
        return <td></td>;
    }
}

export { DummyCell };