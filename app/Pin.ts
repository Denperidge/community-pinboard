import { createEvent, DateTime, EventAttributes } from "ics";

import { PUBLIC_UPLOADS_PATH, HOST_DOMAIN } from "./conf";


export class Pin {
    title: string;
    description: string;
    location: string;
    datetime: Date;
    postedBy: string;
    thumbnail?: string;
    thumbnailImageDescr?: string;

    constructor(pTitle: string, pDescription: string, pLocation: string, pDatetime: Date, pPostedBy: string, pThumbnail?: string, pthumbnailImageDescr?: string) {
        this.title = pTitle;
        this.description = pDescription;
        this.location = pLocation;
        this.datetime = pDatetime;
        this.postedBy = pPostedBy;

        this.thumbnail = pThumbnail ? pThumbnail : undefined;
        this.thumbnailImageDescr = pthumbnailImageDescr ? pthumbnailImageDescr : undefined;
    }

    static fromObject(obj: {[key: string]: string}): Pin {
        return new Pin(
            obj.title,
            obj.description,
            obj.location,
            new Date(obj.datetime),
            obj.postedBy,
            obj.thumbnail,
            obj.thumbnailImageDescr
        );
    }

    filename() : string {
        return this.title + ".json";
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
            start: this.datetime.getTime(),  // See above docs
            // postedBy, thumbnail & thumbnailImageDescr not used as of yet
            url: "https://" + HOST_DOMAIN
        } as EventAttributes;
    }
}

