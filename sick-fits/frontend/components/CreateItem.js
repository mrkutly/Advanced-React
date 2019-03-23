import React, { Component } from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import Router from "next/router";
import Form from "./styles/Form";
import formatMoney from "../lib/formatMoney";
import Error from "./ErrorMessage";

const CREATE_ITEM_MUTATION = gql`
	# here, we tell our mutation to expect typed args
	mutation CREATE_ITEM_MUTATION(
		$title: String!
		$description: String!
		$image: String!
		$largeImage: String!
		$price: Int!
	) {
		# Now we are calling the createItem mutation from our schema.graphql in our backend,
		# using the variables passed in above. GQL variables are used like bash variables (with the $)
		createItem(
			title: $title
			description: $description
			image: $image
			largeImage: $largeImage
			price: $price
		) {
			# after the item is created, we return the id
			id
		}
	}
`;

class CreateItem extends Component {
	state = {
		title: "butt",
		description: "I am butt",
		image: "butt.jpg",
		largeImage: "bigbutt.jpg ",
		price: 0,
	};

	handleChange = e => {
		const { type, value, name } = e.target;
		const val = type === "number" ? parseFloat(value) : value;
		this.setState({ [name]: val });
	};

	render() {
		const { title, description, image, largeImage, price } = this.state;
		// To use our CREATE_ITEM_MUTATION in our form, we wrap our entire form in a Mutation component
		// The Mutation components only child will be a function, just like the Query Components
		// This function takes in the args of the mutation and the payload (loading, error, called, and data)
		// Fun: loading is a boolean that Apollo flips on and off for us, so we can use it for our loading state
		//  Then, by wrapping all of your jsx in this function, the mutation is now exposed to your form! YAY!
		return (
			<Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
				{(createItem, { loading, error }) => (
					<Form
						onSubmit={async e => {
							// Stop form from submitting
							e.preventDefault();
							// create the item
							const res = await createItem();
							// send them to single item page
							console.log(res);
							Router.push({
								pathname: "/item",
								query: { id: res.data.createItem.id },
							});
						}}
					>
						<Error error={error} />
						<fieldset disabled={loading} aria-busy={loading}>
							<label htmlFor="title">
								Title
								<input
									type="text"
									id="title"
									name="title"
									value={title}
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
									value={price}
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
									value={description}
									placeholder="Enter a description"
									onChange={this.handleChange}
									required
								/>
							</label>
							<button type="submit">Submit</button>
						</fieldset>
					</Form>
				)}
			</Mutation>
		);
	}
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };
