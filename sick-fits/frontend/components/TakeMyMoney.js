import React from "react";
import StripeCheckout from "react-stripe-checkout";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";
import NProgress from "nprogress";
import PropTypes from "prop-types";
import calcTotalPrice from "../lib/calcTotalPrice";
import Error from "./ErrorMessage";
import User, { CURRENT_USER_QUERY } from "./User";

const CREATE_ORDER_MUTATION = gql`
	mutation createOrder($token: String!) {
		createOrder(token: $token) {
			id
			charge
			total
			items {
				id
				title
			}
		}
	}
`;

function totalItem(cart) {
	return cart.reduce((acc, cartItem) => acc + cartItem.quantity, 0);
}

export default class TakeMyMoney extends React.Component {
	onToken = async (res, createOrder) => {
		// start the progress bar
		NProgress.start();
		// manually call the mutation once we have the strip token
		const order = await createOrder({
			variables: {
				token: res.id,
			},
		}).catch(e => alert(e.message));
		console.log(order);

		// reroute to the order's show page
		Router.push({
			pathname: "/order",
			query: { id: order.data.createOrder.id },
		});
	};
	render() {
		return (
			<User>
				{({ data: { me } }) => {
					const numItems = totalItem(me.cart);

					return (
						<Mutation
							mutation={CREATE_ORDER_MUTATION}
							refetchQueries={[{ query: CURRENT_USER_QUERY }]}
						>
							{createOrder => (
								<StripeCheckout
									amount={calcTotalPrice(me.cart)}
									name="Sick Fits"
									description={`Order of ${numItems} item${
										numItems > 1 ? "s" : ""
									}`}
									image={
										me.cart.length && me.cart[0].item && me.cart[0].item.image
									}
									stripeKey="pk_test_corKrWSIoHjLDTptax8mfG900081rtXs8m"
									currency="USD"
									email={me.email}
									token={res => this.onToken(res, createOrder)}
								>
									{this.props.children}
								</StripeCheckout>
							)}
						</Mutation>
					);
				}}
			</User>
		);
	}
}
