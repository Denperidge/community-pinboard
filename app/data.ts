import * as fs from "fs";
import { join } from "path";

import { DATA_DIR, PINS_DIR, UPLOADS_DIR } from "./conf";
import { Pin } from "./Pin";


async function makeDirs() {
    return Promise.all([
        fs.mkdir(DATA_DIR, { recursive: true }, ()=>{}),
        fs.mkdir(PINS_DIR, { recursive:true }, ()=>{}),
        fs.mkdir(UPLOADS_DIR, { recursive: true }, ()=>{})
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


export function uploadPath(filename: string, path=UPLOADS_DIR) {
    return path + filename;
}

export async function saveImage(filename: string, buffer: Buffer, path=UPLOADS_DIR): Promise<string> {
    return new Promise((resolve, reject) => {
        const dest = join(path, filename);
        fs.writeFile(dest, buffer, () => {
            resolve(filename);
        });
    });
}


export async function getPins(returnElapsedPins=false, returnUpcomingPins=true, pinsDir=PINS_DIR): Promise<Array<Pin>> {
    return new Promise((resolve, reject) => {
        fs.readdir(pinsDir, async (err, pinFiles) => {
            if (err) { 
                reject(err);
                return;
            }
    
            const pins: Array<Pin> = [];
            for (let i=0; i < pinFiles.length; i++) {
                const pinFile = PINS_DIR + pinFiles[i];
                const pin = await readPin(pinFile);
                let addPin = false;
                if (pin.elapsed() && returnElapsedPins) {
                    addPin = true;
                }
                if (!pin.elapsed() && returnUpcomingPins) {
                    addPin = true;
                }
                if (addPin) {
                    pins.push(pin)
                }
            }
            resolve(pins);
        });
    });
    
}

makeDirs();
