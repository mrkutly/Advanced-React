import React from "react";
import Downshift, { resetIdCounter } from "downshift";
import Router from "next/router";
import { ApolloConsumer } from "react-apollo";
import gql from "graphql-tag";
import debounce from "lodash.debounce";
import { DropDown, DropDownItem, SearchStyles } from "./styles/DropDown";

const SEARCH_ITEMS_QUERY = gql`
	query SEARCH_ITEMS_QUERY($searchTerm: String!) {
		items(
			where: {
				OR: [
					{ title_contains: $searchTerm }
					{ description_contains: $searchTerm }
				]
			}
		) {
			id
			image
			title
		}
	}
`;

function routeToItem(item) {
	Router.push({
		pathname: "/item",
		query: {
			id: item.id,
		},
	});
}

export default class Search extends React.Component {
	state = {
		items: [],
		loading: false,
	};

	onChange = debounce(async (e, client) => {
		console.log("searching");
		// turn on the loading
		this.setState({ loading: true });
		// manually query the apollo client
		const resp = await client.query({
			query: SEARCH_ITEMS_QUERY,
			variables: { searchTerm: e.target.value },
		});
		this.setState({ items: resp.data.items, loading: false });
	}, 350);

	render() {
		resetIdCounter();
		return (
			<SearchStyles>
				{/* the onchange in downshift is where you do your routing to the item selected
               the item is passed into the event handler
            */}
				<Downshift
					onChange={routeToItem}
					itemToString={item => (item === null ? "" : item.title)}
				>
					{({
						getInputProps,
						getItemProps,
						isOpen,
						inputValue,
						highlightedIndex,
					}) => (
						<div>
							{/* apollo consumer exposes the apollo client to us, which 
               allows us to fire off queries when we want rather
               than only doing it on page load like with render props */}
							<ApolloConsumer>
								{client => (
									<input
										type="search"
										{...getInputProps({
											type: "search",
											placeholder: "search for an item",
											id: "search",
											className: this.state.loading ? "loading" : "",
											onChange: e => {
												e.persist();
												this.onChange(e, client);
											},
										})}
									/>
								)}
							</ApolloConsumer>
							{isOpen && (
								<DropDown>
									{this.state.items.map((item, index) => (
										<DropDownItem
											{...getItemProps({ item })}
											key={item.id}
											highlighted={index === highlightedIndex}
										>
											<img width="50" src={item.image} alt={item.title} />
											{item.title}
										</DropDownItem>
									))}
									{!this.state.items.length && !this.state.loading && (
										<DropDownItem>
											No items found matching {inputValue}
										</DropDownItem>
									)}
								</DropDown>
							)}
						</div>
					)}
				</Downshift>
			</SearchStyles>
		);
	}
}
