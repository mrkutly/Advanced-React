import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { ALL_ITEMS_QUERY } from "./Items";
import { CURRENT_USER_QUERY } from "./User";

const DELETE_ITEM_MUTATION = gql`
	mutation DELETE_ITEM_MUTATION($id: ID!) {
		deleteItem(id: $id) {
			id
		}
	}
`;

class DeleteItem extends Component {
	update = (cache, payload) => {
		// ? Here, we can manually update the cache on the client side.
		// ? Our mutation only makes the update on the server,
		// ? so we need to also make this change to the cache.
		//
		// 1. read the cache for the items we want using a graphql query (ALL_ITEMS_QUERY from Items.js)
		const itemData = cache.readQuery({ query: ALL_ITEMS_QUERY });
		// get the current user
		const userData = cache.readQuery({ query: CURRENT_USER_QUERY });

		// 2. Filter the deleted item out of the page
		itemData.items = itemData.items.filter(
			item => item.id !== payload.data.deleteItem.id
		);

		// delete the item from the cart item in the user's cart
		userData.me.cart = userData.me.cart.map(cartItem => {
			if ((cartItem.item.id = payload.data.deleteItem.id)) {
				delete cartItem.item;
			}
			return cartItem;
		});

		// 3. Put the items back!
		cache.writeQuery({ query: ALL_ITEMS_QUERY, itemData });
		cache.writeQuery({ query: CURRENT_USER_QUERY, userData });
	};

	render() {
		return (
			<Mutation
				mutation={DELETE_ITEM_MUTATION}
				variables={{ id: this.props.id }}
				update={this.update}
			>
				{(deleteItem, { error }) => (
					<button
						onClick={e => {
							if (confirm("Are you sure you want to delete this item?")) {
								deleteItem().catch(err => {
									alert(err.message);
								});
							}
						}}
					>
						{this.props.children}
					</button>
				)}
			</Mutation>
		);
	}
}

export default DeleteItem;
