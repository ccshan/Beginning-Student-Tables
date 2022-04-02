import React from 'react';
import ReactDOMServer from 'react-dom/server';
import 'react-table/react-table.css';
import { interp, interpPrefix, unparse_cons, unparse_list, initEnv, isRAPP, RFUNCT_T, isRLIST, isRIMAGE, isRSTRUCT, RIMAGE_T, RLIST_T, RAPP_T, RSTRUCT_T } from './interpreter.js';
import { parse, parsePrefix, parseQ } from './parser.js';
import { allBools, gray, pink, yellow } from './header';
import { paint, width, height, makeRectangle, makeOverlay } from './image';
import { Sendifier } from './sendifier.js';
import './App.css';

// component imports 

// Type Imports
import { CheckExpect, Example, ExampleArray, Formula, FormulaArray, Input, InputArray, isBooleanFormula, isValidatedProgInputNonYellow, isTableNameYellow, Parameter, ProgramInput, Table, ValidatedProgInput, OutputArray, Output, isOutputNonYellow, isParamNonYellow, isYellowProgramGray, ParameterArray } from './input-definitions';
import { Image } from "./image-definitions";
import { DefinitionsArea } from './components/DefinitionsArea';
import { Succinct } from './components/Table/Succinct';
import { BSLArea } from './components/BSLArea';
import { isSnapshotArray, Snapshot } from './recording-definitions';
import { Environment, isRBOOL, Program, ProgramArray } from './global-definitions';
import { CheckExpectArea } from './components/CheckExpectArea';
import { InterpreterError } from './InterperterError';
import { Inputs } from './components/Table/Inputs.js';

/*****************************
  Universal Constants I Want
*****************************/
// this one's different because it has a $ at the end so it tests
// the string until the end
const nameRE = /^(?!-?(?:\d+(?:\.\d*)?|\.\d+)(?=$|[\s",'`()[\]{}|;#]))[^\s",'`()[\]{}|;#]+$/;


/*********************
    Key Management
*********************/
// variable used by takeKey and peekKey to generate keys
let keyCount = 0;

// Number
// returns a unique key
function takeKey(): number {
    return keyCount++;
}

// [Number] -> Number (the brackets here mean optional, not array)
// returns current key without changing it
// shoud be used to look at current state of key without actually taking it
// optionally takes a number as an argument, in which case it returns the key that number
// of steps ahead of the current key
function peekKey(lookahead = 0): number {
    return keyCount + lookahead;
}

/**************
    Globals
**************/
// TODO: maybe get rid of these?
// why is this necessary? 
export let unparse = unparse_cons;
export let listOrCons = 'cons';


// Is this really needed?
export function unparse_to_string(prog: ValidatedProgInput) {
    if (typeof prog == typeof yellow) {
        return '';
    }
    return unparse(prog).join('');
}

/*****************
    Deep Equals
*****************/
// Program -> Program -> Boolean
// checks if two programs are equivalent, recurs on lists and applications
// may not quite work on functions because I use js functions, not data represented closures or something
//    thus 2 functions are only equal if they're a reference to the same object
// maybe move this to interpreter.js?
function deepEquals(proga: Program, progb: Program): boolean {
    if (proga.type !== progb.type) {
        return false;
    }

    if (proga.type === RLIST_T && progb.type === RLIST_T) {
        if (proga.value === null || progb.value === null) {
            return proga.value === progb.value;
        }
        return deepEquals(proga.value.a, progb.value.a) && deepEquals(proga.value.d, progb.value.d);
    }

    // this case will prolly never even happen...
    if (proga.type === RAPP_T && progb.type === RAPP_T) {
        if (proga.value.args.length !== progb.value.args.length) {
            return false;
        }
        let functCheck = deepEquals(proga.value.funct, progb.value.funct);
        let argCheck = proga.value.args.map((arga: Program, i: number) => deepEquals(arga, progb.value.args[i])).every((elem: boolean) => elem);
        return functCheck && argCheck;
    }

    // for whatever reason couldn't find "RSTRUCT_T" ???? idk why
    if (proga.type === RSTRUCT_T) {
        let structa = proga.value;
        let structb = progb.value;

        let idSame = structa.id === structb.id;

        let fieldsSame;
        if (structa.fields.length === structb.fields.length) {
            // temp fix, need to define Strcture
            fieldsSame = structa.fields.every((fielda: any, i: number) => deepEquals(fielda.binding, structb.fields[i].binding));
        } else {
            fieldsSame = false;
        }

        return idSame && fieldsSame;
    }

    if (isRIMAGE(proga)) {
        // Image -> Uint8ClampedArray
        // takes an image and returns an array containing RGBA values of all pixels in the image
        // a lot of this was taken from https://stackoverflow.com/questions/3768565/drawing-an-svg-file-on-a-html5-canvas
        // sometimes this doesn't work...
        //   - when it is first used in a certain instance of the table method, it returns an array containing only zeros,
        //     however, after this I'm pretty sure it returns the array it should be returning
        //   - maybe something hasn't been properly initialized by the first time around?
        function toRGBAArray(image: Image) {
            let can = document.createElement('canvas');
            can.width = width(image);
            can.height = height(image);
            let ctx = can.getContext('2d');
            let svg = paint(image);

            // pretty much just turns the jsx into a string
            let xml = ReactDOMServer.renderToString(svg);

            // make the xml base 64 for some reason (I dunno why)


            let svg64 = btoa(xml);
            // header that does stuff I guess
            let b64Start = 'data:image/svg+xml;base64,';

            // prepend a the header to the xml data
            let image64 = b64Start + svg64;

            // make image that contains the xml data so we can draw it
            let img = document.createElement('img');
            img.src = image64;

            // draw the image onto the canvas
            // had to wrap in if statement to prevent type error
            if (ctx != null) {
                ctx.drawImage(img, 0, 0);

                if (width(image) || height(image) === 0) {
                    return ctx.getImageData(0, 0, 1, 1).data;
                } else {
                    return ctx.getImageData(0, 0, width(image), height(image)).data;
                }
            }
        }

        let imgA = proga!.value;
        let imgB = progb!.value

        let dataA_red = toRGBAArray(makeOverlay([imgA, makeRectangle(width(imgA), width(imgA), 'solid', 'red')]));
        let dataA_green = toRGBAArray(makeOverlay([imgA, makeRectangle(width(imgA), width(imgA), 'solid', 'green')]));

        let dataB_red = toRGBAArray(makeOverlay([imgB, makeRectangle(width(imgB), width(imgB), 'solid', 'red')]));
        let dataB_green = toRGBAArray(makeOverlay([imgB, makeRectangle(width(imgB), width(imgB), 'solid', 'green')]));

        if (width(imgA) !== width(imgB) || height(imgA) !== height(imgB)) { // images have different dimensions
            return false;
        }

        let redSame = dataA_red!.every((datumA_red, i) => datumA_red === dataB_red![i]);
        let greenSame = dataA_green!.every((datumA_green, i) => datumA_green === dataB_green![i]);

        return redSame && greenSame;
    }

    return proga!.value === progb!.value;
}

// TODO: Add image component to render images in outputs


interface Props {
    snapshots : Snapshot
}

interface State {
    prefix: string
    prefixError: boolean | Error | unknown
    globalEnv: Environment
    tables: Array<Table>
    playbackTime: number | undefined
    snapshots: undefined | Snapshot// or array of string and tables

}
class App extends React.Component<Props, State> {
    // i am unsure how this works
    sendifier: Sendifier | undefined;
    constructor(props:Props) {
        super(props);
        let prefix = '';
        let prefixError = false;
        let globalEnv:Environment = initEnv;
        let tables:Array<Table> = [{
            examples: [{ inputs: [{ prog: { raw: '', validated: { yellow: 'yellow' }}, key: takeKey() }], want: { raw: '', validated: { yellow: 'yellow' }}, key: takeKey() }],
            formulas: [{ prog: { raw: '', validated: { yellow: 'yellow' }}, outputs: [{ yellow: 'yellow' }], key: takeKey() }],
            params: [{ name: {yellow: 'yellow'}, key: takeKey() }],
            name: {yellow : 'yellow' },
            signature: {yellow: 'yellow'},
            purpose: {yellow: 'yellow'},
            key: takeKey()
        }];
        // are we playing back? or recording?
        // if in prop then playingback
        // this could be wrong way of checking actually
        if (isSnapshotArray(props.snapshots) && props.snapshots.length > 0) {
            prefix = props.snapshots[0].prefix;
            try {
                globalEnv = interpPrefix(parsePrefix(prefix), initEnv);
            } catch (e) {
                prefixError = e as any;
            }
            tables = this.calculate(globalEnv, props.snapshots[0].tables);
        }
        this.state = {
            prefix, prefixError, globalEnv, tables,
            playbackTime: (props.snapshots ? 0 : undefined),
            snapshots: (props.snapshots ? undefined : [{ prefix, tables }])
        };
        this.prefixChange = this.prefixChange.bind(this);
        this.programChange = this.programChange.bind(this);
        this.playbackTimeChange = this.playbackTimeChange.bind(this);
        this.render = this.render.bind(this);
        this.handleOnDrag = this.handleOnDrag.bind(this);
        this.importCheckExpects = this.importCheckExpects.bind(this);
        this.addNewTable = this.addNewTable.bind(this);
        this.addToTable = this.addToTable.bind(this);

        // The following line mitigates the problem that sometimes toRGBAArray returns
        // all-zeros.  Probably it doesn't completely fix #12.
        document.createElement('img');
    }

    componentDidMount() {
        /****************************************
         * Thing That Sends Stuff Out To Server *
         ****************************************/
        this.sendifier = new Sendifier(3000, Math.floor(Math.random() * 1000000000));
    }

    componentDidUpdate(prevProps:Props) {
        if (isSnapshotArray(this.props.snapshots) &&
            this.props.snapshots !== prevProps.snapshots &&
            this.props.snapshots.length > 0) {
            let prefix = this.props.snapshots[0].prefix;
            let prefixError = false;
            let globalEnv = initEnv;
            try {
                globalEnv = interpPrefix(parsePrefix(prefix), initEnv);
            } catch (e) {
                prefixError = e as any;
            }
            let tables:Array<Table> = this.calculate(globalEnv, this.props.snapshots[0].tables);
            this.setState({
                prefix, prefixError, globalEnv, tables,
                playbackTime: 0, snapshots: undefined
            });
        }
        if (this.sendifier && !this.props.snapshots) {
            this.sendifier.setItem(this.state.snapshots);
        }
    }

    componentWillUnmount() {
        if (this.sendifier) {
            this.sendifier.clear();
            delete this.sendifier;
        }
    }

    calculate(env:Environment, program:Array<Table>):Array<Table> {
        // error array here
        let errorArray:JSX.Element[] = [];
        function makeLookup(table:Table) {
            function lookup(args:ProgramArray) {
                if (args.length !== table.params.length) {
                    throw new Error('Arity Mismatch, expected ' + table.params.length + ' argument' + (table.params.length === 1 ? '' : 's'));
                }
                let expr = table.examples.reduce((acc, example) => {

                    if (acc !== undefined) {
                        return acc;
                    }

                    if (example.inputs.every((input, i) => {
                        if (!isValidatedProgInputNonYellow(input.prog.validated)) {
                            return false;
                        }
                        let bool;
                        try {
                            bool = deepEquals(interp(input.prog.validated, env), args[i]);
                        } catch (e) {
                            bool = false;
                        }
                        return bool;
                    })) {
                        if (!isValidatedProgInputNonYellow(example.want.validated)) {
                            let displayElem = <React.Fragment>({table.name}{args.flatMap(a => [' ', ...unparse(a)])}) doesn't have a want</React.Fragment>;
                            let e = new InterpreterError("error", displayElem);
                            throw e;
                        } else {
                            // Note: don't need to catch exception here because it will be caught in calcFormula
                            return interp(example.want.validated, env);
                        }
                    }

                    return undefined;
                }, undefined);

                if (expr === undefined) {
                    let displayElem:JSX.Element = <React.Fragment>({table.name}{args.flatMap(a => [' ', ...unparse(a)])}) is not an example</React.Fragment>;
                    let e = new InterpreterError("error", displayElem);
                    throw e;
                }

                return expr;
            }

            return lookup;
        }

        let lookups = program.map((table) => ({ name: table.name, binding: { value: makeLookup(table), type: RFUNCT_T } }));
        let tableEnv = [...env, ...lookups];

        function calcTable(table:Table):Table {
            function calcFormula(formula:Formula, examples:ExampleArray):Formula {
                let outputs:OutputArray = examples.map((example) => {

                    if (!isValidatedProgInputNonYellow(example.want.validated) && isYellowProgramGray(example.want.validated)) {
                        return gray;
                    } if (example.want.validated === pink) {
                        return pink;
                    } else if (!example.inputs.every((input) => isValidatedProgInputNonYellow(input.prog.validated)) || !isValidatedProgInputNonYellow(formula.prog.validated)) {
                        // if any of the inputs or the formula isn't initialized, return yellow
                        return yellow;
                    }

                    let error = false;
                    try {
                        example.inputs.map((input) => interp(input.prog.validated, tableEnv));
                    } catch (e) {
                        error = true;
                    }

                    if (example.want.validated === pink || error) {
                        return pink;
                    }

                    let localEnv = table.params.map((param, i) => ({ name: param.name, binding: interp(example.inputs[i].prog.validated, tableEnv) }));
                    let env = [...tableEnv, ...localEnv];

                    let output:Output;
                    try {
                        let outputProg:Program = interp(formula.prog.validated, env);
                        output = outputProg ;
                    } catch (e) {
                        output = e as any; /// new variable messgae to user 
                    }

                    return output;
                });

                if (allBools(outputs) || (isBooleanFormula(formula) && formula.thenChildren.length !== 0)) {
                    function maybeSpecial(example:Example, output:Output):Example {
                        if ((!isOutputNonYellow(output) && isYellowProgramGray(output)) || ((isOutputNonYellow(output) && isRBOOL(output) && output.value === false))) {
                            return {inputs: [], want: {raw:'', validated: gray}, key: takeKey()};
                        }
                            // used to be: typeof outputs.value !== 'boolean'
                        else if (isOutputNonYellow(output) && !isRBOOL(output))
                            return {inputs: [], want: {raw: '', validated: pink}, key: takeKey()};
                        else
                            return example;
                    }
                    if (!isBooleanFormula(formula)) {
                        var thenChildren:FormulaArray = [];
                    } else {
                        let subExamples = examples.map((example, i) => maybeSpecial(example, outputs[i]));
                        thenChildren = formula.thenChildren.map((formula:Formula) => calcFormula(formula, subExamples));
                    }

                    return {
                        ...formula,
                        outputs,
                        thenChildren
                    };
                } else {
                    let newFormula = {
                        ...formula,
                        outputs
                    };
                    
                    // this should work the same as delete newFormula.thenChildren;
                    newFormula = {prog: newFormula.prog, outputs: newFormula.outputs, key: newFormula.key};
                    return newFormula;
                }
            }

            
            if (isTableNameYellow(table.name) || !table.params.every((param:Parameter) => isParamNonYellow(param))) {
                // if the table or any of the table's parameters don't have a name yet, freeze outputs
                return { ...table };
            } else {
                let formulas = table.formulas.map((formula) => calcFormula(formula, table.examples));
                return {
                    ...table,
                    formulas
                };
            }
        }

        return program.map(calcTable);
    }

    // tables only change if there is no error
    prefixChange(prefix:string):any {
        let tables = this.state.tables;
        let globalEnv:Environment;
        try {
            globalEnv = interpPrefix(parsePrefix(prefix), initEnv);
        } catch (prefixError) {
            this.setState(state => ({
                prefix, prefixError,
                snapshots: !this.props.snapshots && state.snapshots !== undefined && isSnapshotArray(state.snapshots)
                    ? [...state.snapshots, { prefix, tables }]
                    : state.snapshots
            }));
            return prefixError;
        }
        tables = this.calculate(globalEnv, tables);
        this.setState((state) => ({
            prefix, prefixError: false, globalEnv, tables,
            snapshots: !this.props.snapshots &&  state.snapshots !== undefined && isSnapshotArray(state.snapshots)
                ? [...state.snapshots, { prefix, tables }]
                : state.snapshots
        }));
        return false;
    }

    programChange(newProg:Array<Table>) {
        this.setState(state => {
            let prefix = state.prefix;
            let tables = this.calculate(state.globalEnv, newProg);
            return {
                tables,
                snapshots: !this.props.snapshots &&  state.snapshots !== undefined && isSnapshotArray(state.snapshots)
                    ? [...state.snapshots, { prefix, tables }]
                    : state.snapshots
            }
        });
    }

    // handleOnDrag : Examples Number -> Table
    // assings the Table with the new Example and updates the state of tables
    handleOnDrag(newExampleOrder:ExampleArray, tableIndex:number, dummyMoved = false) {
        const currentTables:Array<Table> = Array.from(this.state.tables);
        const tableToChange = currentTables[tableIndex];
        if (dummyMoved) {
            const currentFormulas = tableToChange.formulas;
            // adds a {yellow:'yellow'} to every formula's outputs
            const newFormulas:FormulaArray = currentFormulas.map((_, i) => ({ ...currentFormulas[i], outputs: [...currentFormulas[i].outputs, { yellow: 'yellow' }] }));
            const changedTable = { ...tableToChange, examples: newExampleOrder, formulas: newFormulas }
            currentTables[tableIndex] = changedTable;
            this.setState({
                tables: this.calculate(this.state.globalEnv, currentTables)
            });
        } else {
            const changedTable = { ...tableToChange, examples: newExampleOrder };
            currentTables[tableIndex] = changedTable;
            this.setState({
                tables: this.calculate(this.state.globalEnv, currentTables)
            });
        }
    }

    // String ->
    // takes the string from the check-expect area and parses it, adding it to the tables
    // this should pass down error message to make import area red if there is an error in parsing
    importCheckExpects(expression:string) {
        let tables:Array<Table> = Array.from(this.state.tables);
        let checkExpects:Array<CheckExpect>;
        try {
            checkExpects = parsePrefix(expression, true);
        } catch (ceError) {
            return;
        }

        checkExpects.map((checkExpect, ceIdx) => {
            let changed = false;
            tables.map((table, tabIdx) => {
                if (!changed && (checkExpect.name === table.name || isTableNameYellow(table.name))) {
                    let idx = tables.indexOf(table);
                    tables[idx] = this.addToTable(checkExpect, table);
                    changed = true;
                }
            });
            if (!changed) {
                tables = this.addNewTable(checkExpect, tables);
            }
        });
        this.setState({tables : this.calculate(this.state.globalEnv, tables)})
    }

    // returns a new table containing the given check expect
    addNewTable(checkExpect: CheckExpect, tables: Array<Table>):Array<Table> {
        // let tables = this.state.tables;
        let inputs:InputArray = [];
        checkExpect.inputs.forEach((input:ProgramInput, inputIdx:number) => {
            let tabInput:Input = {prog: input, key: takeKey()};
            inputs = [...inputs, tabInput];
        });
        let examples:ExampleArray = [{inputs: inputs, want: checkExpect.want, key: takeKey()}];

        let newParams:ParameterArray = [];
        checkExpect.inputs.map((input, i) => {
            if (i >= newParams.length) {
                let newParam:Parameter = { name: {yellow: "yellow"}, key: takeKey() };
                newParams = [...newParams, newParam];
            }
        });

        let newTab:Table = {name: checkExpect.name, examples: examples, 
                            formulas: [{prog: {raw: "", validated: {yellow: "yellow"}}, 
                                        outputs: [{yellow: "yellow" }], 
                                        key: takeKey()}],
                            params: newParams,
                            signature: {yellow: 'yellow'},
                            purpose: {yellow: 'yellow'},
                            key: takeKey()};
        tables = [...tables, newTab];
        return tables;
    }
    
    // adds check-expect to an existing table
    addToTable(checkExpect: CheckExpect, tableToChange:Table):Table {

        function isExampleInTable(example:Example, table:Table) {
            for (let i = 0; i < table.examples.length; i++) {
                if (examplesSame(example, table.examples[i]) && (table.examples[i].want.raw === example.want.raw)) {
                    return true;
                }
            }
            return false;
        }

        function examplesSame(exOne: Example, exTwo: Example) {
            if (exOne.inputs.length !== exTwo.inputs.length || exOne.want.raw !== exTwo.want.raw) {
                return false;
            }
            for (let i = 0; i < exOne.inputs.length; i++) {
                if (exOne.inputs[i].prog.raw !== exTwo.inputs[i].prog.raw) return false;
            }
            return true;
        }
        
        // this is a sloppy way of doing it but, this generates the new example,
        // which is then used to see if it is already in the given table
        let newExample:Example;
        let newInputs:InputArray = [];
        checkExpect.inputs.forEach((ceInput:ProgramInput, ceIdx:number) => {
            let newInput = { prog: { raw: ceInput.raw, validated: ceInput.validated }, key: takeKey() };
            newInputs = [...newInputs, newInput];
        });

        let newWant:ProgramInput = { raw: checkExpect.want.raw, validated: checkExpect.want.validated};
        newExample = { inputs: newInputs, want: newWant, key: takeKey() };

        if (isExampleInTable(newExample, tableToChange)) {
            return tableToChange;
        }

        let newFormulas:FormulaArray = [];
        let newParams:ParameterArray = tableToChange.params;
        let newExamples:ExampleArray = [];
        let newInputsLength:number; // to be used to match all exmaple inputs to have the same length

        tableToChange.examples.forEach((example, eIdx) => {
            let newExample:Example;
            let newInputs:InputArray = [];
            
            // generates new inputs
            checkExpect.inputs.forEach((ceInput:ProgramInput, ceIdx:number) => {
                let newInput:Input = { prog: { raw: ceInput.raw, validated: ceInput.validated }, key: takeKey() };
                newInputs = [...newInputs, newInput];
            });

            newInputsLength = newInputs.length;

            let newWant:ProgramInput = { raw: checkExpect.want.raw, validated: checkExpect.want.validated};
            newExample = { inputs: newInputs, want: newWant, key: takeKey() };
            // if the example has a yellow input, it will add the new example to that row of the table
            // really this should check all input paramaters to see if none are yellow
            if (!isValidatedProgInputNonYellow(example.inputs[0].prog.validated)) {
                let currExamples = Array.from(tableToChange.examples);
                currExamples[eIdx] = newExample;
                newExamples = currExamples;
            } else {
                newExamples = [...tableToChange.examples, newExample];
            }
            
        });

        // for every example's inputs, if the amount of inputs for that example is less than the new most inputs length,
        // fill the inputs array with empty inputs to match the new length
        // this is sloppy way of doing it since it mutates the table directly, but it works
        tableToChange.examples.map((example, i) => {
            if (example.inputs.length < newInputsLength) {
                checkExpect.inputs.map((input, i:number) => {
                    if (i >= example.inputs.length) {
                        example.inputs = [...example.inputs, { prog: { raw: "", validated: { yellow: "yellow"} }, key: takeKey() }];
                    }
                });
            }
        });

        // add new paramters for each new input field
        checkExpect.inputs.map((input, i) => {
            if (i >= newParams.length) {
                let newParam:Parameter = { name: {yellow: "yellow"}, key: takeKey() };
                newParams = [...newParams, newParam];
            }
        });

        // matches the number of formula outputs to the new number of examples in the table
        let formulasArr = tableToChange.formulas;
        tableToChange.formulas.map((formula, i) => {
            let newOutputs:OutputArray = formula.outputs;
            newExamples.map((example, i) => {
                if (i >= formula.outputs.length) {
                    let newOutput:Output = { yellow: "yellow" };
                    newOutputs = [...newOutputs, newOutput];
                }
            });
            let newFormula:Formula = {...formula, outputs: newOutputs};
            formulasArr[i] = newFormula;
        });
        newFormulas = formulasArr;

        let newTab:Table = {...tableToChange, 
            formulas: newFormulas, 
            params: newParams,
            name: checkExpect.name, 
            examples: newExamples};

        return newTab;
    }

    // event is the scroll bar
    playbackTimeChange(event:any) {
        const snapshots = this.props.snapshots;
        if (isSnapshotArray(snapshots)) {
            const playbackTime = Math.max(0,
                Math.min(snapshots.length - 1,
                    Math.floor(event.target.value)));
            const prefix = snapshots[playbackTime].prefix;
            let globalEnv, prefixError = false;
            for (let t = playbackTime; t >= 0; t--) {
                try {
                    globalEnv = interpPrefix(parsePrefix(snapshots[t].prefix), initEnv);
                    break;
                } catch (e) {
                    globalEnv = initEnv;
                    if (!prefixError) {
                        prefixError = e as any;
                    }
                }
            }
            const tables = this.calculate(globalEnv, snapshots[playbackTime].tables);
            this.setState({ playbackTime, prefix, prefixError, globalEnv, tables });
        }
    }

    render() {
        const disabled = !!this.props.snapshots;
        return (
            <div>
                {this.state.snapshots
                    ? <p>Sessions may be recorded to ensure quality service.</p>
                    : []}
                <DefinitionsArea
                    text={disabled ? this.state.prefix : undefined}
                    error={disabled ? this.state.prefixError : undefined}
                    prefixChange={this.prefixChange}
                />
                <CheckExpectArea
                    text={disabled ? this.state.prefix : undefined}
                    error={disabled ? this.state.prefixError : undefined}
                    importCheckExpects={this.importCheckExpects}
                />
                <Succinct
                    disabled={disabled}
                    globalEnv={this.state.globalEnv}
                    tables={this.state.tables}
                    programChange={this.programChange}
                    handleOnDrag={this.handleOnDrag}
                />
                <div className='language_select'>
                    <select
                        defaultValue='cons'
                        onChange={(e) => {
                            if (e.target.value === 'cons') {
                                listOrCons = 'cons';
                                unparse = unparse_cons;
                            } else {
                                listOrCons = 'list';
                                unparse = unparse_list;
                            }
                            // this just rerenders everything, the state remains unchanged
                            this.setState((state) => state);
                        }}
                    >
                        <option value='cons'>Beginning Student</option>
                        <option value='list'>Beginning Student with List Abbreviations</option>
                    </select>
                </div>
                <BSLArea
                    tables={this.state.tables}
                />
                <div className='flex_horiz'>
                    {isSnapshotArray(this.props.snapshots) ?
                        <input
                            className='grow'
                            type='range'
                            min='0'
                            max={this.props.snapshots.length - 1}
                            value={this.state.playbackTime}
                            onChange={this.playbackTimeChange} />
                        : []}
                </div>
            </div>
        );
    }
}

export { App, takeKey, peekKey, deepEquals };
