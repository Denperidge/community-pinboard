import { tmpdir } from "os";
import { rmSync, access, existsSync, writeFileSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { DATA_DIR, DATA_DIR as DATA_DIR_TESTING, PINS_DIR, UPLOADS_DIR } from "../app/conf";
import { _makeDirs, _readPin, _returnUniquePath, _write, getPins, saveImage, uploadPath, writePin } from "../app/data";
import { IPinParameters, Pin } from "../app/Pin";
import dayjs from "dayjs";

beforeEach(() => {
    rmSync(DATA_DIR_TESTING, { recursive: true, force: true });
    _makeDirs();
});


function testPathsExist(paths: Array<string>, shouldExist: boolean) {
    paths.forEach((dir) => {
        console.log(`${dir}: ${existsSync(dir)}, should be ${shouldExist}`)
        expect(existsSync(dir)).toBe(shouldExist);
    });
}

function testFileContents(path: string, expectedContents: string) {
    expect(readFileSync(path, {encoding: "utf-8"})).toBe(expectedContents);
}

/**
 * Custom read Pin from file function for testing
 * 
 * @param path 
 * @returns 
 */
function pinFromFile(path: string) {
    return new Pin(JSON.parse(readFileSync(path, {encoding: "utf-8"})));
}

const dirs = [ DATA_DIR_TESTING, PINS_DIR, UPLOADS_DIR ];

const pinData: IPinParameters = {
    title: "Meow",
    description: "test",
    datetime: "2024-04-30T16:00:00.000Z",
    location: "Meoa",
    postedBy: "Mfsdg",
    thumbnail: "http://example.com/image.png",
    thumbnailImageDescr: "Image"
}
const pinPath = join(DATA_DIR_TESTING, "pin.json");

const testFileBasename = "meow"
const testFileExtension = ".txt"
const testFilePath = join(DATA_DIR_TESTING, testFileBasename + testFileExtension);
const testFileIndex4 = join(DATA_DIR_TESTING, testFileBasename + "-4" + testFileExtension);

describe("_returnUniquePath...", () => {
    test("returns the provided filename if already unique", () => {
        expect(_returnUniquePath(testFilePath, testFileBasename)).toBe(testFilePath);
    });
    
    test("if provided filename is not unique, return `${filename}-${nextUnusedIndex}`", () => {
        writeFileSync(testFilePath, "");
        [0, 1, 2, 3].forEach((index) => {
            writeFileSync(join(DATA_DIR_TESTING, `${testFileBasename}-${index}${testFileExtension}`), "");
        });
        expect(_returnUniquePath(testFilePath, testFileBasename)).toBe(testFileIndex4);
    });
});

test("uploadPath: returns path with default & provided dir", () => {
    expect(uploadPath("meow.txt")).toBe(join(UPLOADS_DIR, "meow.txt"));
    expect(uploadPath("meow.txt", PINS_DIR)).toBe(join(PINS_DIR, "meow.txt"));
});

test("_makeDirs: {DATA,PINS,UPLOADS}_DIR", () => {
    rmSync(DATA_DIR_TESTING, { recursive: true, force: true });
    testPathsExist(dirs, false);
    _makeDirs();
    testPathsExist(dirs, true);
});

describe("_readPin...", () => {
    test("reads pin from json file path correctly", async () => {
        writeFileSync(pinPath, JSON.stringify(pinData));

        expect(await _readPin(pinPath)).toStrictEqual(new Pin(pinData));
    });

    test("returns error on non-existing path", async () => {
        return _readPin(join(DATA_DIR_TESTING, "nonexistant.txt")).catch(error => {
            expect(error.code).toBe("ENOENT");
        })
    });
});

describe("_write...", () => {
    test("writes correctly and returns resulting path", async () => {
        const resultFilePath = await _write(testFilePath, "Exact data!");
        testFileContents(resultFilePath, "Exact data!");
        expect(resultFilePath).toBe(testFilePath);
    });
    
    test("does not overwrite by default", async () => {
        const firstWritePath = await _write(testFilePath, "First file");
        const secondWritePath = await _write(testFilePath, "Second file");
        testFileContents(firstWritePath, "First file");
        testFileContents(secondWritePath, "Second file");
    });
    
    test("overwrites when specified", async () => {
        const firstWritePath = await _write(testFilePath, "First file", true);
        testFileContents(firstWritePath, "First file");
        const secondWritePath = await _write(testFilePath, "Second file", true);
        testFileContents(firstWritePath, "Second file");
    
        expect(firstWritePath).toBe(secondWritePath);
    });
    
    
    test("when output path exists & overwrite is false, write to & return unique path", async () => {
        const firstWritePath = await _write(testFilePath, "First file", false);
        const secondWritePath = await _write(testFilePath, "Second file", false);
        testFileContents(firstWritePath, "First file");
        testFileContents(secondWritePath, "Second file");
    
        expect(firstWritePath == secondWritePath).toBe(false);
    });
    
});

describe("_writePin...", () => {
    test("saves pin correctly", async () => {
        const pinJsonPath = await writePin(new Pin(pinData), "meow");

        const pinFromWritePinJson = pinFromFile(pinJsonPath);

        expect(pinFromWritePinJson).toStrictEqual(new Pin(pinData));
        expect(pinJsonPath).toBe(join(PINS_DIR, "meow.json"));
    });

    test("does not overwrite by default", async () => {
        const pinTwoData = pinData;
        pinTwoData.title += "Different!";
        pinTwoData.thumbnailImageDescr += "Different!";

        const pinOne = new Pin(pinData);
        const pinTwo = new Pin(pinTwoData);

        const pinPathOne = await writePin(pinOne, "meow");
        const pinPathTwo = await writePin(pinTwo, "meow");

        expect(pinFromFile(pinPathOne)).toStrictEqual(pinOne);
        expect(pinFromFile(pinPathTwo)).toStrictEqual(pinTwo);

        expect(pinPathOne).toBe(join(PINS_DIR, "meow.json"));
        expect(pinPathTwo).toBe(join(PINS_DIR, "meow-0.json"));
    })

    test("does overwrite when specified", async () => {
        const pinOne = new Pin(pinData);
        const pinTwo = new Pin(pinData);
        pinTwo.thumbnail += "different!";

        const pinPathOne = await writePin(pinOne, "meow");
        expect(pinFromFile(pinPathOne)).toStrictEqual(pinOne);
        expect(pinPathOne).toBe(join(PINS_DIR, "meow.json"));
        
        const pinPathTwo = await writePin(pinTwo, "meow", true);
        expect(pinFromFile(pinPathTwo)).toStrictEqual(pinTwo);
        expect(pinPathTwo).toBe(join(PINS_DIR, "meow.json"));
        expect(pinPathOne).toBe(pinPathTwo);
    })

    test("default dir is PINS_DIR", async () => {
        expect(((await writePin(new Pin(pinData), "meow")))).toBe(join(PINS_DIR, "meow.json"));
    })

    test("dir used when specified", async () => {
        expect(await writePin(new Pin(pinData), "meow", false, DATA_DIR)).toBe(join(DATA_DIR, "meow.json"));
    })
});


describe("saveImage...", () => {
    
    const imageBuffer = readFileSync("public/images/cork.jpg");
    
    test("writes to path and returns filename", async () => {
        const imageFilename = await saveImage("image.jpeg", imageBuffer);
        expect(readFileSync(join(UPLOADS_DIR, imageFilename))).toStrictEqual(imageBuffer);
        expect(imageFilename).toBe("image.jpeg");
    });

    test("uses UPLOADS_DIR by default", async () => {
        const imagePath = join(UPLOADS_DIR, "image.jpeg");
        testPathsExist([imagePath], false);
        await saveImage("image.jpeg", imageBuffer);
        testPathsExist([imagePath], true);
    });
    test("allows a dir to be provided", async () => {
        const imagePath = join(DATA_DIR_TESTING, "image.jpeg");

        testPathsExist([imagePath], false);
        await saveImage("image.jpeg", imageBuffer, DATA_DIR_TESTING);
        testPathsExist([imagePath], true);
    });
});


describe("getPins...", () => {
    const pinToday = new Pin(pinData);
    pinToday.datetime = dayjs();
    const pinTomorrow = new Pin(pinData);
    pinTomorrow.datetime = dayjs().add(1, "day");
    const pinYesterday = new Pin(pinData);
    pinYesterday.datetime = dayjs().subtract(1, "day");

    console.log(`today: ${pinToday.elapsed()}`)
    console.log(`tomorrow: ${pinTomorrow.elapsed()}`)
    console.log(`yesterday: ${pinYesterday.elapsed()}`)

    async function makePins(dir?: string): Promise<{[key:string]: string}> {
        return { 
            "today": await writePin(pinToday, "today", false, dir),
            "tomorrow": await writePin(pinTomorrow, "tomorrow", false, dir),
            "yesterday": await writePin(pinYesterday, "yesterday", false, dir)
        };
    }

    test("ELAPSED: true  | UPCOMING: true", async () => {
        await makePins();
        const pins = await getPins(true, true, false);
        
        expect(pins["today"]).toStrictEqual(pinToday);
        expect(pins["tomorrow"]).toStrictEqual(pinTomorrow);
        expect(pins["yesterday"]).toStrictEqual(pinYesterday);
    });
    test("ELAPSED: true  | UPCOMING: false", async () => {
        await makePins();
        const pins = await getPins(true, false, false);
        
        expect(pins["today"]).toBeUndefined();
        expect(pins["tomorrow"]).toBeUndefined();
        expect(pins["yesterday"]).toStrictEqual(pinYesterday);
    });

    test("ELAPSED: false | UPCOMING: true", async () => {
        await makePins();
        const pins = await getPins(false, true, false);

        expect(pins["today"]).toStrictEqual(pinToday);
        expect(pins["tomorrow"]).toStrictEqual(pinTomorrow);
        expect(pins["yesterday"]).toBeUndefined();
    })
    test("ELAPSED: false | UPCOMING: false", async () => {
        await makePins();
        const pins = await getPins(false, false, false);

        expect(pins["today"]).toBeUndefined();
        expect(pins["tomorrow"]).toBeUndefined();
        expect(pins["yesterday"]).toBeUndefined();
    })

    test("ARRAY: true", async () => {
        await makePins();
        const pinsFromDir = await getPins(true, true, true);
        
        let pinsFound = 0;

        pinsFromDir.map(pinFromDir => {
            [pinToday, pinTomorrow, pinYesterday].map((predefinedPin) => {
                if (predefinedPin.datetime.toISOString() == pinFromDir.datetime.toISOString()) {
                    pinsFound += 1;
                }
            });
        })

        expect(pinsFound).toBe(3);
    });

    test("default dir is PINS_DIR", async () => {
        const paths = await makePins();
        Object.keys(paths).forEach(pathKey => {
            expect(paths[pathKey]).toBe(join(PINS_DIR, pathKey + ".json"));
        });
    })

    test("dir can be provided", async () => {
        const paths = await makePins(DATA_DIR_TESTING);
        Object.keys(paths).forEach(pathKey => {
            expect(paths[pathKey]).toBe(join(DATA_DIR_TESTING, pathKey + ".json"));
        });
    })

    test("throws error if error when reading dir", async () => {
        const nonExistantDir = join(tmpdir(), "nonexistant-community-pinboard-directory");
        return getPins(false, true, false, nonExistantDir).catch(error => {
            expect(error.code).toBe("ENOENT");
        })
    });
});
