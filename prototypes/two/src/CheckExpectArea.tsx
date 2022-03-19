import React from "react";
import { ErrorMessage } from "./ErrorMessage";
import { parsePrefix } from "./parser";
import { ValidatedArea } from "./ValidatedArea";

interface Props {
    text: string | undefined
    error: Error | undefined | unknown

    importCheckExpects: (expr: string) => void;
}

interface State {
    error: boolean
    content: string
}

class CheckExpectArea extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {error: false, content: ''};
        this.handleCheckExpectImport = this.handleCheckExpectImport.bind(this);
        this.checkExpectValid = this.checkExpectValid.bind(this);
    }

    checkExpectValid(text:(string)) {
        //console.log('text that is recieved here: ', text);
        this.setState({content: text});
    }

    validCheckExpect(text:(string | undefined)) {
        return true;
    }

    handleCheckExpectImport(event:any) {
        this.props.importCheckExpects(this.state.content);
    }

    render() {
        const e = this.props.error === undefined ? this.state.error : this.props.error;
        return (
            <div className='flex_horiz'>
              <div className='flex_vert no_grow'>
                <ValidatedArea
                  dummy={false}
                  placeholder='Check-Expect Area'
                  text={this.props.text}
                  onEmpty={()=>null}
                  isValid={this.validCheckExpect}
                  onValid={this.checkExpectValid}
                />
                {e ? <ErrorMessage error={e as any}/> : []}
              </div>
              <button onClick={this.handleCheckExpectImport}>Import</button>
              <div className='grow'>{/* div to prevent this stuff from growing across the screen */}</div>
            </div>
        );
    }
}

export { CheckExpectArea };