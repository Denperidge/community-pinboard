import { WEBSITE_LOCALE } from "../app/conf";
import { pad, Pin, IPinParameters } from "../app/Pin";
// Find better solution for dayjs than copy pasting the import & setup from Pin?
import dayjs, { UnitType } from "dayjs";
import timezone from "dayjs/plugin/timezone"

let pin: Pin;
const testPinParams: IPinParameters = {
    title: "Example",
    description: "Example description!",
    datetime: "1938-01-02T00:00-05:00",  // Before unix, might not work
    location: "New York",
    postedBy: "Cat",
    thumbnail: "https://raw.githubusercontent.com/Denperidge/community-pinboard/9399721d5f731706e78b94cbf7ba3c4998af6272/public/images/cork.jpg",
    thumbnailImageDescr: "A square cork texture",
}
const pinStringParams = ["title", "description", "location", "postedBy", "thumbnail", "thumbnailImageDescr"]

const pinDatetimePlusTwo = dayjs(testPinParams.datetime).add(2, "hours");
const nowPlusTwoHours = dayjs().add(2, "hours");

beforeEach(() => {
    pin = new Pin(testPinParams);
})

test("Pad adds 0's to single digit numbers, but not to two digit ones", () => {
    expect(pad(2)).toBe("02");
    expect(pad(20)).toBe("20");
    expect(pad(0)).toBe("00");
});

test("Pin constructor", () => {
    pinStringParams.forEach((param) => {
        expect(pin[param]).toBeDefined();
        expect(pin[param]).toBe(testPinParams[param]);
    })

    expect(pin.datetime.toISOString() == testPinParams.datetime);
});

test("Pin.asObject() returns the the properties in a JSON object, with datetime as ISO string", () => {
    const expectedProperties = testPinParams;
    expectedProperties.datetime = dayjs(expectedProperties.datetime).toISOString();
    expect(pin.asObject()).toStrictEqual(expectedProperties);
})

test("Pin.filename()", () => {
    expect(pin.filename()).toStrictEqual(pin.title + ".json")
});

test("Pin.elapsed() returns true when pin is ahead of time, false when it's before now", () => {
    // elapsed: true
    expect(pin.elapsed()).toStrictEqual(true);

    // elapsed: false
    // expiration 2 hours from now
    const expectedProperties = testPinParams;
    expectedProperties.datetime = dayjs(nowPlusTwoHours);
    expect(new Pin(expectedProperties).elapsed()).toStrictEqual(false);
});

test("Pin._datetimePlusTwoHours returns pin.datetime plus two hours", () => {
    expect(pin._datetimePlusTwoHours).toStrictEqual(pinDatetimePlusTwo);
});

test("Pin.atcb{Start,End}{Date,Time} return atcb-compatible values", () => {
    function date(dt: string) {
        return dt.split("T")[0];
    }
    function time(dt: string) {
        const time = dt.split("T")[1];
        return time.substring(0, time.lastIndexOf(":"));
    }
    
    const expected: {[key:string]: string} = {
        atcbStartDate: date(dayjs(testPinParams.datetime).toISOString()),
        atcbEndDate: date(pinDatetimePlusTwo.toISOString()),
        atcbStartTime: time(dayjs(testPinParams.datetime).toISOString()),
        atcbEndTime: time(pinDatetimePlusTwo.toISOString())
    }

    Object.keys(expected).forEach((key: string) => {
        console.log(key)
        expect(pin[key]).toStrictEqual(expected[key])
    });
});