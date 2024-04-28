import { config } from "dotenv";

// Don't set defaults automatically when testing
if (process.env.NODE_ENV != "test") {
    config();
}

/**
 * The keys here are in line with the environment variables,
 * not with internal code!
 * 
 * @example conf.WEBSITE_TIMEZONE = process.env.TZ || _DEFAULTS.TZ
 */
export const _DEFAULTS = {
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

export const HOST_DOMAIN = process.env.HOST_DOMAIN || _DEFAULTS.HOST_DOMAIN;
export const DATA_DIR = process.env.DATA_DIR || _DEFAULTS.DATA_DIR;
export const WEBSITE_TITLE = process.env.WEBSITE_TITLE || _DEFAULTS.WEBSITE_TITLE;
export const WEBSITE_DESCRIPTION = process.env.WEBSITE_DESCRIPTION || _DEFAULTS.WEBSITE_DESCRIPTION;
export const WEBSITE_TIMEZONE = process.env.TZ || _DEFAULTS.TZ;
export const WEBSITE_LOCALE = process.env.WEBSITE_LOCALE || _DEFAULTS.WEBSITE_LOCALE;

export const PIN_MAXLENGTHS = {
    "title": process.env.MAX_TITLE ? parseInt(process.env.MAX_TITLE) : _DEFAULTS.MAX_TITLE,
    "description": process.env.MAX_DESCRIPTION ? parseInt(process.env.MAX_DESCRIPTION) : _DEFAULTS.MAX_DESCRIPTION,
    "location": process.env.MAX_LOCATION ? parseInt(process.env.MAX_LOCATION) : _DEFAULTS.MAX_LOCATION,
    "postedBy": process.env.MAX_POSTEDBY ? parseInt(process.env.MAX_POSTEDBY) : _DEFAULTS.MAX_POSTEDBY,
    "thumbnailUrl": process.env.MAX_THUMBNAILURL ? parseInt(process.env.MAX_THUMBNAILURL) : _DEFAULTS.MAX_THUMBNAILURL
};
export const MAX_UPLOAD_MB = process.env.MAX_UPLOAD_MB ? parseInt(process.env.MAX_UPLOAD_MB) : _DEFAULTS.MAX_UPLOAD_MB


export const PINS_DIR = DATA_DIR + "pins/";
export const UPLOADS_DIR = DATA_DIR + "uploads";
export const PUBLIC_UPLOADS_PATH = "/uploads/";
