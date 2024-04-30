import { _DEFAULTS } from "../app/conf";

const envVarNames = Object.keys(_DEFAULTS);

function setEnvVars(setUndefined=false) {
    const values: {[key:string]: string|number|undefined} = _DEFAULTS;
    if (setUndefined) {
        envVarNames.forEach((name: string) => {
            values[name] = undefined;
        });
    }
    envVarNames.forEach((name: string) => {
        const setTo = values[name];
        process.env[name] = setTo?.toString();
    });
}


test("conf - default values when unassigned", () => {
    // setUndefined true
    setEnvVars(true);

    const expectedValues: {[key:string]: string|number} = _DEFAULTS;

    const conf = require("../conf");

    envVarNames.forEach((name: string) => {
        expect(conf[name]).toBe(expectedValues[name])
    })
});

test("conf - assign through environment variables", () => {
    
});