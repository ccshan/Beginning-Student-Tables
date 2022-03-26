import React from "react";

import { Table, FormulaArray, ExampleArray, ParameterArray } from './input-definitions';
import { Yellow, Environment } from './global-definitions';

import { SuccinctBody } from './SuccinctBody';
import { SuccinctHead } from './SuccinctHead';

interface Props {
  disabled: boolean
  globalEnv: Environment
  table: Table
  tableNames: Array<string | Yellow | undefined>
  tableIndex?: number

  tableChange: (table: Table) => void
  handleOnDrag: (exampleArr: ExampleArray, tabIndex: number, newExample?: boolean) => void

}
function SuccinctTab(props: Props) {

  function paramsExamplesChange(params: ParameterArray, examples: ExampleArray) {
    props.tableChange({ ...props.table, params, examples });
  }

  function formulasChange(formulas: FormulaArray) {
    props.tableChange({ ...props.table, formulas });
  }

  function examplesFormulasChange(examples: ExampleArray, formulas: FormulaArray) {
    props.tableChange({ ...props.table, examples, formulas });
  }

  return (
    <table className={'grow'}>
      <SuccinctHead
        disabled={props.disabled}
        globalEnv={props.globalEnv}
        params={props.table.params}
        examples={props.table.examples}
        tableNames={props.tableNames}
        paramsExamplesChange={paramsExamplesChange}
        formulas={props.table.formulas}
        formulasChange={formulasChange}
      />
      <SuccinctBody
        disabled={props.disabled}
        globalEnv={props.globalEnv}
        examples={props.table.examples}
        formulas={props.table.formulas}
        paramNames={props.table.params.map((param) => param.name)}
        examplesFormulasChange={examplesFormulasChange}
        formulasChange={formulasChange}
        handleOnDrag={props.handleOnDrag}
        tableIndex={props.tableIndex}
      />
    </table>
  );
}

export { SuccinctTab };