import { EventAttributes } from "ics";
import { PUBLIC_UPLOADS_PATH, HOST_DOMAIN, WEBSITE_TIMEZONE, WEBSITE_LOCALE } from "./conf";

const utcToLocaleModifier = new Date().getTimezoneOffset() / 60 * -1;

export function pad(number: Number): string {
    return number.toString().padStart(2, "0");
}

export interface IPinParameters {
    [key: string]: any;
    title: string;
    description: string;
    location: string;
    postedBy: string;
    datetime: string|Date;

    thumbnail?: string;
    thumbnailImageDescr?: string;
}


export class Pin {
    [key: string]: any;

    title: string;
    description: string;
    location: string;
    datetime: Date;
    postedBy: string;
    thumbnail?: string;
    thumbnailImageDescr?: string;

    constructor(params: IPinParameters) {
        this.title = params.title;
        this.description = params.description;
        this.location = params.location;
        this.postedBy = params.postedBy;

        console.log("@@@@")
        console.log(params.datetime)
        this.datetime = (params.datetime instanceof Date) ? params.datetime : new Date(params.datetime);
        console.log(this.datetime)

        this.thumbnail = params.thumbnail;
        this.thumbnailImageDescr = params.thumbnailImageDescr;
    }

    asObject() : IPinParameters {
        return {
            title: this.title,
            description: this.description,
            datetime: this.datetime.toISOString(),  // UTC
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
        return (new Date()) > this._datetimePlusTwoHours;
    }

    get _datetimePlusTwoHours() {
        const twoExtra = this.datetime;
        twoExtra.setHours(twoExtra.getHours() + 2)
        return twoExtra;
    }
    
    // The following functions are for use with add-to-calendar buttons syntax
    // See https://add-to-calendar-button.com/configuration#event-parameters
    // {start,end}Date: YYYY-MM-DD
    // {start,end}Time: HH:MM
    

    get atcbStartDate(): string {
        return `${this.datetime.getFullYear()}-${pad(this.datetime.getMonth() + 1)}-${pad(this.datetime.getDate())}`;
    }
    get atcbEndDate(): string {
        return `${this.datetime.getFullYear()}-${pad(this.datetime.getMonth() + 1)}-${pad(this.datetime.getDate())}`;
    }

    get atcbStartTime(): string {
        return `${pad(this.datetime.getHours())}:${pad(this.datetime.getMinutes())}`;
    }

    get atcbEndTime(): string {
        return `${pad(this.datetime.getHours())}:${pad(this.datetime.getMinutes())}`;
    }

    get localdatetimeValue(): string {
        return this.atcbStartDate + "T" + this.atcbStartTime;
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
        return this.datetime.toLocaleDateString();
    }

    get timeAndDay() {
        return this.datetime.toLocaleString();//this.date + `, ${this.datetime.hours + utcToLocaleModifier}:${this.datetime.minutes}` 
        //return Intl.DateTimeFormat(WEBSITE_LOCALE, {dateStyle: "short", timeStyle: "short"}).format(this.datetime.toDate().getTime());
    }


    getIcsAttributes() : EventAttributes {
        return {
            // https://www.npmjs.com/package/ics#attributes
            title: this.title,
            description: this.description,
            location: this.location,
            startInputType: "local",
            start: [
                this.datetime.getFullYear(), 
                this.datetime.getMonth() + 1,
                this.datetime.getDate(),
                this.datetime.getHours(),
                this.datetime.getMinutes()],  // See above docs
            // postedBy, thumbnail & thumbnailImageDescr not used as of yet
            url: "https://" + HOST_DOMAIN
        } as EventAttributes;
    }
}

