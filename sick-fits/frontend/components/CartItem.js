import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import RemoveFromCart from "./RemoveFromCart";
import formatMoney from "../lib/formatMoney";

const CartItemStyles = styled.li`
	padding: 1rem 0;
	border-bottom: 1px solid ${({ theme }) => theme.lightgrey};
	display: grid;
	align-items: center;
	grid-template-columns: auto 1fr auto;

	img {
		margin-right: 10px;
	}

	h3,
	p {
		margin: 0;
	}
`;

const CartItem = ({ cartItem: { item, quantity, id } }) => {
	// first, check that the item exists (in case it has been deleted)
	if (!item) {
		return (
			<CartItemStyles>
				<p>This item has been removed from our store</p>
				<RemoveFromCart id={id} />
			</CartItemStyles>
		);
	}

	return (
		<CartItemStyles>
			<img width="100" src={item.image} alt={item.title} />
			<div className="cart-item-details">
				<h3>{item.title}</h3>
				<p>
					{formatMoney(item.price * quantity)}
					{" - "}
					<em>
						{quantity} &times; {formatMoney(item.price)} each
					</em>
				</p>
			</div>
			<RemoveFromCart id={id} />
		</CartItemStyles>
	);
};

CartItem.propTypes = {
	cartItem: PropTypes.object.isRequired,
};

export default CartItem;
