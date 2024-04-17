import { config } from "dotenv";
config()

export const HOST_DOMAIN = process.env.HOST_DOMAIN || "localhost:3000";
export const DATA_DIR = process.env.DATA_DIR || "data/";
export const WEBSITE_TITLE = process.env.WEBSITE_TITLE || "Community Pinboard!";
export const WEBSITE_DESCRIPTION = process.env.WEBSITE_DESCRIPTION || "A public event pinboard for your local community!";
export const WEBSITE_TIMEZONE = process.env.TZ || "Europe/Brussels";
export const WEBSITE_LOCALE = process.env.WEBSITE_LOCALE || "en-BE";

export const PIN_MAXLENGTHS = {
    "title": 80,
    "description": 400,
    "location": 150,
    "postedBy": 50

};

export const PINS_DIR = DATA_DIR + "pins/";
export const UPLOADS_DIR = DATA_DIR + "uploads";
export const PUBLIC_UPLOADS_PATH = "/uploads/";
