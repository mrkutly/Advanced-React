import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import Error from "./ErrorMessage";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";
import permissionTypes from "../lib/permissionTypes";

const ALL_USERS_QUERY = gql`
	query {
		users {
			id
			name
			email
			permissions
		}
	}
`;

const UPDATE_PERMISSIONS_MUTATION = gql`
	mutation updatePermissions($permissions: [Permission], $userId: ID!) {
		updatePermissions(permissions: $permissions, userId: $userId) {
			id
			permissions
			name
			email
		}
	}
`;

export default props => {
	return (
		<Query query={ALL_USERS_QUERY}>
			{({ data, loading, error }) =>
				console.log(data) || (
					<div>
						<Error error={error} />
						<div>
							<h2>Manage permissions</h2>
							<Table>
								<thead>
									<tr>
										<th>Name</th>
										<th>Email</th>
										{permissionTypes.map(perm => (
											<th key={perm}>{perm}</th>
										))}
										<th>&#x2193;</th>
									</tr>
								</thead>
								<tbody>
									{data.users.map(user => (
										<UserPermissions key={user.email} user={user} />
									))}
								</tbody>
							</Table>
						</div>
					</div>
				)
			}
		</Query>
	);
};

class UserPermissions extends React.Component {
	static propTypes = {
		user: PropTypes.shape({
			name: PropTypes.string,
			email: PropTypes.string,
			id: PropTypes.string,
			permissions: PropTypes.array,
		}).isRequired,
	};

	state = {
		permissions: this.props.user.permissions,
	};

	handlePermissionsChange = ({ target }) => {
		let updatedPermissions = [...this.state.permissions];

		if (target.checked) {
			updatedPermissions.push(target.value);
		} else {
			updatedPermissions = updatedPermissions.filter(
				perm => perm !== target.value
			);
		}

		this.setState({ permissions: updatedPermissions });
	};

	render() {
		const { user } = this.props;

		return (
			<Mutation
				mutation={UPDATE_PERMISSIONS_MUTATION}
				variables={{
					permissions: this.state.permissions,
					userId: this.props.user.id,
				}}
			>
				{(updatePermissions, { loading, error }) => (
					<>
						{error && <Error error={error} />}
						<tr>
							<td>{user.name}</td>
							<td>{user.email}</td>
							{permissionTypes.map(perm => (
								<td key={perm}>
									<label htmlFor={`${user.id}-permission-${perm}`}>
										<input
											id={`${user.id}-permission-${perm}`}
											type="checkbox"
											checked={this.state.permissions.includes(perm)}
											value={perm}
											onChange={this.handlePermissionsChange}
										/>
									</label>
								</td>
							))}
							<td>
								<SickButton
									type="button"
									disabled={loading}
									onClick={updatePermissions}
								>
									Updat{loading ? "ing" : "e"}
								</SickButton>
							</td>
						</tr>
					</>
				)}
			</Mutation>
		);
	}
}
