import Octicon, { Check } from "@primer/octicons-react";
import React from "react";
import { deepEquals, unparse } from "./App";
import { ErrorMessage } from "./ErrorMessage";
import { Environment } from "./global-definitions";
import { yellow } from "./header";
import { height, width } from "./image";
import { isOutputNonYellow, isValidatedProgInputNonYellow, isYellowProgramGray, Output, ProgramInput } from "./input-definitions";
import { interp, RIMAGE_T } from "./interpreter";

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

    // Program ->
    handleViewClick(prog:Output) {
        // check if program returns an image
        if (!isOutputNonYellow(prog)) return false;
        if (this.isZoomable(prog)) {
            this.setState(
                { isOpen: !this.state.isOpen }
            );
        }
    }

    // Program -> Boolean
    // determines whether the image should be zoomable
    isZoomable(prog:ProgramInput) {
        if (isValidatedProgInputNonYellow(prog.validated)) {
            // maybe export Types not as type so we can have Types.RIMAGE_T
            return prog.validated.type === RIMAGE_T ? (width(prog.validated.value) > 250 || height(prog.validated.value) > 250) : false;
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

        // these likely don't work because it is comparing two objects and junk w that happen :p
        // may work now^^
        if (!isOutputNonYellow(output) && "pink" in output) {
            return (
                <td className={'pink'}>
                </td>
            );
        }

        if ((!isOutputNonYellow(output) && "yellow" in output) || (isOutputNonYellow(output) && output.raw === "")) {
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

        if (isValidatedProgInputNonYellow(want.validated) && isOutputNonYellow(output) && isValidatedProgInputNonYellow(output.validated) && deepEquals(output.validated, want.validated)) {
            return (
                <td className='output' onClick={() => this.handleViewClick(output)}>
                    {unparse(output.validated, true)}
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
                            {unparse(output.validated)}
                        </dialog>
                    )}
                </td>
            )
        } else if (isOutputNonYellow(output) && isValidatedProgInputNonYellow(output.validated)){
            return (
                <td className='output' onClick={() => this.handleViewClick(output)}>
                    {this.state.isOpen && (
                        <dialog
                            style={{ position: "absolute" }}
                            open
                            onClick={() => this.handleViewClick(output)}
                        >
                            {unparse(output.validated)}
                        </dialog>
                    )}
                    {unparse(output.validated, true)}
                </td>
            );
        }
    }
}

export { TestCell };