import { EventAttributes } from "ics";

import { PUBLIC_UPLOADS_PATH, HOST_DOMAIN, WEBSITE_TIMEZONE, WEBSITE_LOCALE } from "./conf";

export function pad(number: Number): string {
    return number.toString().padStart(2, "0");
}

class PinUTCDatetime {
    year: number=0;
    _month: number=0;
    _date: number=0;
    _hours: number=0;
    _minutes: number=0;

    enforceLimit(
        thresholdMin: number,
        thresholdMax: number,
        key: number, 
        setterValue: number) {
        
    }

    set month(value: number) {
        
    }
    get month() {

    }

    // This expects a datetime-local input
    // YYYY-MM-DDTHH:MM
    constructor(datetimelocalValue: string) {
        const results = 
            /(?<year>\d{4})-(?<month>\d{1,2})-(?<date>\d{1,2})T(?<hours>\d{1,2}):(?<minutes>\d{1,2})/
            .exec(datetimelocalValue);
            
        if (!results) {
            console.error(`Could not parse PinUTCDatetime! (Provided value: '${datetimelocalValue}')`)
            console.error(results);
            return;
        }
        
        const values = results.groups;
        if (!values) {
            console.error(`Could not parse GROUPS from PinUTCDatetime! (Provided value: '${datetimelocalValue}')`);
            console.error(values);
            return;            
        }
        // Todo: cleaner solution
        // Couldn't get expansion-based value assignments to work
        this.year = parseInt(values.year);
        this.month = parseInt(values.month);
        this.date = parseInt(values.date);
        this.hours = parseInt(values.hours);
        this.minutes = parseInt(values.minutes);
    }

    toDate(): Date {
        // UTC asks month index (0-11) instead of a regular month notation
        return new Date(Date.UTC(this.year, this.month - 1, this.date, this.hours, this.minutes));
    }

    formatAtcbDate(): string {
        return `${this.year}-${pad(this.month)}-${pad(this.minutes)}`;
    }

    formatAtcbTime(): string {
        return `${pad(this.hours)}:${pad(this.minutes)}`;
    }
}

export class Pin {
    title: string;
    description: string;
    location: string;
    datetime: PinUTCDatetime;
    postedBy: string;
    thumbnail?: string;
    thumbnailImageDescr?: string;

    constructor(pTitle: string, pDescription: string, pLocation: string, pDatetimelocalValue: string, pPostedBy: string, pThumbnail?: string, pthumbnailImageDescr?: string) {
        this.title = pTitle;
        this.description = pDescription;
        this.location = pLocation;
        this.datetime = new PinUTCDatetime(pDatetimelocalValue);
        this.postedBy = pPostedBy;

        this.thumbnail = pThumbnail ? pThumbnail : undefined;
        this.thumbnailImageDescr = pthumbnailImageDescr ? pthumbnailImageDescr : undefined;
    }

    static fromObject(obj: {[key: string]: string}): Pin {
        console.log(obj.datetime)
        console.log("---")
        console.log(Date.UTC(2024, 5, 21, 21, 10, 0, 0))
        return new Pin(
            obj.title,
            obj.description,
            obj.location,
            obj.datetime,
            obj.postedBy,
            obj.thumbnail,
            obj.thumbnailImageDescr
        );
    }

    filename() : string {
        return this.title + ".json";
    }

    elapsed() : boolean {
        const dayAfterPinDatetime = this.datetime.toDate();
        dayAfterPinDatetime.setDate(this.datetime.date + 1);
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
            start: [this.datetime.year, this.datetime.month, this.datetime.date, this.datetime.hours, this.datetime.minutes],  // See above docs
            // postedBy, thumbnail & thumbnailImageDescr not used as of yet
            url: "https://" + HOST_DOMAIN
        } as EventAttributes;
    }
}

