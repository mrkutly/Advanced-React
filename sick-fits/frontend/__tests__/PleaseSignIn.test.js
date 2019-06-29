import { mount } from "enzyme";
import wait from "waait";
import PleaseSignIn from "../components/PleaseSignIn";
import { CURRENT_USER_QUERY } from "../components/User";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser } from "../lib/testUtils";

const notSignedInMocks = [
	{
		request: { query: CURRENT_USER_QUERY },
		result: { data: { me: null } },
	},
];
const signedInMocks = [
	{
		request: { query: CURRENT_USER_QUERY },
		result: { data: { me: fakeUser() } },
	},
];

describe("<PleaseSignIn />", () => {
	it("renders the please sign in dialogue to logged out users", async () => {
		const wrapper = mount(
			<MockedProvider mocks={notSignedInMocks}>
				<PleaseSignIn />
			</MockedProvider>
		);
		// ? update from the loading screen to when the query has resolved
		await wait();
		wrapper.update();

		expect(wrapper.text()).toContain("Please sign in before continuing");
		expect(wrapper.find("SignIn").exists()).toBe(true);
	});

	it("renders the child components when the user is signed in", async () => {
		// ? this is a child component for testing
		const Hey = () => <p>Hey! You're signed in!</p>;
		const wrapper = mount(
			<MockedProvider mocks={signedInMocks}>
				<PleaseSignIn>
					<Hey />
				</PleaseSignIn>
			</MockedProvider>
		);
		await wait();
		wrapper.update();

		expect(wrapper.contains(<Hey />)).toBe(true);
	});
});
