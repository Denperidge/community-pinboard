import { HOST_DOMAIN, MAX_UPLOAD_MB, WEBSITE_DESCRIPTION, WEBSITE_TIMEZONE, WEBSITE_TITLE, _DEFAULTS } from "../app/conf";

const envVarKeys = Object.keys(_DEFAULTS);

function setEnvVars(values: {[key:string]: string|number}) {
    envVarKeys.forEach((name: string) => {
        process.env[name] = values[name].toString();
    });
}

function setEnvVarsUndefined() {
    const undefinedEnvVars: {[key:string]: string} = {};
    envVarKeys.forEach((name: string) => {
        undefinedEnvVars[name] = "";
    });
    setEnvVars(undefinedEnvVars);
}

function testConf(expectedValues: {[key:string]: string|number}) {
    // Require conf dynamically to apply process.env
    const conf = require("../app/conf");
    envVarKeys.forEach((envVarKey: string) => {
        let confValue: string|number;
        if (envVarKey == "TZ") {
            confValue = conf.WEBSITE_TIMEZONE;
        } else if (envVarKey.startsWith("MAX") && !envVarKey.endsWith("UPLOAD_MB")) {
            // TODO: this could be cleaner
            switch (envVarKey) {
                case "MAX_TITLE":
                    confValue = conf.PIN_MAXLENGTHS.title;
                    break;
                case "MAX_DESCRIPTION":
                    confValue = conf.PIN_MAXLENGTHS.description;
                    break;
                case "MAX_LOCATION":
                    confValue = conf.PIN_MAXLENGTHS.location;
                    break;
                case "MAX_POSTEDBY":
                    confValue = conf.PIN_MAXLENGTHS.postedBy;
                    break;
                case "MAX_THUMBNAILURL":
                    confValue = conf.PIN_MAXLENGTHS.thumbnailUrl;
                    break;
                default:
                    throw Error(`No matching conf.PIN_MAXLENGTHS value could be found for key ${envVarKey}`)
            }
        } else {
            confValue = conf[envVarKey];
        }


        expect(confValue).toBe(expectedValues[envVarKey])
    });
}


test("conf - default values when unassigned", () => {
    // Unassign all relevant environment variables (setUndefined true)
    setEnvVarsUndefined();

    // Require conf dynamically to apply process.env
    testConf(_DEFAULTS);
});

test("conf - assign through environment variables", () => {
    // expectedValues == default values
    const expectedValues: {[key:string]: string|number} = {
        HOST_DOMAIN: "localhost:4000",
        DATA_DIR: "/tmp/datadirs",
        WEBSITE_TITLE: "Example!",
        WEBSITE_DESCRIPTION: "Another example.",
        TZ: "America/Los Angeles",
        WEBSITE_LOCALE: "en-gb",

        MAX_TITLE: 100000,
        MAX_DESCRIPTION: 200000,
        MAX_LOCATION: 300000,
        MAX_POSTEDBY: 100000,
        MAX_THUMBNAILURL: 100000,
        MAX_UPLOAD_MB: 100000,
    };

    // Unassign all relevant environment variables )
    setEnvVars(expectedValues);
    testConf(expectedValues);
});