import React from "react";
import { deepEquals, unparse_to_string } from "./App";
import { ErrorMessage } from "./ErrorMessage";
import { Environment, Program, Yellow } from "./global-definitions";
import { height, width } from "./image";
import { isValidatedProgInputNonYellow, ProgramInput } from "./input-definitions";
import { unparse_cons, interp, parseCheck, RIMAGE_T } from "./interpreter";
import { ValidatedProgInput } from "./input-definitions";
import { ValidatedArea } from "./ValidatedArea";

interface Props {
    want: ProgramInput
    dummy: boolean
    globalEnv : Environment
    disabled: boolean

    wantChange : (want: ProgramInput) => void
}

interface State {
    isOpen: boolean
}

class Want extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            isOpen: false,
        }
        this.validProg = this.validProg.bind(this);
        this.handleViewClick = this.handleViewClick.bind(this);
        this.isZoomable = this.isZoomable.bind(this);
    }
    validProg(text: (string | undefined)) {
        try {
            parseCheck(text);
        } catch (e) {
            return false;
        }
        return true;
    }

    // Program -> State
    handleViewClick(prog:Program) {
        // check for return type
        if (this.isZoomable(prog)) {
            this.setState(
                { isOpen: !this.state.isOpen }
            );
        }
    }

    // Progam -> Boolean
    // determines whether the given image should be zoomable
    isZoomable(prog:Program) {
        // width and height max could be constants...
        return prog.type === RIMAGE_T ? (width(prog.value) > 250 || height(prog.value) > 250) : false;
    }


    // Props -> State
    componentDidUpdate(prevProps:Props) {
        if (prevProps.want !== this.props.want) {
            this.setState({
                isOpen: false
            });
        }
    }

    // unprase_cons == unparse
    render() {
        let valueCell;
        if (this.props.dummy || !isValidatedProgInputNonYellow(this.props.want.validated)) {
            valueCell = <script />;
        } else {
            try {
                let evalWant:Program = interp(this.props.want.validated, this.props.globalEnv);
                if (deepEquals(evalWant, this.props.want.validated)) {
                    valueCell = <script />;
                } else {
                    valueCell = <td className='output' onClick={() => this.handleViewClick(evalWant)}>{this.state.isOpen && (
                        <dialog
                            className="dialog"
                            style={{ position: "absolute" }}
                            open
                            onClick={() => this.handleViewClick(evalWant)}
                        >
                            {unparse_cons(evalWant)}
                        </dialog>)}
                        {unparse_cons(evalWant, true)}
                    </td>
                }
            } catch (e) {
                valueCell = <td><ErrorMessage error={e as any} /></td>
            }
        }
        return (
            <React.Fragment>
                <td>
                    <div className='flex_horiz'>
                        <ValidatedArea
                            dummy={this.props.dummy}
                            placeholder={'Want'}
                            text={this.props.disabled ? this.props.dummy ? '' : unparse_to_string(this.props.want.validated)
                                : undefined}
                            rawText={this.props.want.raw}
                            isValid={this.validProg}
                            onValid={(text:(string)) => this.props.wantChange({raw: text, validated: parseCheck(text)})}
                            onEmpty={() => this.props.wantChange({raw: '', validated: {yellow: 'yellow'}})}
                        />
                    </div>
                </td>
                {valueCell}
            </React.Fragment>
        );
    }
}

export { Want };