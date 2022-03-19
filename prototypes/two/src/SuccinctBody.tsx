import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { peekKey, takeKey } from './App';
import { RemButton } from "./RemButton";
import { Environment } from './global-definitions';
import { Example, ExampleArray, Formula, FormulaArray, InputArray, isBooleanFormula, isExampleNonEmpty, NameInput, OutputArray, ProgramInput } from './input-definitions';
import { Inputs } from './Inputs';
import { Want } from './Want';
import { Outputs } from './Outputs';

interface Props {
    disabled: boolean
    globalEnv: Environment
    examples: ExampleArray
    formulas: FormulaArray
    tableIndex?: number
    paramNames: Array<NameInput>

    formulasChange: (formulas: FormulaArray) => void
    examplesFormulasChange: (alteredExamples: ExampleArray, alteredForms: FormulaArray) => void
    handleOnDrag: (exampleArr: ExampleArray, tabIndex: number, newExample?: boolean) => void
}

function SuccinctBody(props: Props) {
    function remExample(deadExample: Example) {
        const deadIndex = props.examples.indexOf(deadExample);
        // Formula -> Formula
        // removes the output at deadIndex from the given formula and all of its children (if it has any) so stuff works
        function removeOutputFromFormula(formula: Formula) {
            let outputs = formula.outputs.filter((_: any, i: number) => i !== deadIndex);

            if (isBooleanFormula(formula)) {
                const thenChildren: FormulaArray = formula.thenChildren.map(removeOutputFromFormula);
                return {
                    ...formula,
                    outputs,
                    thenChildren
                };
            } else {
                return {
                    ...formula,
                    outputs
                };
            }
        }


        const aliveExamples = props.examples.filter((example) => example !== deadExample);
        const alteredForms = props.formulas.map(removeOutputFromFormula);
        props.examplesFormulasChange(aliveExamples, alteredForms);
    }

    // TODO: Update this to match new data definitions
    // split into function that makes a new and function that handles not exist exist case
    function exampleChange(newExample: Example, oldExample: (Example | {})) {
        console.log('new example', newExample);
        const exists = isExampleNonEmpty(oldExample) ? props.examples.indexOf(oldExample) !== -1 : false;

        // Formula -> Formula
        // adds an init output to the given formula and all of its children (if it has any) so stuff works
        function addAnotherOutputToFormula(formula: Formula): Formula {
            let outputs:OutputArray = [...formula.outputs, { raw: '', validated: { yellow: 'yellow' } }];

            if (isBooleanFormula(formula)) {
                const thenChildren = formula.thenChildren.map(addAnotherOutputToFormula);
                return {
                    ...formula,
                    outputs,
                    thenChildren
                };
            } else {
                return {
                    ...formula,
                    outputs
                };
            }
        }

        let alteredExamples, alteredForms;
        if (exists) {
            alteredExamples = props.examples.map((example) => example === oldExample ? newExample : example);
            alteredForms = props.formulas;
        } else {
            alteredExamples = [...props.examples, newExample];
            alteredForms = props.formulas.map(addAnotherOutputToFormula);
        }

        props.examplesFormulasChange(alteredExamples, alteredForms);
        return; // this doesn't actually do anything
    }

    // handleOnRowDrag : DragObject -> 
    // passes an updated Example order to handleOnDrag
    // result is HTMLInputObject type thing
    function handleOnRowDrag(result:any):any {
        if (!result.destination || result.source.index === result.destination.index) {
            return;
        }
        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;
        const examplesList: ExampleArray = Array.from(props.examples);
        let newYellowExample: Example;

        if (sourceIndex === examplesList.length) {
            // add a 'yellow' example to the list at destination index
            newYellowExample = { inputs: [{ prog: {raw: '' , validated: { yellow : 'yellow' }}, key: takeKey() }], want: {raw: '' , validated: { yellow : 'yellow' }}, key: takeKey() };
            examplesList.splice(destinationIndex, 0, newYellowExample);
            props.handleOnDrag(examplesList, props.tableIndex!, true);
        } else if (destinationIndex === examplesList.length) {
            newYellowExample = { inputs: [{ prog: {raw: '' , validated: { yellow : 'yellow' }}, key: takeKey() }], want: {raw: '' , validated: { yellow : 'yellow' }}, key: takeKey() };
            examplesList.splice(destinationIndex, 0, newYellowExample);
            const [reorderedExample] = examplesList.splice(sourceIndex, 1);
            examplesList.splice(destinationIndex, 0, reorderedExample);
            props.handleOnDrag(examplesList, props.tableIndex!, true);

        } else {
            const [reorderedExample] = examplesList.splice(sourceIndex, 1);
            examplesList.splice(destinationIndex, 0, reorderedExample);
            props.handleOnDrag(examplesList, props.tableIndex!);
        }
    }

    const reals = props.examples.map((example, i) => (
        <Draggable key={example.key} index={i} draggableId={example.key.toString()}>
            {(provided: any) => (
                <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} tabIndex="-1">
                    <td>
                        <RemButton
                            onClick={props.disabled ? undefined : (() => remExample(example))}
                            title={'Remove this example'}
                        />
                    </td>
                    <Inputs
                        disabled={props.disabled}
                        globalEnv={props.globalEnv}
                        dummy={false}
                        inputs={example.inputs}
                        inputsChange={(inputs: InputArray) => exampleChange({ ...example, inputs },
                            example)}
                    />
                    <td>{/* empty cell to align with param dummy input */}</td>
                    <Outputs
                        globalEnv={props.globalEnv}
                        dummy={false}
                        formulas={props.formulas}
                        want={example.want}
                        row={i}
                    />
                    <td>{/* empty cell to align with top level formula dummy input */}</td>
                    <Want
                        disabled={props.disabled}
                        globalEnv={props.globalEnv}
                        dummy={false}
                        want={example.want}
                        wantChange={(want:ProgramInput) => exampleChange({ ...example, want },
                            example)}
                    />
                </tr>
            )}
        </Draggable>
    ));

    const dummy = (
        // index = examples.length
        <Draggable key={peekKey(props.paramNames.length)} index={props.examples.length} draggableId={peekKey().toString()}>
            {(provided:any) => (
                <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} tabIndex="-1">
                    <td>{/* empty cell to offset rembutton */}</td>
                    <Inputs
                        disabled={props.disabled}
                        globalEnv={props.globalEnv}
                        dummy={true}
                        inputs={props.paramNames.map((_, i) => ({prog:{raw:'', validated: {yellow: "yellow"}}, key: peekKey(i) }))}
                        inputsChange={(inputs: InputArray) => exampleChange({
                            inputs,
                            want: { raw: '', validated: { yellow: 'yellow' } },
                            key: takeKey()
                        },
                            {})}
                    />
                    <td>{/* empty cell to align with param dummy input */}</td>
                    <Outputs
                        globalEnv={props.globalEnv}
                        dummy={true}
                        formulas={props.formulas}
                        want={{raw: '', validated: {yellow: "yellow"}}}
                        row={0}
                    />
                    <td>{/* empty cell to align with top level formula dummy input */}</td>
                    <Want
                        disabled={props.disabled}
                        globalEnv={props.globalEnv}
                        dummy={true}
                        want={{raw:'', validated:{yellow:'yellow'}}}
                        wantChange={(want: ProgramInput) => exampleChange({
                            want,
                            inputs: props.paramNames.map((_) => ({ prog: { raw: '', validated: { yellow: 'yellow' } }, key: takeKey() })),
                            key: takeKey()
                        },
                            {})}
                    />
                </tr>
            )}
        </Draggable>
    );

    return (
        <DragDropContext onDragEnd={handleOnRowDrag}>
            <Droppable droppableId={"droppable-main-table" + props.tableIndex}>
                {(provided: any) => (
                    <tbody ref={provided.innerRef} {...provided.droppableProps}>
                        {[...reals, dummy]}
                        {provided.placeholder}
                    </tbody>
                )}
            </Droppable>
        </DragDropContext>
    );
}

export { SuccinctBody };