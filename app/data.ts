import * as fs from "fs";
import { join, parse as pathParse, format as pathToString, ParsedPath, parse } from "path";
import { DATA_DIR, PINS_DIR, UPLOADS_DIR } from "./conf";
import { Pin } from "./Pin";
import { parse as parsePath } from "path";

export function _returnUniquePath(filePath: string, fileBasename: string, index: number=0) {
    // If file exists
    if (fs.existsSync(filePath)) {
        // Extract 
        const {dir, ext} = pathParse(filePath);
        filePath = join(dir, `${fileBasename}-${index}${ext}`);
        return _returnUniquePath(filePath, fileBasename, index + 1);
    } else {
        return filePath;
    }
}

export async function _makeDirs() {
    return Promise.all([
        fs.mkdir(DATA_DIR, { recursive: true }, ()=>{}),
        fs.mkdir(PINS_DIR, { recursive:true }, ()=>{}),
        fs.mkdir(UPLOADS_DIR, { recursive: true }, ()=>{})
    ]);
}

export async function _readPin(jsonPath: string): Promise<Pin> {
    return new Promise((resolve, reject) => {
        fs.readFile(jsonPath, (err, data) => { 
            if (err) {    
                reject(err);
            } else {
                resolve(new Pin(JSON.parse(data.toString())));
            }
        })
    });
}

export async function _write(providedPath: string, data: string|Buffer, overwrite=false) : Promise<string> {
    return new Promise((resolve, reject) => {
        let writePath: string;
        if (overwrite) {
            writePath = providedPath;
        } else {
            writePath = _returnUniquePath(providedPath, pathParse(providedPath).name);
        }
        
        fs.writeFile(writePath, data, () => { resolve(writePath); });
    });
}

export async function writePin(pin: Pin, slug: string, overwrite=false, dir=PINS_DIR): Promise<string> {
    return _write(join(dir, slug + ".json"), JSON.stringify(pin.asObject()), overwrite);
}


export function uploadPath(filename: string, path=UPLOADS_DIR) {
    return path + filename;
}

export async function saveImage(filename: string, buffer: Buffer, dir=UPLOADS_DIR): Promise<string> {
    const dest = join(dir, filename);
    return pathParse(await _write(dest, buffer, false)).base;
}

export async function getPins(returnElapsedPins: boolean, returnUpcomingPins: boolean, returnArray: true): Promise<Array<Pin>>
export async function getPins(returnElapsedPins: boolean, returnUpcomingPins: boolean, returnArray: false): Promise<{[slug: string]: Pin}>
export async function getPins(returnElapsedPins=false, returnUpcomingPins=true, returnArray=true, pinsDir=PINS_DIR): Promise<Array<Pin>|{[slug: string]: Pin}> {
    return new Promise((resolve, reject) => {
        fs.readdir(pinsDir, async (err, pinFiles) => {
            if (err) { 
                reject(err);
                return;
            }
    

            let pins: Array<Pin>|{[slug:string]: Pin} = returnArray ? [] : {};
            for (let i=0; i < pinFiles.length; i++) {
                const pinFilename = pinFiles[i];
                const pinSlug = parsePath(pinFilename).name;
                const pinPath = join(PINS_DIR, pinFilename);

                const pin = await _readPin(pinPath);
                let addPin = false;
                if (pin.elapsed() && returnElapsedPins) {
                    addPin = true;
                }
                if (!pin.elapsed() && returnUpcomingPins) {
                    addPin = true;
                }
                if (addPin) {
                    pins instanceof Array ? pins.push(pin) : pins[pinSlug] = pin;
                }
            }
            resolve(pins);
        });
    });
    
}

_makeDirs();
