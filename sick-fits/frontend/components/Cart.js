import React from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import { adopt } from "react-adopt";
import User from "./User";
import TakeMyMoney from "./TakeMyMoney";
import CartItem from "./CartItem";
import CartStyles from "./styles/CartStyles";
import Supreme from "./styles/Supreme";
import CloseButton from "./styles/CloseButton";
import SickButton from "./styles/SickButton";
import calcTotalPrice from "../lib/calcTotalPrice";
import formatMoney from "../lib/formatMoney";

// using @client directive tells apollo to look for it in local data, not on the server
export const LOCAL_STATE_QUERY = gql`
	query {
		cartOpen @client
	}
`;

export const TOGGLE_CART_MUTATION = gql`
	mutation {
		toggleCart @client
	}
`;

// This allows you to wrap your return in all three of these components
// without getting into nested render-props nightmare
const Composed = adopt({
	// you could do this, but then you get errors in the console
	// because the "children" prop is required for these components
	// user: <User />,
	user: ({ render }) => <User>{render}</User>,
	toggleCart: ({ render }) => (
		<Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>
	),
	localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>,
});

const Cart = props => {
	return (
		<Composed>
			{({ user, toggleCart, localState }) => {
				const { me } = user.data;
				if (!me) return null;

				return (
					<CartStyles open={localState.data.cartOpen}>
						<header>
							<CloseButton title="close" onClick={toggleCart}>
								&times;
							</CloseButton>
							<Supreme>{me.name}'s Cart</Supreme>
							<p>
								You have {me.cart.length} item
								{me.cart.length > 1 && "s"} in your cart
							</p>
						</header>
						<ul>
							{me.cart.map(cartItem => (
								<CartItem key={cartItem.id} cartItem={cartItem}>
									{cartItem.quantity}
								</CartItem>
							))}
						</ul>
						<footer>
							<p>{formatMoney(calcTotalPrice(me.cart))}</p>
							<TakeMyMoney>
								<SickButton>Checkout</SickButton>
							</TakeMyMoney>
						</footer>
					</CartStyles>
				);
			}}
		</Composed>
	);
};

export default Cart;
