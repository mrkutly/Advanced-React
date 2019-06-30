import { mount } from "enzyme";
import { ApolloConsumer } from "react-apollo";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import RemoveFromCart, {
	REMOVE_FROM_CART_MUTATION,
} from "../components/RemoveFromCart";
import { CURRENT_USER_QUERY } from "../components/User";
import { fakeUser, fakeCartItem } from "../lib/testUtils";

const mocks = [
	{
		request: { query: CURRENT_USER_QUERY },
		result: {
			data: {
				me: {
					...fakeUser(),
					cart: [fakeCartItem({ id: "abc123" })],
				},
			},
		},
	},
	{
		request: { query: REMOVE_FROM_CART_MUTATION, variables: { id: "abc123" } },
		result: {
			data: { removeFromCart: { __typename: "CartItem", id: "abc123" } },
		},
	},
];

describe("<RemoveFromCart", () => {
	it("renders and matches snapshot", async () => {
		const wrapper = mount(
			<MockedProvider>
				<RemoveFromCart id="abc123" />
			</MockedProvider>
		);
		expect(toJSON(wrapper.find("button"))).toMatchSnapshot();
	});
	it("removes the item from the cart", async () => {
		let apolloClient;
		const wrapper = mount(
			<MockedProvider mocks={mocks}>
				<ApolloConsumer>
					{client => {
						apolloClient = client;
						return <RemoveFromCart id="abc123" />;
					}}
				</ApolloConsumer>
			</MockedProvider>
		);

		const res = await apolloClient.query({ query: CURRENT_USER_QUERY });
		const { cart } = res.data.me;
		expect(cart).toHaveLength(1);
		expect(cart[0].item.price).toBe(5000);

		wrapper.find("button").simulate("click");

		const res2 = await apolloClient.query({ query: CURRENT_USER_QUERY });
		const { cart: cart2 } = res2.data.me;
		expect(cart2).toHaveLength(0);
	});
});
