import { tmpdir } from "os";
import { rmSync, access, existsSync, writeFileSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { DATA_DIR, DATA_DIR as DATA_DIR_TESTING, PINS_DIR, UPLOADS_DIR } from "../app/conf";
import { _makeDirs, _readPin, _returnUniquePath, _write, uploadPath, writePin } from "../app/data";
import { IPinParameters, Pin } from "../app/Pin";

beforeEach(() => {
    rmSync(DATA_DIR_TESTING, { recursive: true, force: true });
});


function pathsExist(paths: Array<string>, shouldExist: boolean) {
    paths.forEach((dir) => {
        console.log(`${dir}: ${existsSync(dir)}, should be ${shouldExist}`)
        expect(existsSync(dir)).toBe(shouldExist);
    });
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

test("_returnUniquePath: no index added if already unique", () => {
    expect(_returnUniquePath(testFilePath, testFileBasename)).toBe(testFilePath);
});

test("_returnUniquePath: index added beyond 0 if not unique", () => {
    _makeDirs();

    writeFileSync(testFilePath, "");
    [0, 1, 2, 3].forEach((index) => {
        writeFileSync(join(DATA_DIR_TESTING, `${testFileBasename}-${index}${testFileExtension}`), "");
    });
    expect(_returnUniquePath(testFilePath, testFileBasename)).toBe(testFileIndex4);
});

test("uploadPath: returns path with default & provided dir", () => {
    expect(uploadPath("meow.txt")).toBe(join(UPLOADS_DIR, "meow.txt"));
    expect(uploadPath("meow.txt", PINS_DIR)).toBe(join(PINS_DIR, "meow.txt"));
});

test("_makeDirs: {DATA,PINS,UPLOADS}_DIR", () => {
    pathsExist(dirs, false);
    _makeDirs();
    pathsExist(dirs, true);
});

test("_readPin: reads json from path correctly", async () => {
    _makeDirs();

    writeFileSync(pinPath, JSON.stringify(pinData));

    expect(await _readPin(pinPath)).toStrictEqual(new Pin(pinData));
});

test("_readPin: reject promise on non-existing path", async () => {
    return _readPin(join(DATA_DIR_TESTING, "nonexistant.txt")).catch(error => {
        expect(error.code).toBe("ENOENT");
    })
});


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

test("_write: writes correctly and returns resulting path", async () => {
    _makeDirs();
    const resultFilePath = await _write(testFilePath, "Exact data!");
    testFileContents(resultFilePath, "Exact data!");
    expect(resultFilePath).toBe(testFilePath);
});

test("_write: does not overwrite by default", async () => {
    _makeDirs();
    const firstWritePath = await _write(testFilePath, "First file");
    const secondWritePath = await _write(testFilePath, "Second file");
    testFileContents(firstWritePath, "First file");
    testFileContents(secondWritePath, "Second file");
});

test("_write: overwrites when specified", async () => {
    _makeDirs();
    const firstWritePath = await _write(testFilePath, "First file", true);
    testFileContents(firstWritePath, "First file");
    const secondWritePath = await _write(testFilePath, "Second file", true);
    testFileContents(firstWritePath, "Second file");

    expect(firstWritePath).toBe(secondWritePath);
});


test("_write: when output path exists & overwrite is false, write to & return unique path", async () => {
    _makeDirs();
    const firstWritePath = await _write(testFilePath, "First file", false);
    const secondWritePath = await _write(testFilePath, "Second file", false);
    testFileContents(firstWritePath, "First file");
    testFileContents(secondWritePath, "Second file");

    expect(firstWritePath == secondWritePath).toBe(false);
});

describe("_writePin...", () => {
    _makeDirs()

    test("saves pin correctly", async () => {
        _makeDirs();
        const pinJsonPath = await writePin(new Pin(pinData), "meow");

        const pinFromWritePinJson = pinFromFile(pinJsonPath);

        expect(pinFromWritePinJson).toStrictEqual(new Pin(pinData));
        expect(pinJsonPath).toBe(join(PINS_DIR, "meow.json"));
    });

    test("does not overwrite by default", async () => {
        _makeDirs();

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
        _makeDirs();

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
        _makeDirs();
        expect(((await writePin(new Pin(pinData), "meow")))).toBe(join(PINS_DIR, "meow.json"));
    })

    test("dir used when specified", async () => {
        _makeDirs();
        expect(await writePin(new Pin(pinData), "meow", false, DATA_DIR)).toBe(join(DATA_DIR, "meow.json"));
    })
});
