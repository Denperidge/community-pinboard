import { tmpdir } from "os";
import { rmSync, access, existsSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { DATA_DIR as DATA_DIR_TESTING, PINS_DIR, UPLOADS_DIR } from "../app/conf";
import { _makeDirs, _readPin, _returnUniquePath } from "../app/data";
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

const testFileBasename = "meow"
const testFileExtension = ".txt"
const testFile = join(DATA_DIR_TESTING, testFileBasename + testFileExtension);
const testFileIndex4 = join(DATA_DIR_TESTING, testFileBasename + "-4" + testFileExtension);

test("_returnUniquePath: no index added if already unique", () => {
    expect(_returnUniquePath(testFile, testFileBasename)).toBe(testFile);
})


test("_returnUniquePath: index added beyond 0 if not unique", () => {
    _makeDirs();

    writeFileSync(testFile, "");
    [0, 1, 2, 3].forEach((index) => {
        writeFileSync(join(DATA_DIR_TESTING, `${testFileBasename}-${index}${testFileExtension}`), "");
    });
    expect(_returnUniquePath(testFile, testFileBasename)).toBe(testFileIndex4);
});

test("_makeDirs: {DATA,PINS,UPLOADS}_DIR", () => {
    pathsExist(dirs, false);
    _makeDirs();
    pathsExist(dirs, true);
});

test("_readPin: reads json from path correctly", async () => {
    _makeDirs();
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
    writeFileSync(pinPath, JSON.stringify(pinData));

    expect(await _readPin(pinPath)).toStrictEqual(new Pin(pinData));
});

test("_readPin: reject promise on non-existing path", async () => {
    return _readPin(join(DATA_DIR_TESTING, "nonexistant.txt")).catch(error => {
        expect(error.code).toBe("ENOENT");
    })
});

test("_write: writes correct data", () => {

});
