import React, { Component } from "react";
import gql from "graphql-tag";
import { Mutation, Query } from "react-apollo";
import Router from "next/router";
import Form from "./styles/Form";
import formatMoney from "../lib/formatMoney";
import Error from "./ErrorMessage";

const SINGLE_ITEM_QUERY = gql`
	query SINGLE_ITEM_QUERY($id: ID!) {
		item(where: { id: $id }) {
			id
			title
			description
			price
		}
	}
`;

const UPDATE_ITEM_MUTATION = gql`
	# here, we tell our mutation to expect typed args
	mutation UPDATE_ITEM_MUTATION(
		$id: ID!
		$title: String
		$description: String
		$price: Int
	) {
		# Now we are calling the createItem mutation from our schema.graphql in our backend,
		# using the variables passed in above. GQL variables are used like bash variables (with the $)
		updateItem(
			id: $id
			title: $title
			description: $description
			price: $price
		) {
			# after the item is created, we return the id
			id
			title
			description
			price
		}
	}
`;

class UpdateItem extends Component {
	state = {};

	handleChange = e => {
		const { type, value, name } = e.target;
		const val = type === "number" ? parseFloat(value) : value;
		this.setState({ [name]: val });
	};

	updateItem = async (e, updateItemMutation) => {
		e.preventDefault();

		const res = await updateItemMutation({
			variables: {
				id: this.props.id,
				...this.state,
			},
		});
	};

	render() {
		// const { title, description, image, largeImage, price } = this.state;
		// To use our UPDATE_ITEM_MUTATION in our form, we wrap our entire form in a Mutation component
		// The Mutation components only child will be a function, just like the Query Components
		// This function takes in the args of the mutation and the payload (loading, error, called, and data)
		// Fun: loading is a boolean that Apollo flips on and off for us, so we can use it for our loading state
		//  Then, by wrapping all of your jsx in this function, the mutation is now exposed to your form! YAY!
		return (
			<Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
				{({ data, loading }) => {
					if (loading) return <p>Loading...</p>;
					if (!data.item) return <p>No item found</p>;
					return (
						<Mutation mutation={UPDATE_ITEM_MUTATION}>
							{(updateItem, { loading, error }) => (
								<Form onSubmit={e => this.updateItem(e, updateItem)}>
									<Error error={error} />
									<fieldset disabled={loading} aria-busy={loading}>
										<label htmlFor="title">
											Title
											<input
												type="text"
												id="title"
												name="title"
												defaultValue={data.item.title}
												placeholder="Title"
												onChange={this.handleChange}
												required
											/>
										</label>

										<label htmlFor="price">
											Price
											<input
												type="number"
												id="price"
												name="price"
												defaultValue={data.item.price}
												placeholder="Price"
												onChange={this.handleChange}
												required
											/>
										</label>

										<label htmlFor="description">
											Description
											<textarea
												type="text"
												id="description"
												name="description"
												defaultValue={data.item.description}
												placeholder="Enter a description"
												onChange={this.handleChange}
												required
											/>
										</label>
										<button type="submit">
											Sav{loading ? "ing" : "e"} Changes
										</button>
									</fieldset>
								</Form>
							)}
						</Mutation>
					);
				}}
			</Query>
		);
	}
}

export default UpdateItem;
export { UPDATE_ITEM_MUTATION };
