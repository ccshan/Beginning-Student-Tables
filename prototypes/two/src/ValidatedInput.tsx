import React from 'react';
import type { Yellow } from './global-definitions';

// move to upper level later

interface Props {
    dummy: boolean
    text: string | undefined | Yellow
    rawText: string
    placeholder: string
    isValid: (text: Yellow | string) => boolean
    onValid: (text: Yellow | string) => void
    onEmpty: () => void

}
interface State {
    text: string
}

class ValidatedInput extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { text: '' };
        this.textChange = this.textChange.bind(this);
    }

    textChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (this.props.text === undefined) {
            const text = e.target.value;
            this.setState({ text });
            if (this.props.isValid(text)) {
                this.props.onValid(text);
            } else if (text === '' && !this.props.dummy) {
                this.props.onEmpty();
            }
        }
    }

    render() {
        let text: (string | undefined);

        if (this.props.text === undefined) {
            text = this.state.text;
        } else {
            if (typeof this.props.text === "string") {
                text = this.props.text;
            } else {
                text = "";
            }
        }

        if (this.props.rawText) {
            text = this.props.rawText.length !== 0 ? this.props.rawText : text;
        } 

        let className;
        if (this.props.dummy && text === '') { // empty dummy
            className = 'dummy_input';
        } else if (this.props.isValid(text)) { // valid
            className = 'valid_input';
        } else if (text === '') { // empty non-dummy
            className = 'empty_input';
        } else { // invalid
            className = 'invalid_input';
        }

        let size;
        if (typeof text === "string") {
            if (text.length === 0)
                size = this.props.placeholder.length;
            else
                size = Math.max(text.length + 2, 4);
        }

        return (
            <input
                type={'text'}
                className={className}
                size={size}
                placeholder={this.props.placeholder}
                onChange={this.textChange}
                value={text}
            />
        );
    }
}

// need a way to keep the raw text as value
// actually thats impossible since Paramater cannot be a ProgramInput

export { ValidatedInput };