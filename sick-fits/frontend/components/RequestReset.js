import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";

const REQUEST_RESET_MUTATION = gql`
	mutation REQUEST_RESET_MUTATION($email: String!) {
		requestReset(email: $email) {
			message
		}
	}
`;

class SignIn extends Component {
	state = {
		email: "",
	};

	saveToState = ({ target }) => this.setState({ [target.name]: target.value });

	render() {
		return (
			<Mutation mutation={REQUEST_RESET_MUTATION} variables={this.state}>
				{(reset, { error, loading, called }) => {
					return (
						// set method to post. If your JS breaks, it would default to a get, and send the user's password
						// as a GET request. This could end up in server logs or in the user's history and is insecure
						<Form
							method="post"
							onSubmit={async e => {
								e.preventDefault();
								await reset();
								this.setState({ email: "" });
							}}
						>
							<fieldset disabled={loading} aria-busy={loading}>
								<h2>Request Password Reset</h2>
								<Error error={error} />
								{!error && !loading && called && (
									<p>
										Success! Check your email for a link to reset your password.
									</p>
								)}
								<label htmlFor="email">
									Email
									<input
										type="email"
										name="email"
										placeholder="email"
										value={this.state.email}
										onChange={this.saveToState}
									/>
								</label>
								<button type="submit">Request Reset</button>
							</fieldset>
						</Form>
					);
				}}
			</Mutation>
		);
	}
}

export default SignIn;
