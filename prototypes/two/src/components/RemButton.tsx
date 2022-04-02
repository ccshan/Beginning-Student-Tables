import React from 'react';
import Octicon, { Trashcan } from '@primer/octicons-react';

/*** Buttons ***/
// Button that probably removes something
export function RemButton(props: { title: string; onClick: (() => void) | undefined; }) {
    return (
        <div className='remove'
            onClick={props.onClick}
            title={props.title}>
            <Octicon
                icon={Trashcan} size="small" verticalAlign="middle"
                ariaLabel='Remove' />
        </div>
    );
}
