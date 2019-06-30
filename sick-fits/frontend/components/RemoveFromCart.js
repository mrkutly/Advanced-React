import React from "react";
import styled from "styled-components";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import { CURRENT_USER_QUERY } from "./User";

export const REMOVE_FROM_CART_MUTATION = gql`
	mutation removeFromCart($id: ID!) {
		removeFromCart(id: $id) {
			id
		}
	}
`;

const BigButton = styled.button`
	font-size: 3rem;
	background: none;
	border: none;
	&:hover {
		color: ${({ theme }) => theme.red};
		cursor: pointer;
	}
`;

class RemoveFromCart extends React.Component {
	static propTypes = {
		id: PropTypes.string.isRequired,
	};

	// This gets called as soon as we get a response back from the server
	// after the mutation has been performed
	update = (cache, payload) => {
		// ? cache is the apollo cache
		// ? payload is the info returned from the server by the mutation

		// read the cache
		const data = cache.readQuery({ query: CURRENT_USER_QUERY });

		// remove the item from the cart
		const removedItemId = payload.data.removeFromCart.id;
		data.me.cart = data.me.cart.filter(item => item.id !== removedItemId);

		// write the cart data  back to the cache
		cache.writeQuery({ query: CURRENT_USER_QUERY, data });
	};

	render() {
		return (
			<Mutation
				mutation={REMOVE_FROM_CART_MUTATION}
				variables={{ id: this.props.id }}
				// you could do this to force the cart to refresh, but it is a little slow:
				// ? refetchQueries={[{ query: CURRENT_USER_QUERY }]}
				// this is also a little slow because it waits to get a response back from the user
				update={this.update}
				// you can give mutations an optimisticResponse and they will update the cache
				// optimistically as though they received that response from the server
				optimisticResponse={{
					__typename: "Mutation",
					removeFromCart: {
						__typename: "CartItem",
						id: this.props.id,
					},
				}}
			>
				{(removeFromCart, { loading, error }) => (
					<BigButton
						title="Delete Item"
						disabled={loading}
						onClick={() => {
							removeFromCart().catch(err => alert(err.message));
						}}
					>
						&times;
					</BigButton>
				)}
			</Mutation>
		);
	}
}

export default RemoveFromCart;
