import Octicon, { Check } from "@primer/octicons-react";
import React from "react";
import { deepEquals, unparse } from "../../App";
import { ErrorMessage } from "../ErrorMessage";
import { Environment, Program } from "../../global-definitions";
import { yellow } from "../../header";
import { height, width } from "../../image";
import { isOutputNonYellow, isValidatedProgInputNonYellow, isYellowProgramGray, Output, ProgramInput } from "../../input-definitions";
import { interp, RIMAGE_T } from "../../interpreter";

interface Props {
    globalEnv : Environment
    output: Output
    want: ProgramInput
    
}

interface State {
    isOpen: boolean
}
class TestCell extends React.Component<Props, State> {
    /* have unparse(image) be a full size render, maybe by storing full size render in state? */
    constructor(props:Props) {
        super(props);
        this.handleViewClick = this.handleViewClick.bind(this);
        this.isZoomable = this.isZoomable.bind(this);
        this.state = {
            isOpen: false,
        }
    }
    // paint could be called with an extra param that specifies what type of render should be returned

    // Output ->
    handleViewClick(prog:Output) {
        // check if program returns an image
        if (!isOutputNonYellow(prog)) return false;
        if (this.isZoomable(prog)) {
            this.setState(
                { isOpen: !this.state.isOpen }
            );
        }
    }

    // Output -> Boolean
    // determines whether the image should be zoomable
    isZoomable(prog:Program) {
        if (isOutputNonYellow(prog)) {
            // maybe export Types not as type so we can have Types.RIMAGE_T
            return prog.type === RIMAGE_T ? (width(prog.value) > 250 || height(prog.value) > 250) : false;
        }
        return false;
    }

    componentDidUpdate(prevProps:Props) {
        if (prevProps.output !== this.props.output) {
            this.setState({
                isOpen: false
            });
        }
    }

    render() {
        let output = this.props.output;

        if (!isOutputNonYellow(output) && isYellowProgramGray(output)) {
            return (
                <td className={'gray'}>
                </td>
            );
        }

        if (!isOutputNonYellow(output) && "pink" in output) {
            return (
                <td className={'pink'}>
                </td>
            );
        }

        if (!isOutputNonYellow(output) && "yellow" in output) {
            return (
                <td className={'yellow'}>
                </td>
            );
        }

        if (output instanceof Error) {
            return <td><ErrorMessage error={output} /></td>
        }

        let want:ProgramInput;
        try {
            want = {raw: this.props.want.raw, validated: interp(this.props.want.validated, this.props.globalEnv)};
        } catch (e) {
            want = {raw: '', validated: yellow};
        }

        if (isValidatedProgInputNonYellow(want.validated) && isOutputNonYellow(output) && deepEquals(output, want.validated)) {
            return (
                <td className='output' onClick={() => this.handleViewClick(output)}>
                    {unparse(output, true)}
                    <div title={"Yay! It's right!"} className="check">
                        <Octicon
                            icon={Check} size="small" verticalAlign="middle" 
                            ariaLabel='Yay!' />
                    </div>
                    {this.state.isOpen && (
                        <dialog
                            style={{ position: "absolute" }}
                            open
                            onClick={() => this.handleViewClick(output)}
                        >
                            {unparse(output)}
                        </dialog>
                    )}
                </td>
            )
        } else if (isOutputNonYellow(output) && isValidatedProgInputNonYellow(output)){
            return (
                <td className='output' onClick={() => this.handleViewClick(output)}>
                    {this.state.isOpen && (
                        <dialog
                            style={{ position: "absolute" }}
                            open
                            onClick={() => this.handleViewClick(output)}
                        >
                            {unparse(output)}
                        </dialog>
                    )}
                    {unparse(output, true)}
                </td>
            );
        }
    }
}

export { TestCell };