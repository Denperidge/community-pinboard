class Event {
    constructor(pTitle) {
        this.title = pTitle;
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