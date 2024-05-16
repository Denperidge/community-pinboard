import { WEBSITE_LOCALE, WEBSITE_TIMEZONE } from "../app/conf";
import { pad, Pin, IPinParameters } from "../app/Pin";
// Find better solution for dayjs than copy pasting the import & setup from Pin?
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.locale(WEBSITE_LOCALE)
dayjs.tz.setDefault(WEBSITE_TIMEZONE);

let pin: Pin;
let testPinParams: IPinParameters;
const pinStringParams = ["title", "description", "location", "postedBy", "thumbnail", "thumbnailImageDescr"]

let pinDatetimePlusTwo: dayjs.Dayjs;
const nowPlusTwoHours = dayjs().add(2, "hours");


// utc hour + utcToLocaleModifier == localised hour for process.env.TZ
const utcToLocaleModifier = +2; //new Date().getTimezoneOffset() / 60 * -1;
beforeEach(() => {
    testPinParams = {
        title: "Example",
        description: "Example description!",
        datetime: "1981-04-18T10:00:00.000Z",  // For Europe/Brussels, this should be at 11am (GMT+1 @ winter)
        location: "New York",
        postedBy: "Cat",
        thumbnail: "https://raw.githubusercontent.com/Denperidge/community-pinboard/9399721d5f731706e78b94cbf7ba3c4998af6272/public/images/cork.jpg",
        thumbnailImageDescr: "A square cork texture",
    }
    pinDatetimePlusTwo = dayjs(testPinParams.datetime).add(2, "hours");
    pin = new Pin(testPinParams);
});

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
    const pin = new Pin(testPinParams)
    expect(pin._datetimePlusTwoHours).toStrictEqual(pinDatetimePlusTwo);
});

test("Pin.atcb{Start,End}{Date,Time} return atcb-compatible & correct values", () => {
    const expected: {[key:string]: string} = {
        atcbStartDate: `1981-04-18`,
        atcbEndDate: `1981-04-18`,
        atcbStartTime: pad(10 + utcToLocaleModifier) + ":00",
        atcbEndTime: pad(12 + utcToLocaleModifier) + ":00"
    }

    Object.keys(expected).forEach((key: string) => {
        expect(pin[key]).toStrictEqual(expected[key])
    });
});

test("localDatetimeValue returns this.datetime in the correct format and adjusted for local timezone", () => {
    //expect(pin.localdatetimeValue).toBe(`1981-04-18T21:00`)
    const number = pad(10 + 2);
    expect(pin.localdatetimeValue).toBe(`1981-04-18T${number}:00`)
});

describe("thumbnailPath...", () => {
    test("returns undefined if thumbnail is undefined", () => {
        const params = testPinParams;
        params.thumbnail = undefined;
        expect(new Pin(params).thumbnail).toBeUndefined();
    }); 
    test("returns thumbnail if the thumbnail is an url (includes /)", () => {
        
        /*const params = testPinParams;
        params.thumbnail = undefined;
        expect(new Pin(params).thumbnail).toBeUndefined();
        */
    }); 
    test("returns PUBLIC_UPLOADS_PATH + thumbnail if thumbnail is a filename (does not include /)", () => {}); 
});