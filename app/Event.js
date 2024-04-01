const validator = require("validator");

class Event {
    constructor(pThumbnail, pTitle, pDescription, pLocation, pDatetime, pPoster) {
        this.thumbnail, this.title = "";

        
        const params = [
            {
                attr: this.thumbnail,
                value: pThumbnail,
                required: false
            }
        ];
        for (let i = 0; i < params.length; i++) {
            this.thumbnail = validator.escape(pThumbnail);
        }

        
        this.title = validator.escape(pTitle);
        this.description = validator.escape(pDescription);
        this.location = validator.escape(pLocation);
        this.datetime = validator.escape(pDatetime);
        this.poster = validator.escape(pPoster);
    }

    get Title() {
        
        return "meow"
    }

    unescaped(attr) {
        return validator.unescape(this[attr]);
    }

    static fromObject(obj) {
        return new Event(
            obj.thumbnail,
            obj.title,
            obj.description,
            obj.location,
            obj.datetime,
            obj.poster
        );
    }

    filename() {
        return this.title + ".json";
    }

    toJSON() {
        return {
            "title": this.title
        }
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }
}


module.exports = Event;