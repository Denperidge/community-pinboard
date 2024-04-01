export class Pin {
    title: string;
    description: string;
    location: string;
    datetime: Date;
    poster: string;
    thumbnail?: URL;

    constructor(pTitle: string, pDescription: string, pLocation: string, pDatetime: Date, pPoster: string, pThumbnail?: URL) {
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
            new URL(obj.thumbnail)
        );
    }

    filename() : string {
        return this.title + ".json";
    }

    toJSON() : object {
        return {
            "title": this.title
        }
    }

    toString() : string {
        return JSON.stringify(this.toJSON());
    }
}

