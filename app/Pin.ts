import { EventAttributes } from "ics";
import { PUBLIC_UPLOADS_PATH, HOST_DOMAIN, WEBSITE_TIMEZONE, WEBSITE_LOCALE } from "./conf";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import timezone from "dayjs/plugin/timezone";
require(`dayjs/locale/${WEBSITE_LOCALE.trim()}`);
dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.locale(WEBSITE_LOCALE)
dayjs.tz.setDefault(WEBSITE_TIMEZONE);

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
    datetime: string|dayjs.Dayjs;

    thumbnail?: string;
    thumbnailImageDescr?: string;
}


export class Pin {
    [key: string]: any;

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

        // dayjs gave better results for parsing
        this.datetime = (typeof params.datetime === "string") ? dayjs(params.datetime) : params.datetime;

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
        // empty dayjs constructor gives now
        return dayjs().isAfter(this._datetimePlusTwoHours);
    }

    get _datetimePlusTwoHours() {
        return this.datetime.add(2, "hours");
    }
    
    // The following functions are for use with add-to-calendar buttons syntax
    // See https://add-to-calendar-button.com/configuration#event-parameters
    // {start,end}Date: YYYY-MM-DD
    // {start,end}Time: HH:MM

    formatAtcbDate(plusTwoHours=false): string {
        const datetime = plusTwoHours ? this._datetimePlusTwoHours : this.datetime;
        return `${datetime.year()}-${pad(datetime.month() + 1)}-${pad(datetime.date())}`;
    }

    formatAtcbTime(plusTwoHours=false): string {
        const datetime = plusTwoHours ? this._datetimePlusTwoHours : this.datetime;
        return `${pad(datetime.hour())}:${pad(datetime.minute())}`;
    }

    get atcbStartDate(): string {
        return this.formatAtcbDate();
    }
    get atcbEndDate(): string {
        return this.formatAtcbDate(true);
    }

    get atcbStartTime(): string {
        return this.formatAtcbTime();
    }

    get atcbEndTime(): string {
        return this.formatAtcbTime(true);
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

    get humanReadableDate() {
        return this.datetime.format("LL");
    }

    get humanReadableDatetime() {
        return this.datetime.format("LLL");//this.date + `, ${this.datetime.hours + utcToLocaleModifier}:${this.datetime.minutes}` 
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
                this.datetime.year(), 
                this.datetime.month() + 1,
                this.datetime.date(),
                this.datetime.hour(),
                this.datetime.minute()],  // See above docs
            // postedBy, thumbnail & thumbnailImageDescr not used as of yet
            url: "https://" + HOST_DOMAIN
        } as EventAttributes;
    }
}

