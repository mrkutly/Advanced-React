import formatMoney from "../lib/formatMoney";

describe("formatMoney", () => {
	it("works with fractions", () => {
		expect(formatMoney(1)).toEqual("$0.01");
		expect(formatMoney(10)).toEqual("$0.10");
		expect(formatMoney(9)).toEqual("$0.09");
		expect(formatMoney(99)).toEqual("$0.99");
		expect(formatMoney(40)).toEqual("$0.40");
	});

	it("leaves cents off for whole dollars", () => {
		expect(formatMoney(1000)).toEqual("$10");
		expect(formatMoney(100)).toEqual("$1");
		expect(formatMoney(7900)).toEqual("$79");
		expect(formatMoney(790000)).toEqual("$7,900");
		expect(formatMoney(79000000)).toEqual("$790,000");
		expect(formatMoney(7900000000)).toEqual("$79,000,000");
	});

	it("works with with whole and fractional dollars", () => {
		expect(formatMoney(150)).toEqual("$1.50");
		expect(formatMoney(751)).toEqual("$7.51");
		expect(formatMoney(75100012)).toEqual("$751,000.12");
		expect(formatMoney(702)).toEqual("$7.02");
		expect(formatMoney(1203981238745876)).toEqual("$12,039,812,387,458.76");
	});
});
