import React from 'react';
import Octicon, { Alert } from '@primer/octicons-react';

interface Props {
    error: Error | boolean
}

// quick fix to static error message because i have no idea how else it is supposed to display if the error is boolean
// It's an error message (oh no!)
export function ErrorMessage(props: Props) {
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
