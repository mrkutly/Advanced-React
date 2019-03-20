import withApollo from "next-with-apollo";
import ApolloClient from "apollo-boost";
import { endpoint } from "../config";

function createClient({ headers }) {
	return new ApolloClient({
		// pass your server endpoint
		uri: process.env.NODE_ENV === "development" ? endpoint : endpoint,

		// this is the middleware that tells it to send auth cookies
		request: operation => {
			operation.setContext({
				fetchOptions: {
					credentials: "include",
				},
				headers,
			});
		},
	});
}

// This returns a HOC that takes in your App component as an argument and exposes the Apollo Client to it.
export default withApollo(createClient);
