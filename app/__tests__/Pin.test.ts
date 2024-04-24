import { pad } from "../Pin";


test("Pad pads when it needs to pad", () => {
    expect(pad(2)).toBe("02");
    expect(pad(20)).toBe("20");
    expect(pad(0)).toBe("00");
});

/*test("Pin constructor", () => {
    expect()
})*/
