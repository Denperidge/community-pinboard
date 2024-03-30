const fs = require("fs");

const DATA_DIR = "data/"
const EVENTS_DIR = DATA_DIR + "events/"


async function setup() {
    return Promise.all([
        fs.mkdir(DATA_DIR, {}, ()=>{}),
        fs.mkdir(EVENTS_DIR, {}, ()=>{})
    ]);
}

async function readEvent(jsonPath) {
    return new Promise((resolve, reject) => {
        fs.readFile(jsonPath, (err, data) => { 
            if (err) {    
                reject(err);
            } else {
                resolve(JSON.parse(data.toString()));
            }
        })
    });
}

async function writeEvent(event) {
    return new Promise((resolve, reject) => {
        fs.writeFile(EVENTS_DIR + event.filename(), event.toString(), resolve)
    });
}


async function getEvents(dir=EVENTS_DIR) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, async (err, eventFiles) => {
            if (err) { reject(err); }
    
            const events = [];
            for (let i=0; i < eventFiles.length; i++) {
                const eventFile = EVENTS_DIR + eventFiles[i];
                events.push(await readEvent(eventFile));
            }
            resolve(events);
        });
    });
    
}

setup();

module.exports = {
    readEvent, writeEvent, getEvents
}