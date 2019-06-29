import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import Router from "next/router";
import wait from "waait";
import Pagination, { PAGINATION_QUERY } from "../components/Pagination";
import { MockedProvider } from "react-apollo/test-utils";

function makeMocksFor(length) {
	return [
		{
			request: { query: PAGINATION_QUERY },
			result: {
				data: {
					itemsConnection: {
						__typename: "aggregate",
						aggregate: {
							__typename: "count",
							count: length,
						},
					},
				},
			},
		},
	];
}

// ? mock the router for the pagination since the pagination component has
// ? links that prefetch

Router.router = {
	push: () => {},
	prefetch: () => {},
};

describe("<Pagination />", () => {
	it("displays a loading message", () => {
		const wrapper = mount(
			<MockedProvider mocks={makeMocksFor(1)}>
				<Pagination page={1} />
			</MockedProvider>
		);
		const loading = wrapper.find("p");
		expect(loading.text()).toContain("Loading...");
		expect(toJSON(loading)).toMatchSnapshot();
	});

	it("renders pagination for 18 items", async () => {
		const wrapper = mount(
			<MockedProvider mocks={makeMocksFor(18)}>
				<Pagination page={1} />
			</MockedProvider>
		);
		await wait();
		wrapper.update();
		expect(wrapper.find("span.total-pages").text()).toEqual("5");

		const pagination = wrapper.find('div[data-test="pagination"]');
		expect(toJSON(pagination)).toMatchSnapshot();
	});

	it("disables previous button on first page", async () => {
		const wrapper = mount(
			<MockedProvider mocks={makeMocksFor(18)}>
				<Pagination page={1} />
			</MockedProvider>
		);
		await wait();
		wrapper.update();
		const prevBtn = wrapper.find("a.prev");
		expect(prevBtn.prop("aria-disabled")).toEqual(true);
		const nextBtn = wrapper.find("a.next");
		expect(nextBtn.prop("aria-disabled")).toEqual(false);
	});

	it("disables next button on last page", async () => {
		const wrapper = mount(
			<MockedProvider mocks={makeMocksFor(18)}>
				<Pagination page={5} />
			</MockedProvider>
		);
		await wait();
		wrapper.update();
		const prevBtn = wrapper.find("a.prev");
		expect(prevBtn.prop("aria-disabled")).toEqual(false);
		const nextBtn = wrapper.find("a.next");
		expect(nextBtn.prop("aria-disabled")).toEqual(true);
	});

	it("enables previous and next buttons on middle pages", async () => {
		const wrapper = mount(
			<MockedProvider mocks={makeMocksFor(18)}>
				<Pagination page={2} />
			</MockedProvider>
		);
		await wait();
		wrapper.update();
		const prevBtn = wrapper.find("a.prev");
		expect(prevBtn.prop("aria-disabled")).toEqual(false);
		const nextBtn = wrapper.find("a.next");
		expect(nextBtn.prop("aria-disabled")).toEqual(false);
	});
});
