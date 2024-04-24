import { EventAttributes } from "ics";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { PUBLIC_UPLOADS_PATH, HOST_DOMAIN, WEBSITE_TIMEZONE, WEBSITE_LOCALE } from "./conf";

require(`dayjs/locale/${WEBSITE_LOCALE}`);
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.locale(WEBSITE_LOCALE)



export function pad(number: Number): string {
    return number.toString().padStart(2, "0");
}

function throwErr(message:string) {
    console.log(message)
    console.error(message)
    const err = new Error(message);
    throw err;
}


export interface IPinParameters {
    title: string;
    description: string;
    location: string;
    postedBy: string;
    datetime: string|dayjs.Dayjs;

    thumbnail?: string;
    thumbnailImageDescr?: string;
}



export class Pin {
    title: string;
    description: string;
    location: string;
    datetime: dayjs.Dayjs;
    postedBy: string;
    thumbnail?: string;
    thumbnailImageDescr?: string;

    constructor(params: IPinParameters) {
        this.title = params.title;
        this.description = params.description;
        this.location = params.location;
        this.postedBy = params.postedBy;
        this.datetime = dayjs(params.datetime);

        console.log(params.datetime)
        console.log(this.datetime)

        this.thumbnail = params.thumbnail;
        this.thumbnailImageDescr = params.thumbnailImageDescr;
    }

    get localYear() {
        return this.datetime.get("year");
    }

    get monthIndex() {
        return this.datetime.get("month")
    }

    get month() {
        return this.monthIndex + 1;
    }

    get hours() {
        return this.datetime.get("hour");
    }

    get minutes() {
        return this.datetime.get("minute");
    }

    asObject() : IPinParameters {
        return {
            title: this.title,
            description: this.description,
            datetime: this.datetime.utc(false).format(),
            location: this.location,
            postedBy: this.postedBy,
            thumbnail: this.thumbnail,
            thumbnailImageDescr: this.thumbnailImageDescr
        }
    }

    filename() : string {
        return this.title + ".json";
    }

    elapsed() : boolean {
        return this.datetime.isBefore();
    }

    get _datetimePlusTwoHours() {
        return this.datetime.add(2, "hours");
    }
    
    // The following functions are for use with add-to-calendar buttons syntax
    // See https://add-to-calendar-button.com/configuration#event-parameters
    // {start,end}Date: YYYY-MM-DD
    // {start,end}Time: HH:MM
    

    get atcbStartDate(): string {
        return this.datetime.format("YYYY-MM-DD");
    }
    get atcbEndDate(): string {
        return this._datetimePlusTwoHours.format("YYYY-MM-DD");
    }

    get atcbStartTime(): string {
        return this.datetime.format("HH:mm");
    }

    get atcbEndTime(): string {
        return this._datetimePlusTwoHours.format("HH:mm");
    }

    get localdatetimeValue(): string {
        return this.datetime.local().format("YYYY-MM-DDTHH:mm")
    }

    get thumbnailPath() { 
        // If no thumbnail, return same undefined value
        if (!this.thumbnail) {
            return this.thumbnail;
        }
        // If it's an url, return url
        else if (this.thumbnail.includes("/")) {
            return this.thumbnail;
        }
        // If it's just a filename, return uploads 
        else {
            return PUBLIC_UPLOADS_PATH + this.thumbnail;
        }
    }

    get date() {
        return this.datetime.local().format("L");
    }

    get timeAndDay() {
        return this.datetime.local().format("llll");//this.date + `, ${this.datetime.hours + utcToLocaleModifier}:${this.datetime.minutes}` 
        //return Intl.DateTimeFormat(WEBSITE_LOCALE, {dateStyle: "short", timeStyle: "short"}).format(this.datetime.toDate().getTime());
    }


    getIcsAttributes() : EventAttributes {
        return {
            // https://www.npmjs.com/package/ics#attributes
            title: this.title,
            description: this.description,
            location: this.location,
            start: [
                this.localYear, 
                this.month,
                this.,
                this.datetime.get("hours"),
                this.datetime.get("minutes")],  // See above docs
            // postedBy, thumbnail & thumbnailImageDescr not used as of yet
            url: "https://" + HOST_DOMAIN
        } as EventAttributes;
    }
}

