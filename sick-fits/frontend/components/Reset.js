import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User.js";

const RESET_MUTATION = gql`
	mutation RESET_MUTATION(
		$resetToken: String!
		$newPassword: String!
		$confirmPassword: String!
	) {
		resetPassword(
			resetToken: $resetToken
			newPassword: $newPassword
			confirmPassword: $confirmPassword
		) {
			id
			email
			name
		}
	}
`;

class Reset extends Component {
	static propTypes = { resetToken: PropTypes.string.isRequired };

	state = {
		password: "",
		confirmPassword: "",
	};

	saveToState = ({ target }) => this.setState({ [target.name]: target.value });

	render() {
		return (
			<Mutation
				mutation={RESET_MUTATION}
				variables={{
					newPassword: this.state.password,
					confirmPassword: this.state.confirmPassword,
					resetToken: this.props.resetToken,
				}}
				refetchQueries={[{ query: CURRENT_USER_QUERY }]}
			>
				{(reset, { error, loading, called }) => {
					return (
						// set method to post. If your JS breaks, it would default to a get, and send the user's password
						// as a GET request. This could end up in server logs or in the user's history and is insecure
						<Form
							method="post"
							onSubmit={async e => {
								e.preventDefault();
								await reset();
								this.setState({ password: "", confirmPassword: "" });
							}}
						>
							<fieldset disabled={loading} aria-busy={loading}>
								<h2>Reset your password</h2>
								<Error error={error} />
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
								<label htmlFor="confirmPassword">
									Confirm Password
									<input
										type="password"
										name="confirmPassword"
										placeholder="confirmPassword"
										value={this.state.confirmPassword}
										onChange={this.saveToState}
									/>
								</label>
								<button type="submit">Reset Password</button>
							</fieldset>
						</Form>
					);
				}}
			</Mutation>
		);
	}
}

export default Reset;
