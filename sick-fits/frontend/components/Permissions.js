import { Query } from "react-apollo";
import gql from "graphql-tag";
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
											<th>{perm}</th>
										))}
										<th>&#x2193;</th>
									</tr>
								</thead>
								<tbody>
									{data.users.map(user => (
										<User user={user} />
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

class User extends React.Component {
	render() {
		const { user } = this.props;

		return (
			<tr>
				<td>{user.name}</td>
				<td>{user.email}</td>
				{permissionTypes.map(perm => (
					<td>
						<label htmlFor={`${user.id}-permission-${perm}`}>
							<input type="checkbox" />
						</label>
					</td>
				))}
				<td>
					<SickButton>Update</SickButton>
				</td>
			</tr>
		);
	}
}
