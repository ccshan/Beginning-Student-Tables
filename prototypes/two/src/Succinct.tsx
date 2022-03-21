import React from 'react';
import { ExampleArray, isTableNonEmpty, Table } from './input-definitions';
import { Environment, Yellow } from './global-definitions';
import { ValidatedInput } from './ValidatedInput';
import { takeKey, peekKey } from './App';
import { RemButton } from "./RemButton";
import { Colon } from "./Colon";
import { SuccinctTab } from './SuccinctTab';
import { nameRE } from './parser';

type TableArray = Array<Table>;

interface Props {
  tables: TableArray
  globalEnv: Environment
  disabled: boolean
  programChange: (tabs: TableArray) => void
  handleOnDrag: (exampleArr: ExampleArray, tabIndex: number, newExample?: boolean) => void
}

function Succinct(props: Props) {

  function tableChange(newTab: Table, oldTab: (Table | {})): void {

    const exists = isTableNonEmpty(oldTab) ? props.tables.indexOf(oldTab) !== -1 : false;
    console.log(exists);


    let alteredTabs;
    if (exists) {
      alteredTabs = props.tables.map((table) => table === oldTab ? newTab : table);
    } else {
      alteredTabs = [...props.tables, newTab];
    }

    props.programChange(alteredTabs);
  }

  function remTable(deadTab: Table) {
    let aliveTabs = props.tables.filter((table) => table !== deadTab);
    props.programChange(aliveTabs);
  }

  // String -> Boolean
  function validName(text: (string | Yellow), modTab: (Table | {})): boolean {
    function inEnv(name: (string | Yellow), env: Environment) {
      return env.reduce((acc, variable) => {
        if (acc) {
          return true;
        }
        if (typeof name === "string") {
          return variable.name === name;

        } else {
          return false;
        }

      }, false);
    }

    let tableVars:Environment = props.tables.filter((table) => table !== modTab).map((otherTab) => ({ name: otherTab.name, binding: null }));
    let env:Environment, paramVars;
    if (isTableNonEmpty(modTab)) {
      paramVars = modTab.params.map((param) => ({ name: param.name, binding: null }));
      env = [...props.globalEnv, ...tableVars, ...paramVars];
    } else {
      env = [...props.globalEnv, ...tableVars];
    }

    return typeof text === "string" ? nameRE.test(text) && !inEnv(text, env) : false;
  }

  // TODO make more sophisticated parser that can handle functions as parameters in signature
  function validSignature(text: (string | undefined | Yellow)) {
    let sides;
    if (typeof text === "string") {
      sides = text.split(/->/g);
    } else {
      sides = "";
    }

    if (sides.length !== 2) {
      return false;
    }

    let paramTypes = sides[0].match(/[a-zA-Z]+/g);
    let outType = sides[1].match(/[a-zA-Z]+/g);

    if (typeof paramTypes === null && typeof outType === null) {
      return false;
    } else {
      return paramTypes!.length >= 1 && outType!.length === 1;
    }
  }

  const reals = props.tables.map((table, index) => (
    <div key={table.key} className='flex_horiz table'>
      <div className='flex_vert no_grow'>
        <div className='flex_horiz no_grow signature'>
          <ValidatedInput
            dummy={false}
            placeholder='Table Name'
            text={props.disabled ? table.name : undefined}
            rawText={typeof table.name === "string" ? table.name : ""}
            isValid={(text) => validName(text, table)}
            onValid={(text) => tableChange({
              ...table,
              name: text
            },
              table)}
            onEmpty={() => tableChange({
              ...table,
              name: { yellow: 'yellow' }
            },
              table)}
          />
          <Colon />
          <ValidatedInput
            dummy={false}
            placeholder='Signature'
            text={props.disabled ? table.signature : undefined}
            rawText={typeof table.signature === "string" ? table.signature : ""}
            isValid={(text) => validSignature(text)}
            onValid={(text) => tableChange({
              ...table,
              signature: text
            },
              table)}
            onEmpty={() => tableChange({
              ...table,
              signature: { yellow: 'yellow' }
            },
              table)}
          />
          <RemButton
            onClick={props.disabled ? undefined : (() => remTable(table))}
            title='Remove this table'
          />
        </div>
        <div className='flex_horiz no_grow'>
          <ValidatedInput
            dummy={false}
            placeholder='Purpose'
            text={props.disabled ? table.purpose : undefined}
            rawText={typeof table.purpose === "string" ? table.purpose : ""}
            isValid={(text) => text !== ''}
            onValid={(text) => tableChange({
              ...table,
              purpose: text
            },
              table)}
            onEmpty={() => tableChange({
              ...table,
              purpose: { yellow: 'yellow' }
            },
              table)}
          />
        </div>
        <SuccinctTab
          disabled={props.disabled}
          globalEnv={props.globalEnv}
          table={table}
          tableNames={props.tables.map((table) => table.name)}
          tableChange={(newTab: Table) => tableChange(newTab, table)}
          handleOnDrag={props.handleOnDrag}
          tableIndex={index}
        />
      </div>
      <div className='grow'>{/* div to prevent text fields from stretching across the screen */}</div>
    </div>
  ));

  const dummy = (
    <div key={peekKey()} className='flex_horiz table'>
      <div className='flex_vert no_grow'>
        <div className='flex_horiz no_grow signature'>
          <ValidatedInput
            dummy={true}
            placeholder='Table Name'
            text={props.disabled ? '' : undefined}
            rawText = ""
            isValid={(text) => validName(text, { params: [] })}
            onValid={(text) => tableChange({
              name: text,
              signature: { yellow: 'yellow' },
              purpose: { yellow: 'yellow' },
              examples: [],
              formulas: [],
              params: [],
              key: takeKey()
            },
              {})}
            onEmpty={()=>null}
          />
          <Colon />
          <ValidatedInput
            dummy={true}
            placeholder='Signature'
            text={props.disabled ? '' : undefined}
            rawText=""
            isValid={(text) => text !== ''}
            onValid={(text) => tableChange({
              name: { yellow: 'yellow' },
              signature: text,
              purpose: { yellow: 'yellow' },
              examples: [],
              formulas: [],
              params: [],
              key: takeKey()
            },
              {})}
            onEmpty={()=>null}
          />
        </div>
        <div className='flex_horiz no_grow'>
          <ValidatedInput
            dummy={true}
            placeholder='Purpose'
            text={props.disabled ? '' : undefined}
            rawText=""
            isValid={(text) => text !== ''}
            onValid={(text) => tableChange({
              name: { yellow: 'yellow' },
              signature: { yellow: 'yellow' },
              purpose: text,
              examples: [],
              formulas: [],
              params: [],
              key: takeKey()
            },
              {})}
            onEmpty={()=>null}
          />
        </div>
        <SuccinctTab
          disabled={props.disabled}
          globalEnv={props.globalEnv}
          table={{
            name: { yellow: 'yellow' },
            signature: { yellow: 'yellow' },
            purpose: { yellow: 'yellow' },
            examples: [],
            formulas: [],
            params: [],
            key: peekKey()
          }}
          tableNames={props.tables.map((table) => table.name)}
          tableChange={(newTab: Table) => tableChange(newTab, {})}
          handleOnDrag={()=>null}
        />
      </div>
      <div className='grow'>{/* div to prevent text fields from stretching across the screen */}</div>
    </div>
  );

  return (
    <div>
      {[...reals, dummy]}
    </div>
  );
}

export { Succinct };