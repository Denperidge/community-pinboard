import { WEBSITE_LOCALE } from "../conf";
import { pad, Pin, IPinParameters } from "../Pin";
// Find better solution for dayjs than copy pasting the import & setup from Pin?
import dayjs, { UnitType } from "dayjs";
import timezone from "dayjs/plugin/timezone"

let pin: Pin;
const testPinParams: IPinParameters = {
    title: "Example",
    description: "Example description!",
    datetime: "1938-01-02T00:00-05:00",
    location: "New York",
    postedBy: "Cat",
    thumbnail: "https://raw.githubusercontent.com/Denperidge/community-pinboard/9399721d5f731706e78b94cbf7ba3c4998af6272/public/images/cork.jpg",
    thumbnailImageDescr: "A square cork texture",
}
const pinStringParams = ["title", "description", "location", "postedBy", "thumbnail", "thumbnailImageDescr"]

const nowPlusTwoHours = new Date();
nowPlusTwoHours.setHours(nowPlusTwoHours.getHours() + 2)

beforeEach(() => {
    pin = new Pin(testPinParams);
})

test("Pad pads when it needs to pad", () => {
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

test("Pin.asObject()", () => {
    const expectedProperties = testPinParams;
    expectedProperties.datetime = new Date(expectedProperties.datetime).toISOString();
    expect(pin.asObject()).toStrictEqual(expectedProperties);

})

test("Pin.filename()", () => {
    expect(pin.filename()).toStrictEqual(pin.title + ".json")
});

test("Pin.elapsed(): true & false", () => {
    // elapsed: true
    expect(pin.elapsed()).toStrictEqual(true);

    // elapsed: false
    const expectedProperties = testPinParams;
    expectedProperties.datetime = nowPlusTwoHours;
    expect(new Pin(expectedProperties).elapsed()).toStrictEqual(false);
});

test("Pin._datetimePlusTwoHours", () => {
    const expectedDatetime = new Date(testPinParams.datetime);
    expectedDatetime.setHours( expectedDatetime.getHours() + 2);
    expect(pin._datetimePlusTwoHours).toStrictEqual(expectedDatetime);
});
