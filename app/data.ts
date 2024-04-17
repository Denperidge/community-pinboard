import * as fs from "fs";
import { join, parse as pathParse, format as pathToString, ParsedPath } from "path";
import { DATA_DIR, PINS_DIR, UPLOADS_DIR } from "./conf";
import { Pin } from "./Pin";
import * as slug from "slug";


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


function _returnUniquePath(filePath: string, fileBasename: string, index: number=0) {
    // If file exists
    if (fs.existsSync(filePath)) {
        // Extract 
        const {dir, ext} = pathParse(filePath);
        filePath = `${dir}/${fileBasename}-${index}${ext}`;
        return _returnUniquePath(filePath, fileBasename, index + 1);
    } else {
        return filePath;
    }
}

async function _write(providedPath: string, data: string|Buffer, overwrite=false) : Promise<string> {
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
    return _write(join(dir, slug + ".json"), pin.toString(), overwrite);
}


export function uploadPath(filename: string, path=UPLOADS_DIR) {
    return path + filename;
}

export async function saveImage(filename: string, buffer: Buffer, dir=UPLOADS_DIR): Promise<string> {
    const dest = join(dir, filename);
    return pathParse(await _write(dest, buffer, false)).base;
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
