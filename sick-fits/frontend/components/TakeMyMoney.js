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

function totalItem(cart) {
	return cart.reduce((acc, cartItem) => acc + cartItem.quantity, 0);
}

export default class TakeMyMoney extends React.Component {
	onToken = res => {
		console.log(res);
	};
	render() {
		return (
			<User>
				{({ data: { me } }) => {
					const numItems = totalItem(me.cart);

					return (
						<StripeCheckout
							amount={calcTotalPrice(me.cart)}
							name="Sick Fits"
							description={`Order of ${numItems} item${
								numItems > 1 ? "s" : ""
							}`}
							image={me.cart[0].item && me.cart[0].item.image}
							stripeKey="pk_test_corKrWSIoHjLDTptax8mfG900081rtXs8m"
							currency="USD"
							email={me.email}
							token={res => this.onToken(res)}
						>
							{this.props.children}
						</StripeCheckout>
					);
				}}
			</User>
		);
	}
}
