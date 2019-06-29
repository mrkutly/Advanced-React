import React from "react";
import gql from "graphql-tag";
import styled from "styled-components";
import Link from "next/link";
import { Query } from "react-apollo";
import Error from "./ErrorMessage";
import OrderItemStyles from "./styles/OrderItemStyles";
import { formatDistance } from "date-fns";
import formatMoney from "../lib/formatMoney";

const OrderUl = styled.ul`
	display: grid;
	grid-gap: 4rem;
	grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;

const MY_ORDERS_QUERY = gql`
	query myOrdersQuery {
		orders(orderBy: createdAt_DESC) {
			id
			total
			createdAt
			items {
				id
				title
				price
				description
				quantity
				image
			}
		}
	}
`;

export default class MyOrders extends React.Component {
	render() {
		return (
			<Query query={MY_ORDERS_QUERY}>
				{({ data: { orders }, loading, error }) => {
					if (error) return <Error error={error} />;
					if (loading) return <p>loading...</p>;

					return (
						<div>
							<h2>You have {orders.length} orders</h2>
							<OrderUl>
								{orders.map(order => (
									<OrderItemStyles key={order.id}>
										<Link
											href={{ pathname: "/order", query: { id: order.id } }}
										>
											<a>
												<div className="order-meta">
													<p>
														{order.items.reduce(
															(acc, item) => acc + item.quantity,
															0
														)}{" "}
														items
													</p>
													<p>{order.items.length} products</p>
													<p>{formatDistance(order.createdAt, new Date())}</p>
													<p>{formatMoney(order.total)}</p>
												</div>
												<div className="images">
													{order.items.map(item => (
														<img
															src={item.image}
															alt={item.title}
															key={item.id}
														/>
													))}
												</div>
											</a>
										</Link>
									</OrderItemStyles>
								))}
							</OrderUl>
						</div>
					);
				}}
			</Query>
		);
	}
}
