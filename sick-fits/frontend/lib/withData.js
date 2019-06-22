import withApollo from "next-with-apollo";
import ApolloClient from "apollo-boost";
import { endpoint } from "../config";
import { LOCAL_STATE_QUERY } from "../components/Cart";

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

		// this is your local (client-side) data
		clientState: {
			// these are the resolvers to update state
			resolvers: {
				Mutation: {
					// we don't need the first arg
					// the third arg is the apollo client, but we just need the cache
					toggleCart(_, variables, { cache }) {
						// read the cart open value from the cache
						const { cartOpen } = cache.readQuery({
							query: LOCAL_STATE_QUERY,
						});
						// write the toggle the cart state back to the cache
						const data = {
							data: {
								cartOpen: !cartOpen,
							},
						};
						cache.writeData(data);
						return data;
					},
				},
			},
			// this is your initial state
			defaults: {
				cartOpen: false,
			},
		},
	});
}

// This returns a HOC that takes in your App component as an argument and exposes the Apollo Client to it.
export default withApollo(createClient);
