import * as fs from "fs";
import { Pin } from "./Pin";

const DATA_DIR = "data/"
const EVENTS_DIR = DATA_DIR + "pins/"


async function makeDirs() {
    return Promise.all([
        fs.mkdir(DATA_DIR, {}, ()=>{}),
        fs.mkdir(EVENTS_DIR, {}, ()=>{})
    ]);
}

export async function readPin(jsonPath: string): Promise<Pin> {
    return new Promise((resolve, reject) => {
        fs.readFile(jsonPath, (err, data) => { 
            if (err) {    
                reject(err);
            } else {
                resolve(Pin.fromObject(JSON.parse(data.toString())));
            }
        })
    });
}

export async function writePin(pin: Pin): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.writeFile(EVENTS_DIR + pin.filename(), pin.toString(), ()=>{resolve();})
    });
}


export async function getPins(dir=EVENTS_DIR): Promise<Array<Pin>> {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, async (err, eventFiles) => {
            if (err) { reject(err); }
    
            const pins: Array<Pin> = [];
            for (let i=0; i < eventFiles.length; i++) {
                const pinFile = EVENTS_DIR + eventFiles[i];
                const pin = await readPin(pinFile);
                console.log(pin.title)
            }
            resolve(pins);
        });
    });
    
}

makeDirs();
