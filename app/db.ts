import * as fs from "fs";
import { Pin } from "./Pin";

const DATA_DIR = "data/"
const PINS_DIR = DATA_DIR + "pins/"


async function makeDirs() {
    return Promise.all([
        fs.mkdir(DATA_DIR, {}, ()=>{}),
        fs.mkdir(PINS_DIR, {}, ()=>{})
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
        fs.writeFile(PINS_DIR + pin.filename(), pin.toString(), ()=>{resolve();})
    });
}


export async function getPins(dir=PINS_DIR): Promise<Array<Pin>> {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, async (err, pinFiles) => {
            if (err) { reject(err); }
    
            const pins: Array<Pin> = [];
            for (let i=0; i < pinFiles.length; i++) {
                const pinFile = PINS_DIR + pinFiles[i];
                const pin = await readPin(pinFile);
                pins.push(pin)
            }
            resolve(pins);
        });
    });
    
}

makeDirs();
