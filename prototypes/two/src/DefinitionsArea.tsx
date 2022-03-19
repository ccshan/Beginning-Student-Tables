import React from "react";
import { ErrorMessage } from "./ErrorMessage";
import { parsePrefix } from "./parser";
import { ValidatedArea } from "./ValidatedArea";

interface Props {
    error: Error | undefined | boolean | unknown
    text: string | undefined

    prefixChange: (t: string) => boolean
}

interface State {
    error: boolean
}

class DefinitionsArea extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { error: false };
        this.prefixChange = this.prefixChange.bind(this);
    }

    validPrefix(text:(string | undefined)) {
        try {
            parsePrefix(text);
        } catch (e) {
            return false;
        }
        return true;
    }

    prefixChange(text:string) {
        this.setState({ error: this.props.prefixChange(text) });
    }

    // onEmpty is set null cuz it shouldn't be used in ValidatedArea but typescript requires it to be defined
    render() {
        const e = this.props.error === undefined
            ? this.state.error
            : this.props.error;
        return (
            <div className='flex_horiz'>
                <div className='flex_vert no_grow'>
                    <ValidatedArea
                        dummy={false}
                        placeholder='Definitions Area'
                        text={this.props.text}
                        isValid={this.validPrefix}
                        onValid={this.prefixChange}
                        onEmpty={()=>{return null}}

                    />
                    {e ? <ErrorMessage error={e as any} /> : []}
                </div>
                <div className='grow'>{/* div to prevent this stuff from growing across the screen */}</div>
            </div>
        );
    }
}

export { DefinitionsArea };