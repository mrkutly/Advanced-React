import App, { Container } from "next/app";
import Page from "../components/Page";
import { ApolloProvider } from "react-apollo";
import withData from "../lib/withData";

class MyApp extends App {
	// See more examples of getInitialProps in the Apollo or Next.js docs
	// getInitialProps is a Next.js lifecycle method that runs before the first render
	// By returning pageProps, we make them available in the first render
	static async getInitialProps({ Component, ctx }) {
		let pageProps = {};
		// This block crawls the page to see if there are any mutations or queries that need to be run before render
		// It fires them before rendering and then returns that data into pageProps
		if (Component.getInitialProps) {
			pageProps = await Component.getInitialProps(ctx);
		}
		// this exposes the query to the user
		pageProps.query = ctx.query;
		return { pageProps };
	}

	render() {
		const { Component, apollo, pageProps } = this.props;

		return (
			<Container>
				<ApolloProvider client={apollo}>
					<Page>
						<Component {...pageProps} />
					</Page>
				</ApolloProvider>
			</Container>
		);
	}
}

// withData is a HOC that exposes our application to the Apollo Client
export default withData(MyApp);
