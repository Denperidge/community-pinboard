import { EventAttributes } from "ics";

import { PUBLIC_UPLOADS_PATH, HOST_DOMAIN, WEBSITE_TIMEZONE, WEBSITE_LOCALE } from "./conf";

export function pad(number: Number): string {
    return number.toString().padStart(2, "0");
}

function throwErr(message:string) {
    console.log(message)
    console.error(message)
    const err = new Error(message);
    throw err;
}

interface IPinUTCDatetime {
    year: number;
    month: number;
    day: number;
    hours: number;
    minutes: number; 
}

export interface IPinParameters {
    title: string;
    description: string;
    location: string;
    postedBy: string;
    datetimeLocalValue?: string;
    datetime?: IPinUTCDatetime;

    thumbnail?: string;
    thumbnailImageDescr?: string;
}

export class PinUTCDatetime implements IPinUTCDatetime {
    year: number=0;
    month: number=0;
    day: number=0;
    hours: number=0;
    minutes: number=0;

    // This expects a datetime-local input
    // YYYY-MM-DDTHH:MM
    constructor(values: IPinUTCDatetime) {        
        const providedDataCount = Object.keys(values).length;
        // If not one thing is provided for every variable in this class
        if (providedDataCount != 5) {
            console.error("Provided data count incorrect: " + providedDataCount);
            console.error(values);
            throwErr("Throwing...")
            return;            
        }
        // Todo: cleaner solution
        // Couldn't get expansion-based value assignments to work
        this.year = values.year;
        this.month = values.month;
        this.day = values.day;
        this.hours = values.hours;
        this.minutes = values.minutes;

        if (!this.year) {
            throwErr("MEOW")
        }
    }
    
    static FromLocaldatetimeValue(datetimelocalValue: string) {
        const datetimelocalValues: {[key: string]: Number} = {};
        let groups;

        // if datetimelocalValue is provided, fill in values using that
        if (datetimelocalValue) {
            const results = 
            /(?<year>\d{4})-(?<month>\d{1,2})-(?<date>\d{1,2})T(?<hours>\d{1,2}):(?<minutes>\d{1,2})/
            .exec(datetimelocalValue);

            if (!results) {
                throwErr(`Could not parse datetimelocalValue for PinUTCDatetime! (Provided value: '${datetimelocalValue}')`);
                return;
            }
            if (!results.groups) {
                throwErr(`Could not parse GROUPS from PinUTCDatetime! (Provided value: '${datetimelocalValue}')`);
                return;
            }
            groups = results.groups;
        }

        if (!groups) {
            throwErr("No groups in FromLocaldatetimeValue")
            return;
        }

        return new PinUTCDatetime({
            year: parseInt(groups.year),
            month: parseInt(groups.month),
            day: parseInt(groups.day),
            hours: parseInt(groups.hours),
            minutes: parseInt(groups.minutes)
        });
    }

    toDate(): Date {
        // UTC asks month index (0-11) instead of a regular month notation
        return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hours, this.minutes));
    }

    formatAtcbDate(): string {
        return `${this.year}-${pad(this.month)}-${pad(this.day)}`;
    }

    formatAtcbTime(): string {
        return `${pad(this.hours)}:${pad(this.minutes)}`;
    }
}

export class Pin {
    title: string;
    description: string;
    location: string;
    datetime?: PinUTCDatetime;
    postedBy: string;
    thumbnail?: string;
    thumbnailImageDescr?: string;

    constructor(params: IPinParameters) {
        this.title = params.title;
        this.description = params.description;
        this.location = params.location;
        this.postedBy = params.postedBy;

        this.thumbnail = params.thumbnail;
        this.thumbnailImageDescr = params.thumbnailImageDescr;

        let foundDatetime = false;
        if (params.datetime) {
            this.datetime = new PinUTCDatetime(params.datetime);
            foundDatetime = true;
        } else if (params.datetimeLocalValue) {
            const localdatetimeValue = PinUTCDatetime.FromLocaldatetimeValue(params.datetimeLocalValue);
            if (localdatetimeValue) {
                this.datetime = localdatetimeValue;
                foundDatetime = true;
            } else {
                throwErr("localdatetimeValue could not be parsed: " + localdatetimeValue);
                foundDatetime = false;
            }
        } 
        if (!this.datetime) {
            throwErr("no datetime nor datetimelocalValue provided!");
            throw Error();
        }
    }

    filename() : string {
        return this.title + ".json";
    }

    elapsed() : boolean {
        const dayAfterPinDatetime = this.datetime.toDate();
        dayAfterPinDatetime.setDate(this.datetime.day + 1);
        return (new Date()) >= dayAfterPinDatetime;
    }

    // The following functions are for use with add-to-calendar buttons syntax
    // See https://add-to-calendar-button.com/configuration#event-parameters
    // {start,end}Date: YYYY-MM-DD
    // {start,end}Time: HH:MM
    get _datetimePlusTwoHours() {
        const end = this.datetime;
        end.hours += 2
        return end;
    }
    
    get atcbStartDate(): string {
        return this.datetime.formatAtcbDate();
    }
    get atcbEndDate(): string {
        return this._datetimePlusTwoHours.formatAtcbDate();
    }

    get atcbStartTime(): string {
        return this.datetime.formatAtcbTime();
    }

    get atcbEndTime(): string {
        return this._datetimePlusTwoHours.formatAtcbTime();
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

    get timeAndDay() {
        return this.datetime.toDate().toLocaleString(WEBSITE_LOCALE, {dateStyle: "short", timeStyle: "short"});
    }

    get date() {
        return this.datetime.toDate().toLocaleDateString(WEBSITE_LOCALE);
    }

    /*toJSON() : object {
        return {
            "title": this.title
        }
    }*/

    toString() : string {
        return JSON.stringify(this);
    }

    getIcsAttributes() : EventAttributes {
        return {
            // https://www.npmjs.com/package/ics#attributes
            title: this.title,
            description: this.description,
            location: this.location,
            start: [this.datetime.year, this.datetime.month, this.datetime.day, this.datetime.hours, this.datetime.minutes],  // See above docs
            // postedBy, thumbnail & thumbnailImageDescr not used as of yet
            url: "https://" + HOST_DOMAIN
        } as EventAttributes;
    }
}

