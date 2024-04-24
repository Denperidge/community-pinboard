import { WEBSITE_LOCALE, WEBSITE_TIMEZONE } from "../conf";
import { pad, Pin, IPinParameters, IPinDatetime } from "../Pin";
// Find better solution for dayjs than copy pasting the import & setup from Pin?
import dayjs, { UnitType } from "dayjs";
import timezone from "dayjs/plugin/timezone"

require(`dayjs/locale/${WEBSITE_LOCALE}`);
dayjs.extend(timezone);
dayjs.locale(WEBSITE_LOCALE)


const testDatetime: IPinDatetime = {
    year: 1938,
    month: 1,
    date: 2,
    hours: 0,
    minutes: 0
}

const pinParameters: IPinParameters = {
    title: "Example",
    description: "Example description!",
    datetime: dayjs(`${testDatetime.year}-${pad(testDatetime.month)}-${pad(testDatetime.date)}T${pad(testDatetime.hours)}:${pad(testDatetime.minutes)}Z`),
    location: "New York",
    postedBy: "Cat",
    thumbnail: "https://raw.githubusercontent.com/Denperidge/community-pinboard/9399721d5f731706e78b94cbf7ba3c4998af6272/public/images/cork.jpg",
    thumbnailImageDescr: "A square cork texture",
}
const stringParameters = ["title", "description", "location", "postedBy", "thumbnail", "thumbnailImageDescr"]
const testDatetimeParams = ["year", "month", "date", "hours", "minutes"]

let pin: Pin;

beforeEach(() => {
    pin = new Pin(pinParameters);
})

test("Pad pads when it needs to pad", () => {
    expect(pad(2)).toBe("02");
    expect(pad(20)).toBe("20");
    expect(pad(0)).toBe("00");
});

test("Pin constructor", () => {
    stringParameters.forEach((param) => {
        expect(pin[param]).toBeDefined();
        expect(pin[param]).toBe(pinParameters[param]);
    })

    testDatetimeParams.forEach((param) => {
        expect(pin.datetime.get(param as UnitType)).toBeDefined()
        // Adjust month index!
        expect(pin.datetime.get(param as UnitType)).toBe(param == "month" ? testDatetime[param] - 1 : testDatetime[param]);
    });
});

test("Pin utc & local", () => {
    // UTC
    testDatetimeParams.forEach((param: keyof IPinDatetime) => {
        expect(pin.utc[param]).toBe(testDatetime[param])
    });


    // Local
    const utcToLocaleModifier = new Date().getTimezoneOffset() / 60 * -1;
    if (utcToLocaleModifier == 0) {
        throw new Error("Error, difference between UTC and local timezone (configured through TZ env) is 0 hours. Please run this test with TZ set differently (see README.md)")
    }
    testDatetimeParams.forEach((param: keyof IPinDatetime) => {
        console.log(pin.local[param], param)
        expect(pin.local[param]).toBe(param == "hours" ? testDatetime[param] + utcToLocaleModifier : testDatetime[param])
    });
})