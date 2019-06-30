import { mount } from "enzyme";
import { ApolloConsumer } from "react-apollo";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import AddToCart, { ADD_TO_CART_MUTATION } from "../components/AddToCart";
import { CURRENT_USER_QUERY } from "../components/User";
import { fakeUser, fakeCartItem } from "../lib/testUtils";

const mocks = [
	{
		request: { query: CURRENT_USER_QUERY },
		result: { data: { me: { ...fakeUser(), cart: [] } } },
	},
	{
		request: { query: ADD_TO_CART_MUTATION, variables: { id: "abc123" } },
		result: { data: { addToCart: { ...fakeCartItem(), quantity: 1 } } },
	},
	{
		request: { query: CURRENT_USER_QUERY },
		result: { data: { me: { ...fakeUser(), cart: [fakeCartItem()] } } },
	},
];

describe("<AddToCart/>", () => {
	it("renders and matches the snapshot", async () => {
		const wrapper = mount(
			<MockedProvider mocks={mocks}>
				<AddToCart item={{ id: "abc123" }} />
			</MockedProvider>
		);

		await wait();
		wrapper.update();
		expect(toJSON(wrapper.find("button"))).toMatchSnapshot();
	});

	it("adds an item to the cart when clicked", async () => {
		let apolloClient;
		const wrapper = mount(
			<MockedProvider mocks={mocks}>
				<ApolloConsumer>
					{client => {
						apolloClient = client;
						return <AddToCart item={{ id: "abc123" }} />;
					}}
				</ApolloConsumer>
			</MockedProvider>
		);

		await wait();
		wrapper.update();

		const {
			data: { me },
		} = await apolloClient.query({ query: CURRENT_USER_QUERY });

		expect(me.cart).toHaveLength(0);

		// add an item to the cart
		wrapper.find("button").simulate("click");
		await wait();

		// check if the item is in the cart
		const {
			data: { me: meWithItem },
		} = await apolloClient.query({ query: CURRENT_USER_QUERY });

		expect(meWithItem.cart).toHaveLength(1);
		expect(meWithItem.cart[0].id).toBe("omg123");
		expect(meWithItem.cart[0].quantity).toBe(3);
	});

	it('changes from "add" to "adding" while loading', async () => {
		const wrapper = mount(
			<MockedProvider mocks={mocks}>
				<AddToCart item={{ id: "abc123" }} />
			</MockedProvider>
		);

		await wait();
		wrapper.update();
		const button = wrapper.find("button");
		expect(button.text()).toContain("Add to cart");
		button.simulate("click");
		expect(button.text()).toContain("Adding to cart");
	});
});
