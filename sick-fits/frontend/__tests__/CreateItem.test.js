import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { GraphQLError } from "graphql";
import Router from "next/router";
import { MockedProvider } from "react-apollo/test-utils";
import CreateItem, { CREATE_ITEM_MUTATION } from "../components/CreateItem";
import { fakeItem } from "../lib/testUtils";

// mock the global fetch API to mimic uploading the image to cloudinary
// in CreateItem, we await fetch, then call .json() on the response
// that response is stored in a variable called 'file' which
// has a secure_url key and eager key
const dogImage = "https://www.dog.com/dog.jpg";
const largeDogImage = "https://www.dog.com/large-dog.jpg";
global.fetch = jest.fn().mockResolvedValue({
	json: () => ({
		secure_url: dogImage,
		eager: [{ secure_url: largeDogImage }],
	}),
});

describe("<CreateItem />", () => {
	it("renders and matches snapshot", () => {
		const wrapper = mount(
			<MockedProvider>
				<CreateItem />
			</MockedProvider>
		);

		const form = wrapper.find('form[data-test="form"]');
		expect(toJSON(form)).toMatchSnapshot();
	});

	it("uploads a file when changed", async () => {
		const wrapper = mount(
			<MockedProvider>
				<CreateItem />
			</MockedProvider>
		);

		const input = wrapper.find('input[type="file"]');
		input.simulate("change", { target: { files: ["fakedog.jpg"] } });
		await wait();
		// this gives us access to the component (state, props, all of it)
		const component = wrapper.find("CreateItem").instance();

		expect(component.state.image).toEqual(dogImage);
		expect(component.state.largeImage).toEqual(largeDogImage);
		expect(global.fetch).toHaveBeenCalled();
		global.fetch.mockReset();
	});

	it("handles state updating", async () => {
		const wrapper = mount(
			<MockedProvider>
				<CreateItem />
			</MockedProvider>
		);

		const testState = {
			title: "Test Title",
			price: 1000,
			description: "This is a lovely test item",
		};

		wrapper.find("#title").simulate("change", {
			target: { value: testState.title, name: "title" },
		});

		wrapper.find("#price").simulate("change", {
			target: { value: testState.price, name: "price", type: "number" },
		});

		wrapper.find("#description").simulate("change", {
			target: { value: testState.description, name: "description" },
		});

		expect(wrapper.find("CreateItem").instance().state).toMatchObject(
			testState
		);
	});

	it("creates an item when the form is submitted", async () => {
		const item = fakeItem();
		const mocks = [
			{
				request: {
					query: CREATE_ITEM_MUTATION,
					variables: {
						title: item.title,
						description: item.description,
						price: item.price,
						image: "",
						largeImage: "",
					},
				},
				result: {
					data: {
						createItem: {
							id: "abc123",
							...item,
							__typename: "Item",
						},
					},
				},
			},
		];

		const wrapper = mount(
			<MockedProvider mocks={mocks}>
				<CreateItem />
			</MockedProvider>
		);

		wrapper.find("#title").simulate("change", {
			target: { value: item.title, name: "title" },
		});

		wrapper.find("#price").simulate("change", {
			target: { value: item.price, name: "price", type: "number" },
		});

		wrapper.find("#description").simulate("change", {
			target: { value: item.description, name: "description" },
		});

		// now we need to mock the router because our site redirects to the
		// item's show page when the form is submitted
		Router.router = { push: jest.fn() };

		wrapper.find('form[data-test="form"]').simulate("submit");
		await wait(50);
		expect(Router.router.push).toHaveBeenCalledWith({
			pathname: "/item",
			query: { id: "abc123" },
		});
	});
});
