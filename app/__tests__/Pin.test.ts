import { WEBSITE_LOCALE } from "../conf";
import { pad, Pin, IPinParameters } from "../Pin";
// Find better solution for dayjs than copy pasting the import & setup from Pin?
import dayjs, { UnitType } from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";

require(`dayjs/locale/${WEBSITE_LOCALE}`);
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.locale(WEBSITE_LOCALE)


const datetime: {[key: string]: number} = {
    year: 1938,
    month: 1,
    date: 2,
    hours: 0,
    minutes: 0
}

const pinParameters: IPinParameters = {
    title: "Example",
    description: "Example description!",
    datetime: dayjs(`${datetime.year}-${pad(datetime.month)}-${pad(datetime.date)}T${pad(datetime.hours)}:${pad(datetime.minutes)}Z`),
    location: "New York",
    postedBy: "Cat",
    thumbnail: "https://raw.githubusercontent.com/Denperidge/community-pinboard/9399721d5f731706e78b94cbf7ba3c4998af6272/public/images/cork.jpg",
    thumbnailImageDescr: "A square cork texture",
}
const stringParameters = ["title", "description", "location", "postedBy", "thumbnail", "thumbnailImageDescr"]
const datetimeParameters = ["year", "month", "date", "hours", "minutes"]

test("Pad pads when it needs to pad", () => {
    expect(pad(2)).toBe("02");
    expect(pad(20)).toBe("20");
    expect(pad(0)).toBe("00");
});

test("Pin constructor", () => {
    const pin = new Pin(pinParameters);
    stringParameters.forEach((param) => {
        expect(pin[param]).toBeDefined();
        expect(pin[param]).toBe(pinParameters[param]);
    })

    datetimeParameters.forEach((param) => {
        expect(pin.datetime.get(param as UnitType)).toBeDefined()
        // Adjust month index!
        expect(pin.datetime.get(param as UnitType)).toBe(param == "month" ? datetime[param] - 1 : datetime[param]);
    });

    
    //expect(pin.title).toBe(pinParameters["title"])
})
