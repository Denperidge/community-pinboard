import { PUBLIC_UPLOADS_PATH as PUBLIC_UPLOADS_PATH } from "./conf";

export class Pin {
    title: string;
    description: string;
    location: string;
    datetime: Date;
    poster: string;
    thumbnail?: string;

    constructor(pTitle: string, pDescription: string, pLocation: string, pDatetime: Date, pPoster: string, pThumbnail?: string) {
        this.title = pTitle;
        this.description = pDescription;
        this.location = pLocation;
        this.datetime = pDatetime;
        this.poster = pPoster;

        if (pThumbnail) {
            this.thumbnail = pThumbnail;
        } else {
            this.thumbnail = undefined;
        }
    }

    static fromObject(obj: {[key: string]: string}): Pin {
        return new Pin(
            obj.title,
            obj.description,
            obj.location,
            new Date(obj.datetime),
            obj.poster,
            obj.thumbnail
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
}

