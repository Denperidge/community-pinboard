import { config } from "dotenv";
import { format } from "path";
config()

export const HOST_DOMAIN = process.env.HOST_DOMAIN || "localhost:3000";
export const DATA_DIR = process.env.DATA_DIR || "data/";
export const WEBSITE_TITLE = process.env.WEBSITE_TITLE || "Community Pinboard!";
export const WEBSITE_DESCRIPTION = process.env.WEBSITE_DESCRIPTION || "A public event pinboard for your local community!";

/** This will get the timezone shorthand (for example GMT) from new Date(), which uses process.env.TZ */
const timezoneString = new Date().toUTCString();
export const TIMEZONE = process.env.TZ || "Europe/Brussels";
export const TIMEZONE_SHORTHAND = timezoneString.substring(timezoneString.lastIndexOf(" ") + 1);

// Get 
function getUtcOffset() {
    // Remember to remove Z from default date
    const utcOffsetInHours = new Date().getTimezoneOffset() / 60 * -1;
    const operator = utcOffsetInHours < 0 ? "-" : "+";
    const paddedHours = Math.abs(utcOffsetInHours).toString().padStart(2, "0");

    return `${operator}${paddedHours}:00`

}
export const utcAdjust = getUtcOffset();

console.log(utcAdjust)

export let WEBSITE_TIMEZONE_UTC_OFFSET = "";
/*switch (WEBSITE_TIMEZONE) {
    case "Europe/Brussels": 
        WEBSITE_TIMEZONE_UTC_OFFSET = 
        break;
}*/

export const PINS_DIR = DATA_DIR + "pins/";
export const UPLOADS_DIR = DATA_DIR + "uploads";
export const PUBLIC_UPLOADS_PATH = "/uploads/";
