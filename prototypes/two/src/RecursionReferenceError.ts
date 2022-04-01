/**
 * Custom Error for handling reference errors that occur during recursion
 * 
 * Rmk: Since this accepts a JSXElement, an element with a button could be passed which adds 
 * missing examples to table
 * 
 * Rmk': maybe this should extend ReferenceError?
 */
class RecursionReferenceError extends Error {
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

export { RecursionReferenceError };