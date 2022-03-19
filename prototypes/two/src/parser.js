const RVAR_T = 0;
const RAPP_T = 1;
const RFUNCT_T = 2;
const RNUM_T = 3;
const RBOOL_T = 4;
const RSTRING_T = 5;
const RLIST_T = 6;
const RSYM_T = 7;
const RIMAGE_T = 8;
const RCOLOR_T = 9;
const RIF_T = 10;
const RSTRUCT_T = 11;
const RCLOS_T = 12;

const varRE = /^[^\s",'`()[\]{}|;#]+/; // except numbers
const appRE = /^\(/;
const numRE = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?=$|[\s",'`()[\]{}|;#])/; // this one doesn't permit fractions
const boolRE = /^#(?:[tfTF]|true|false)(?=$|[\s",'`()[\]{}|;#])/;
const strRE = /^"[^\\"]*"/; // TODO: handle backslash escape
const quoteRE = /^'/;
const symRE = /^[^\s",'`()[\]{}|;#]+/; // except numbers
const listRE = /^\(/;

const commentRE = /;.*/g;
const defStructRE = /^\(\s*define-struct(?=$|[\s",'`()[\]{}|;#])/;
const defineRE = /^\(\s*define(?=$|[\s",'`()[\]{}|;#])/;
const nameRE = /^(?!-?(?:\d+(?:\.\d*)?|\.\d+)(?=$|[\s",'`()[\]{}|;#]))[^\s",'`()[\]{}|;#]+/;

/*
A CheckExpectExpression is: 
    - { prog: { name: String, input: ProgramInput, output: ProgramInput }, rest: String }

An Input is :
    - { prog: ProgramInput, key: Number }

A ProgramInput is:
    - { raw: String, validated: ValidatedInput }

A ValidatedInput is one of:
    - Program
    - Yellow

A Program is one of:
    -  Variable
    -  Application
    -  RFunction
    -  RNum
    -  RBool
    -  RString
    -  RList
    -  RSym
    -  RImage
    -  RColor
    -  RStruct
    -  RClos

A Variable is:
    - { value: String, type:  0 }

An Application is:
    - { value: { funct: RFunction, args: [Program]}, type:  1 }

A RFunction is:
    - { value: Function, type:  2 }
*/

// String -> {prog: Program, rest: String}
// parses all expressions except quoted expressions
function parse(text) {
    if (numRE.test(text)) {
        let matches = text.match(numRE);
        let numStr = matches[0];
        let rest = text.slice(numStr.length).trim();
        let num = {value: +numStr, type: RNUM_T};

        return {prog: num, rest: rest};
    } else if (varRE.test(text)) {
        let matches = text.match(varRE);
        let name = matches[0];
        let rest = text.slice(name.length).trim();
        let variable = {value: name, type: RVAR_T};

        return {prog: variable, rest: rest};


    } else if (boolRE.test(text)) {
        let matches = text.match(boolRE);
        let boolStr = matches[0];
        let rest = text.slice(boolStr.length).trim();
        let bool = {value: boolStr[1].toLowerCase() === 't', type: RBOOL_T};

        return {prog: bool, rest: rest};

    } else if (strRE.test(text)) {
        let matches = text.match(strRE);
        let value = matches[0].substring(1, matches[0].length - 1); // trim off quotes
        let str = {value: value, type: RSTRING_T};
        let rest = text.slice(matches[0].length).trim();

        return {prog: str, rest: rest};

    } else if (appRE.test(text)) {
        text = text.slice(1).trim(); // remove open paren
        let parseFunct = parse(text); // parse function
        let funct = parseFunct.prog; // get function
        text = parseFunct.rest; // get past function
        let args = [];

        while (text[0] !== ')') {
            let parseArg = parse(text);
            args = [...args, parseArg.prog];
            text = parseArg.rest;
        }

        let app;
        if (funct.value === 'or') {
            if (args.length === 2) {
                app = {value: {tst: args[0], els: args[1], thn: {value : true, type : RBOOL_T} }, type: RIF_T};
            }
            else if (args.length < 2) {
                throw new SyntaxError('Invalid Syntax: "' + text + '"');
            }
            else {
                // should have a loop here
                throw new SyntaxError('Invalid Syntax: "' + text + '"');
            }
        }
        else if (funct.value === 'and') {


         if (args.length === 2) {
                app = {value: {tst: args[0], thn: args[1], els: {value : false, type : RBOOL_T} }, type: RIF_T};
            }
            else if (args.length < 2) {
                throw new SyntaxError('Invalid Syntax: "' + text + '"');
            }
            else {
                // should have a loop here
                throw new SyntaxError('Invalid Syntax: "' + text + '"');
            }
        }
        else if (funct.value === 'if') {
            if (args.length === 3) {
                app = {value: {tst: args[0], thn: args[1], els: args[2]}, type: RIF_T};
            }
            else {
                throw new SyntaxError('Invalid Syntax: "' + text + '"');
            }
        } else {
            app = {value: {funct: funct, args: args}, type: RAPP_T};
        }
        let rest = text.slice(1).trim(); // remove close paren

        return {prog: app, rest: rest};

    } else if (quoteRE.test(text)) {
        return parseQ(text.slice(1).trim());
    }

    throw new SyntaxError('Invalid Syntax: "' + text + '"');
}

// String -> {prog: Program, rest: String}
// parses quoted expressions
function parseQ(text) {
    if (listRE.test(text)) {
        text = text.slice(1).trim(); // remove quote, open paren
        let listArr = [];

        while (text[0] !== ')') {
            let cur = parseQ(text);
            listArr = [cur.prog, ...listArr]; // listArr is constructed backwards
            text = cur.rest;
        }

        let rest = text.slice(1).trim();
        let prog = listArr.reduce((acc, cur) => ({value: {a: cur, d: acc}, type: RLIST_T}), {value: null, type: RLIST_T}); // turn listArr into an Rlist

        return {prog: prog, rest: rest};

    } else if (numRE.test(text)) {
        let matches = text.match(numRE);
        let numStr = matches[0];
        let rest = text.slice(numStr.length).trim();
        let num = {value: +numStr, type: RNUM_T};

        return {prog: num, rest: rest};

    } else if (boolRE.test(text)) {
        let matches = text.match(boolRE);
        let boolStr = matches[0];
        let rest = text.slice(boolStr.length).trim();
        let bool = {value: boolStr.charAt(1).toLowerCase() === 't', type: RBOOL_T};

        return {prog: bool, rest: rest};

    } else if (strRE.test(text)) {
        let matches = text.match(strRE);
        let value = matches[0].substring(1, matches[0].length - 1); // trim off quotes
        let str = {value: value, type: RSTRING_T};
        let rest = text.slice(matches[0].length).trim();

        return {prog: str, rest: rest};

    } else if (symRE.test(text)) {
        let matches = text.match(symRE);
        let value = matches[0];
        let sym = {value: value, type: RSYM_T};
        let rest = text.slice(matches[0].length).trim();

        return {prog: sym, rest: rest};
    }

    throw new SyntaxError('Invalid Syntax: "' + text + '"');
}
/*
An PrefixExpression is one of: 
  - CheckExpectExpression
  - Define
  - Def-Struct
*/

// String -> [PrefixExpression]
// add flag when parsing for check-expects
function parsePrefix(text, checkExpect = false) {
    const checkExpectRE = /(?<ce>\(\s*check-expect)(?=$|[\s",'`()[\]{}|;#])/;

    const commentRE = /;.*/g;
    const defStructRE = /^\(\s*define-struct(?=$|[\s",'`()[\]{}|;#])/;
    const defineRE = /^\(\s*define(?=$|[\s",'`()[\]{}|;#])/;
    const nameRE = /^(?!-?(?:\d+(?:\.\d*)?|\.\d+)(?=$|[\s",'`()[\]{}|;#]))[^\s",'`()[\]{}|;#]+/;

    text = text.replace(commentRE, '');
    text = text.trim();

    let progs = [];

    if (checkExpect) {
        while (text !== '') {
            // if there is a check-expect in the given string, throw away everything before it
            // else return progs
            if (checkExpectRE.test(text)) {
                // throws away everything before first check-expect
                let ceIndex = checkExpectRE.exec(text).index;
                text = text.substring(ceIndex, text.length).trim();
            } else {
                return progs;
            }
            let parsed = parsePrefixExpression(text);

            text = parsed.rest;
            progs = [...progs, parsed.prog];
        }
    } else {
        while (text !== '') {
            let parsed = parsePrefixExpression(text);

            text = parsed.rest;
            progs = [...progs, parsed.prog];
        }
    }

    return progs;

    // String -> CheckExpectExpression
    function parsePrefixExpression(text) {

        if (checkExpectRE.test(text)) {

            // remove check-expect
            text = text.slice(text.match(checkExpectRE).groups.ce.length).trim();

            // check if it is open paren
            if (text.substring(0, 1) !== "(") {
                throw new Error("syntax error");
            }
            // remove open paren
            text = text.substring(1, text.length); // [funct] [expect])

            // get function name
            let functionName;
            if (nameRE.test(text)) {
                functionName = text.match(nameRE)[0];
                // remove name
                text = text.slice(functionName.length).trim();
            } else {
                throw new Error('check-expect must call a function!');
            }

            // get parameters
            let parameters = [];
            let param, paramValue, paramType, paramString;
            while (text[0] !== ')') {
                let parsed = parse(text);
                paramValue = parsed.prog.value;
                paramType = parsed.prog.type;
                paramString = text.substring(0, text.length - parsed.rest.length).trim();

                param = { raw: paramString, validated: { value: paramValue, type: paramType } };
                parameters = [...parameters, param];

                text = text.slice(paramString.length).trim(); // rest
            }

            text = text.slice(1).trimStart(); // remove open paren and whitespace at start

            // get expected output
            let expectedString = "";
            let want, expectedValue, expectedType;
            while (text[0] !== ')') {
                let parsed = parse(text);

                expectedValue = parsed.prog.value;
                expectedType = parsed.prog.type;
                expectedString = text.substring(0, text.length - parsed.rest.length);

                want = { raw: expectedString, validated: { value: expectedValue, type: expectedType } };

                text = parsed.rest; // rest
            }

            if (expectedString === "") {
                throw new Error("check-expect must have an output!");
            }

            let rest = text.slice(1).trim();
            let prog = { name: functionName, inputs: parameters, want: want };
            return { prog: prog, rest: rest };

        } else if (defStructRE.test(text)) {
            const openRE = /[([]/;

            text = text.slice(text.match(defStructRE)[0].length).trim();

            if (!nameRE.test(text)) {
                throw new Error('Invalid Struct Name');
            }

            let superID = text.match(nameRE)[0];
            text = text.slice(superID.length).trim();

            if (!openRE.test(text)) {
                throw new Error('Invalid Struct Definition');
            }

            let fieldOpen = text.match(openRE)[0];
            text = text.slice(fieldOpen.length).trim();

            let fieldClose;
            if (fieldOpen === '(') {
                fieldClose = ')';
            } else if (fieldOpen === '[') {
                fieldClose = ']';
            }

            let fieldIDs = [];
            while (text[0] !== fieldClose) {
                if (!nameRE.test(text)) {
                    throw new Error('Invalid Field Name');
                }

                let fieldID = text.match(nameRE)[0];

                text = text.slice(fieldID.length);
                text = text.trim();

                fieldIDs = [...fieldIDs, fieldID];
            }

            text = text.slice(1).trim();

            if (text[0] !== ')') {
                throw new Error('Invalid Struct Definition');
            }
            text = text.slice(1).trim();

            return { prog: { superID, fieldIDs, type: 'struct' }, rest: text }
        } else if (defineRE.test(text)) {
            const closRE = /^\(/;

            text = text.slice(text.match(defineRE)[0].length).trim();

            let name,
                binding;
            if (nameRE.test(text)) {    // not function definition
                name = text.match(nameRE)[0];
                text = text.slice(name.length).trim();

                let parsed = parse(text);

                binding = parsed.prog;
                text = parsed.rest.trim();

            } else if (closRE.test(text)) {
                text = text.slice(text.match(closRE)[0].length).trim();

                if (!nameRE.test(text)) {
                    throw new Error(`Invalid Prefix Form: ${text}`);
                }

                name = text.match(nameRE)[0];
                text = text.slice(name.length).trim();

                let parameters = [];
                while (text[0] !== ')') {
                    if (!nameRE.test(text)) {
                        throw new Error(`Invalid Prefix Form: ${text}`);
                    }
                    let param = text.match(nameRE)[0];
                    text = text.slice(param.length).trim();
                    parameters = [...parameters, param];
                }

                text = text.slice(1).trim();

                let parsed = parse(text);

                let body = parsed.prog;

                text = parsed.rest;
                text = text.trim();

                binding = { value: { parameters, body }, type: RCLOS_T }
            } else {
                throw new Error(`Invalid Prefix Form: ${text}`);
            }

            if (text[0] !== ')') {
                throw new Error(`Invalid Prefix Form: ${text}`);
            }

            text = text.slice(1).trim();

            return { prog: { name, binding, type: 'define' }, rest: text };

        } else {
            throw new Error(`Invalid Prefix Form: ${text}`);
        }
    }
}

export { parse, parseQ, parsePrefix, nameRE }