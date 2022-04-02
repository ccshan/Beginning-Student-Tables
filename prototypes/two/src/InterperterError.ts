/**
 * Custom Error for handling type and reference errors which occur during interpretation and table state calculation.
 * When an error occurs in table calculation or interperting, a ReactFragment containing information about the error is returned, but the message property of Error only accepts a string. 
 * An error class which accepts a JSX element allows for more extensive error messages and expandibility in the future.
 * 
 * 
 * Rmk: Since this accepts a JSXElement, an element with a button could be passed which adds 
 * missing examples to table
 */

// rename to interpeterError or something like that
class InterpreterError extends Error {
    displayElem: JSX.Element;
    /**
     * 
     * @param message super is called on this
     * @param displayElem JSXElement used to render the contents of this error
     */
    constructor(message: string, displayElem: JSX.Element) {
        super(message);

        this.displayElem = displayElem;

        // fixes the prototype chain
        const actualProto = new.target.prototype;
    }

    /**
     * Getter for the displayElem
     * @returns JSX.Element, the contents of the error
     */
    returnDisplayElem(): JSX.Element{
        return this.displayElem;
    }

}

export { InterpreterError };