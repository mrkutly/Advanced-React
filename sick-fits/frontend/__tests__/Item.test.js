import Item from "../components/Item";
import { shallow } from "enzyme";
import toJSON from "enzyme-to-json";

const fakeItem = {
	id: "ABC123",
	title: "A cool item",
	price: 1500,
	description: "This item rips!",
	image: "dog.jpg",
	largeImage: "large-dog.jpg",
};

describe("<Item />", () => {
	it("renders and matches the snapshot", () => {
		const wrapper = shallow(<Item item={fakeItem} />);
		expect(toJSON(wrapper)).toMatchSnapshot();
	});

	it("renders and displays the price and title", () => {
		const wrapper = shallow(<Item item={fakeItem} />);
		const PriceTag = wrapper.find("PriceTag");

		// ? .dive() shallow renders a component
		// ? this allows you to shallow render one level deeper for a specific
		// ? child of the component that you are shallow rendering
		expect(PriceTag.dive().text()).toBe("$15");

		// ? .find() can take in multiple selectors to allow you to traverse your
		// ? component tree
		expect(wrapper.find("Title a").text()).toBe(fakeItem.title);
	});

	it("renders an image", () => {
		const wrapper = shallow(<Item item={fakeItem} />);
		const image = wrapper.find("img");

		expect(image.props().src).toBe(fakeItem.image);
		expect(image.props().alt).toBe(fakeItem.title);
	});

	it("renders the buttons", () => {
		const wrapper = shallow(<Item item={fakeItem} />);
		const buttonList = wrapper.find(".buttonList");

		expect(buttonList.children()).toHaveLength(3);
		expect(buttonList.find("Link")).toHaveLength(1);
		expect(buttonList.find("DeleteItem")).toHaveLength(1);
		expect(buttonList.find("AddToCart")).toHaveLength(1);
	});
});
