
import { evaluate } from 'mathjs'
import { useEffect, useState } from 'react'

import "./Main.css"

let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
let ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func: Function): string[] {
    let fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        return [];
    return result;
}

function convertToValidExpression(input: string) {
    const superscriptMap: Map<string, string> = new Map([
        ['⁰', '0'], ['¹', '1'], ['²', '2'], ['³', '3'], ['⁴', '4'], ['⁵', '5'], ['⁶', '6'], ['⁷', '7'], ['⁸', '8'], ['⁹', '9']
    ]);
    let expresion = input.replace(/([\d)]+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, base: string, superscript: string) => {
        const exponent = superscript.split('').map(char => superscriptMap.get(char) || char).join('')
        return `${base}^${exponent}`;
    });
    return expresion;
}

enum MathResultType {
    Normal,
    Function,
    Error
}

function getMathResultTypeClassName(type: MathResultType) {
    switch (type) {
        case MathResultType.Normal:
            return "math-result-normal";
        case MathResultType.Function:
            return "math-result-function";
        case MathResultType.Error:
            return "math-result-error"
    }
}

export default function Main() {

    const [mathExp, setMathExp] = useState("");
    const [mathResult, setMathResult] = useState("");
    const [mathResultType, setmathResultType] = useState<MathResultType>(MathResultType.Normal);

    useEffect(() => {
        try {

            let expresion = convertToValidExpression(mathExp);
            console.log(`Expression: ${expresion}   |   Raw: ${mathExp}`);
            let result = evaluate(expresion, {
                time: () => new Date().toLocaleString()
            });
            console.log(result);
            if (typeof result === "function") {

                setMathResult(`Function: "${result.name}"`);
                setmathResultType(MathResultType.Function);
            } else {
                if (result !== undefined) {
                    setMathResult(result.toString());
                } else {
                    setMathResult("\u200b");
                }
                setmathResultType(MathResultType.Normal);
            }
        } catch (e) {
            setMathResult(e.message);
            setmathResultType(MathResultType.Error);
            if (e instanceof SyntaxError) {
                console.log(`Invalid expression: ${e.message}`);
            }
        }
    }, [mathExp]);

    function onInputChanged(value: string) {
        value = convertToValidExpression(value);
        setMathExp(value);
    }

    return (
        <div className='main-container'>
            <p className='title'>Calculator</p>
            <input className='math-input' spellCheck={false} value={mathExp} onChange={(e) => onInputChanged(e.target.value)}></input>

            <p className={`math-result-container ${getMathResultTypeClassName(mathResultType)}`}>{mathResult}</p>
        </div>
    )
}