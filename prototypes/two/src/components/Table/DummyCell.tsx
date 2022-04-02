import React from "react";
import { isRBOOL } from "../../global-definitions";
import { gray, pink, yellow } from "../../header";
import { isOutputNonYellow, isYellowProgramGray, Output } from "../../input-definitions";

interface Props {
    parentOutput: Output

}
function DummyCell(props:Props) {
    if ((!isOutputNonYellow(props.parentOutput) && isYellowProgramGray(props.parentOutput)) || (isOutputNonYellow(props.parentOutput) && isRBOOL(props.parentOutput) && props.parentOutput.value === false)) {
        return (
            <td className={'gray'}>
            </td>
        );
    } else if (props.parentOutput === pink || (isOutputNonYellow(props.parentOutput) && !isRBOOL(props.parentOutput))) {
        return (
            <td className={'pink'}>
            </td>
        );
    } else {
        return <td></td>;
    }
}

export { DummyCell };