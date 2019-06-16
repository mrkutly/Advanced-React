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
											<th key={perm}>{perm}</th>
										))}
										<th>&#x2193;</th>
									</tr>
								</thead>
								<tbody>
									{data.users.map(user => (
										<User key={user.email} user={user} />
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
	state = {
		permissions: {
			ADMIN: this.props.user.permissions.includes("ADMIN"),
			USER: this.props.user.permissions.includes("USER"),
			ITEMCREATE: this.props.user.permissions.includes("ITEMCREATE"),
			ITEMUPDATE: this.props.user.permissions.includes("ITEMUPDATE"),
			ITEMDELETE: this.props.user.permissions.includes("ITEMDELETE"),
			PERMISSIONUPDATE: this.props.user.permissions.includes(
				"PERMISSIONUPDATE"
			),
		},
	};

	updatePermissions = ({ target, checked }) => {
		this.setState(prevState => ({
			permissions: {
				...prevState.permissions,
				[target.name]: target.checked,
			},
		}));
	};

	render() {
		const { user } = this.props;
		console.log(this.state);

		return (
			<tr>
				<td>{user.name}</td>
				<td>{user.email}</td>
				{permissionTypes.map(perm => (
					<td key={perm}>
						<label htmlFor={`${user.id}-permission-${perm}`}>
							<input
								type="checkbox"
								checked={this.state.permissions[perm]}
								name={perm}
								onChange={this.updatePermissions}
							/>
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
