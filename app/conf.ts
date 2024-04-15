import { config } from "dotenv";
config()

export const HOST_DOMAIN = process.env.HOST_DOMAIN || "localhost:3000";
export const DATA_DIR = process.env.DATA_DIR || "data/";
export const WEBSITE_TITLE = process.env.WEBSITE_TITLE || "Community Pinboard!";
export const WEBSITE_DESCRIPTION = process.env.WEBSITE_DESCRIPTION || "A public event pinboard for your local community!";
export const WEBSITE_TIMEZONE = process.env.WEBSITE_TIMEZONE || "Europe/Brussels";

//const timezone = new Date("1986-11-08T12:00:00Z+02:00");
//console.log(timezone.getTimezoneOffset())
const timezone = new Intl.DateTimeFormat(["en-BE"])
const opts = timezone.resolvedOptions()
console.log("@@@")
console.log(opts.timeZone)  // Europe/Brussels
console.log(opts.locale)  // en-BE
console.log(timezone.format(new Date(), ))
console.log(timezone)

export let WEBSITE_TIMEZONE_UTC_OFFSET = "";
/*switch (WEBSITE_TIMEZONE) {
    case "Europe/Brussels": 
        WEBSITE_TIMEZONE_UTC_OFFSET = 
        break;
}*/

export const PINS_DIR = DATA_DIR + "pins/";
export const UPLOADS_DIR = DATA_DIR + "uploads";
export const PUBLIC_UPLOADS_PATH = "/uploads/";
