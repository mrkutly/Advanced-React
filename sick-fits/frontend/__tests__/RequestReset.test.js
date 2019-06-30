import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { GraphQLError } from "graphql";
import { MockedProvider } from "react-apollo/test-utils";
import RequestReset, {
	REQUEST_RESET_MUTATION,
} from "../components/RequestReset";

const mocks = [
	{
		request: {
			query: REQUEST_RESET_MUTATION,
			variables: { email: "mark.sauer.utley@gmail.com" },
		},
		result: {
			data: {
				requestReset: {
					message: "success!",
					__typename: "message",
				},
			},
		},
	},
];

const errorMocks = [
	{
		request: {
			query: REQUEST_RESET_MUTATION,
			variables: { email: "not-real-email@gmail.com" },
		},
		result: {
			errors: [
				new GraphQLError("We do not have an account for that email address"),
			],
		},
	},
];

describe("<RequestReset />", () => {
	it("renders and matches snapshot", () => {
		const wrapper = mount(
			<MockedProvider>
				<RequestReset />
			</MockedProvider>
		);
		const form = wrapper.find('[data-test="form"]');
		expect(toJSON(form)).toMatchSnapshot();
	});

	it("calls the REQUEST_RESET_MUTATION", async () => {
		const wrapper = mount(
			<MockedProvider mocks={mocks}>
				<RequestReset />
			</MockedProvider>
		);

		// simulate typing an email
		wrapper.find("input").simulate("change", {
			target: { name: "email", value: "mark.sauer.utley@gmail.com" },
		});

		wrapper.find("form").simulate("submit");
		await wait(100);
		wrapper.update();

		expect(wrapper.find("p").text()).toContain(
			"Success! Check your email for a link to reset your password."
		);
	});

	it("displays an error when given an invalid email", async () => {
		const wrapper = mount(
			<MockedProvider mocks={errorMocks} addTypename={false}>
				<RequestReset />
			</MockedProvider>
		);

		wrapper.find("input").simulate("change", {
			target: { name: "email", value: "not-real-email@gmail.com" },
		});

		wrapper.find("form").simulate("submit");
		await wait(50);
		wrapper.update();

		const errorMessage = wrapper.find('[data-test="graphql-error"]');
		expect(errorMessage).toHaveLength(1);
		expect(errorMessage.text()).toContain(
			"We do not have an account for that email address"
		);
	});
});
