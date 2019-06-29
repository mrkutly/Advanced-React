import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import SingleItem, { SINGLE_ITEM_QUERY } from "../components/SingleItem";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeItem } from "../lib/testUtils";

describe("<SingleItem />", () => {
	it("renders with proper data", async () => {
		const mocks = [
			// when someone makes a request with this query and variable combo,
			{
				request: { query: SINGLE_ITEM_QUERY, variables: { id: "123" } },
				// return this mock data
				result: { data: { item: fakeItem() } },
			},
		];
		// use the MockedProvider to send that mock data to your component
		const wrapper = mount(
			<MockedProvider mocks={mocks}>
				<SingleItem id={"123"} />
			</MockedProvider>
		);

		expect(wrapper.text()).toContain("Loading...");
		// ? wait puts the next line of code on the end of the call stack
		// ? this allows you to place the wrapper.update() after the Query has resolved
		await wait();
		wrapper.update();

		expect(toJSON(wrapper.find("h2"))).toMatchSnapshot();
		expect(toJSON(wrapper.find("img"))).toMatchSnapshot();
		expect(toJSON(wrapper.find("p"))).toMatchSnapshot();
	});

	it("Errors out with a not found item", async () => {
		const mocks = [
			{
				request: { query: SINGLE_ITEM_QUERY, variables: { id: "notarealid" } },
				// you can also use mocks to specify the errors that get thrown
				result: {
					errors: [{ message: "Item not found" }],
				},
			},
		];
		const wrapper = mount(
			<MockedProvider mocks={mocks}>
				<SingleItem id={"notarealid"} />
			</MockedProvider>
		);

		await wait();
		wrapper.update();
		const error = wrapper.find('[data-test="graphql-error"]');
		expect(error.text()).toContain("Item not found");
		expect(toJSON(error)).toMatchSnapshot();
	});
});
