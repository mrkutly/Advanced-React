import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const SIGNIN_MUTATION = gql`
	mutation SIGNIN_MUTATION($email: String!, $password: String!) {
		signin(email: $email, password: $password) {
			id
			email
		}
	}
`;

class SignIn extends Component {
	state = {
		password: "",
		email: "",
	};

	saveToState = ({ target }) => this.setState({ [target.name]: target.value });

	render() {
		return (
			<Mutation
				mutation={SIGNIN_MUTATION}
				variables={this.state}
				refetchQueries={[{ query: CURRENT_USER_QUERY }]}
			>
				{(signin, { error, loading }) => {
					return (
						// set method to post. If your JS breaks, it would default to a get, and send the user's password
						// as a GET request. This could end up in server logs or in the user's history and is insecure
						<Form
							method="post"
							onSubmit={async e => {
								e.preventDefault();
								await signin();
								this.setState({ name: "", email: "", password: "" });
							}}
						>
							<fieldset disabled={loading} aria-busy={loading}>
								<h2>Sign In</h2>
								<Error error={error} />
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
								<label htmlFor="password">
									Password
									<input
										type="password"
										name="password"
										placeholder="password"
										value={this.state.password}
										onChange={this.saveToState}
									/>
								</label>
								<button type="submit">Sign In</button>
							</fieldset>
						</Form>
					);
				}}
			</Mutation>
		);
	}
}

export default SignIn;
