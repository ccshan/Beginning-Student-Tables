import React from 'react';
import Octicon, { Alert } from '@primer/octicons-react';
import { RecursionReferenceError } from './RecursionReferenceError';

interface Props {
    error: Error | boolean
}

// It's an error message (oh no!)
export const ErrorMessage:React.FC<Props> = (props) => {
    
    // if the error is a RecursinoReferenceError, the JSX element of it is returned
    if (typeof props.error !== "boolean" && props.error instanceof RecursionReferenceError) {
        return props.error.displayElem;
    }
    return (
        <div>
            {typeof props.error === "boolean" ? "ERROR" : props.error.message}
            <div title={"Oh no! You got an error!"} className="alert">
                <Octicon
                    icon={Alert} size="small" verticalAlign="middle"
                    ariaLabel='Error!' />
            </div>
        </div>
    );
}
