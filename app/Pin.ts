import { PUBLIC_UPLOADS_PATH as PUBLIC_UPLOADS_PATH } from "./conf";

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
}

