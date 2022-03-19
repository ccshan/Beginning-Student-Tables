import React from "react";
import { listOrCons } from "./App";
import { Table } from "./input-definitions";
import toBSL from "./prettyprint";

interface Props {
    tables: Array<Table>
}

interface State {
    showBSL: boolean
}

class BSLArea extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);

        let showBSL = false;
        this.state = { showBSL };

        this.toggleDisplay = this.toggleDisplay.bind(this);
    }

    toggleDisplay(e:React.ChangeEvent<HTMLInputElement>) {
        this.setState((state) => ({ showBSL: !state.showBSL }));
    }

    // listOrCons might need to be passed as a prop
    render() {

        let bslArea;
        if (this.state.showBSL) {
            bslArea = (
                <textarea
                    className='bsl_field'
                    rows={20}
                    cols={70}
                    readOnly={true}
                    value={toBSL(this.props.tables, listOrCons, 70, 70)}
                />
            );
        } else {
            bslArea = <div />;
        }

        return (
            <div className='bsl_io'>
                <div className='bsl_checkbox'>
                    <input
                        type='checkbox'
                        id='bsl_toggle'
                        name='bsl_output'
                        onChange={this.toggleDisplay}
                    />
                    <label htmlFor='bsl_toggle'>Show Combined Program</label>
                </div>
                {bslArea}
            </div>
        );

    }
}

export { BSLArea };