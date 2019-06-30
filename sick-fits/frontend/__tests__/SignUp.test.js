import { ApolloConsumer } from "react-apollo";
import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import SignUp, { SIGNUP_MUTATION } from "../components/SignUp";
import { CURRENT_USER_QUERY } from "../components/User";
import { fakeUser } from "../lib/testUtils";

const me = fakeUser();
const mocks = [
	// signUp mock
	{
		request: {
			query: SIGNUP_MUTATION,
			variables: {
				name: me.name,
				email: me.email,
				password: "doggies",
			},
		},
		result: {
			data: {
				signup: {
					__typename: "User",
					id: "abc123",
					email: me.email,
					name: me.name,
				},
			},
		},
	},
	// currentUser mock
	{
		request: {
			query: CURRENT_USER_QUERY,
		},
		result: {
			data: { me },
		},
	},
];

describe("<SignUp/>", () => {
	it("renders and matches snapshot", () => {
		const wrapper = mount(
			<MockedProvider>
				<SignUp />
			</MockedProvider>
		);
		expect(toJSON(wrapper.find('form[data-test="form"]'))).toMatchSnapshot();
	});

	it("calls the signup mutation", async () => {
		let apolloClient;

		// doing this allows us to reach into the apollo client's
		// store to grab the current user
		const wrapper = mount(
			<MockedProvider mocks={mocks}>
				<ApolloConsumer>
					{client => {
						apolloClient = client;
						return <SignUp />;
					}}
				</ApolloConsumer>
			</MockedProvider>
		);
		await wait();
		wrapper.update();
		type({ wrapper, name: "name", value: me.name });
		type({ wrapper, name: "email", value: me.email });
		type({ wrapper, name: "password", value: "doggies" });
		wrapper.update();

		wrapper.find("form").simulate("submit");
		await wait();
		// now we can query the user out of the apollo client
		const user = await apolloClient.query({ query: CURRENT_USER_QUERY });
		expect(user.data.me).toMatchObject(me);
	});
});

function type({ wrapper, name, value }) {
	wrapper
		.find(`input[name="${name}"]`)
		.simulate("change", { target: { name, value } });
}
