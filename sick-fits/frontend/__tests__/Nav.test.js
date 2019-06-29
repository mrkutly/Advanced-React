import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import Nav from "../components/Nav";
import { CURRENT_USER_QUERY } from "../components/User";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser, fakeCartItem } from "../lib/testUtils";

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
const signedInMocksWithCart = [
	{
		request: { query: CURRENT_USER_QUERY },
		result: { data: { me: { ...fakeUser(), cart: [fakeCartItem()] } } },
	},
];

describe("<Nav />", () => {
	it("renders a minimal nav when the user is signed out", async () => {
		const wrapper = mount(
			<MockedProvider mocks={notSignedInMocks}>
				<Nav />
			</MockedProvider>
		);

		await wait();
		wrapper.update();

		const nav = wrapper.find('[data-test="nav-test"]');
		const navLinks = nav.find("Link");
		expect(navLinks).toHaveLength(2);
		expect(toJSON(navLinks)).toMatchSnapshot();
	});

	it("renders a full nav when the user is signed in", async () => {
		const wrapper = mount(
			<MockedProvider mocks={signedInMocks}>
				<Nav />
			</MockedProvider>
		);

		await wait();
		wrapper.update();

		const nav = wrapper.find('[data-test="nav-test"]');
		const navLinks = nav.find("Link");
		expect(navLinks).toHaveLength(4);
		expect(toJSON(navLinks)).toMatchSnapshot();
		const navLinksText = nav.find("ul").text();
		expect(navLinksText).toContain("Sign Out");
		expect(navLinksText).toContain("Shop");
		expect(navLinksText).toContain("Sell");
		expect(navLinksText).toContain("Orders");
	});

	it("renders the amount of items in the cart", async () => {
		const wrapper = mount(
			<MockedProvider mocks={signedInMocksWithCart}>
				<Nav />
			</MockedProvider>
		);

		await wait();
		wrapper.update();

		const count = wrapper.find('[data-test="nav-test"] div.count');
		expect(count.text()).toBe("3");
		expect(toJSON(count)).toMatchSnapshot();
	});
});
