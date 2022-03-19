import React from 'react';

interface Props {
    dummy: boolean
    placeholder: string
    text: string | undefined
    rawText?: string
    
    isValid: (text: undefined | string) => boolean
    onValid: (text: string) => void
    onEmpty: () => void

}

interface State {
    text: string
}

class ValidatedArea extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { text: '' };
        this.textChange = this.textChange.bind(this);
    }

    textChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
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

        text = text as "string";
        let rows, newlines = text.match(/\n/g);
        if (newlines === null) {
            rows = 1;
        } else {
            rows = newlines.length + 1;
        }

        let cols;
        if (text.length === 0)
            cols = this.props.placeholder.length;
        else
            cols = Math.max(...text.split('\n').map((line) => line.length + 1), 4);

        return (
            <textarea
                className={className + ' validated_area'}
                rows={rows}
                cols={cols}
                placeholder={this.props.placeholder}
                onChange={this.textChange}
                spellCheck={false}
                value={text}
            />
        );
    }
}

export { ValidatedArea };