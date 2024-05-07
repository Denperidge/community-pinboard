import { config } from "dotenv";

// Don't set defaults automatically when testing
// Additionally, exclude this if from code coverage
/* c8 ignore next 3 */
if (process.env.NODE_ENV != "test") {
    config();   
}

/**
 * The keys here are in line with the environment variables,
 * not with internal code!
 * 
 * @example conf.WEBSITE_TIMEZONE = process.env.TZ || _DEFAULTS.TZ
 */
export const _DEFAULTS: {[key: string]: string|number} = {
    HOST_DOMAIN: "localhost:3000",
    DATA_DIR: "data/",
    WEBSITE_TITLE: "Community Pinboard!",
    WEBSITE_DESCRIPTION: "A public event pinboard for your local community!",
    TZ: "Europe/Brussels",
    WEBSITE_LOCALE: "nl-BE",    
    MAX_TITLE: 80,
    MAX_DESCRIPTION: 400,
    MAX_LOCATION: 150,
    MAX_POSTEDBY: 50,
    MAX_THUMBNAILURL: 50,
    MAX_UPLOAD_MB: 20
}

function envOrDefault(key: string) {
    const returnAsNumber = typeof _DEFAULTS[key] === "number";
    const envValue = process.env[key]

    if (envValue === undefined || !envValue) {
        return _DEFAULTS[key]
    } else if (envValue) {
        return returnAsNumber ? parseInt(envValue) : envValue;
    }
}

export const HOST_DOMAIN = envOrDefault("HOST_DOMAIN");
export const DATA_DIR = envOrDefault("DATA_DIR");
export const WEBSITE_TITLE = envOrDefault("WEBSITE_TITLE");
export const WEBSITE_DESCRIPTION = envOrDefault("WEBSITE_DESCRIPTION");
export const WEBSITE_TIMEZONE = envOrDefault("TZ");
export const WEBSITE_LOCALE = envOrDefault("WEBSITE_LOCALE");

export const PIN_MAXLENGTHS = {
    "title": envOrDefault("MAX_TITLE"),
    "description": envOrDefault("MAX_DESCRIPTION"),
    "location": envOrDefault("MAX_LOCATION"),
    "postedBy": envOrDefault("MAX_POSTEDBY"),
    "thumbnailUrl": envOrDefault("MAX_THUMBNAILURL")
};
export const MAX_UPLOAD_MB = envOrDefault("MAX_UPLOAD_MB");


export const PINS_DIR = DATA_DIR + "pins/";
export const UPLOADS_DIR = DATA_DIR + "uploads";
export const PUBLIC_UPLOADS_PATH = "/uploads/";
