import styled from "styled-components";
import React from "react";

import PropTypes from "prop-types";

const ErrorStyles = styled.div`
	padding: 2rem;
	background: white;
	margin: 2rem 0;
	border: 1px solid rgba(0, 0, 0, 0.05);
	border-left: 5px solid red;
	p {
		margin: 0;
		font-weight: 100;
	}
	strong {
		margin-right: 1rem;
	}
`;

const DisplayError = ({ error }) => {
	if (!error || !error.message) return null;
	// GQL NetworkErrors will give you multiple errors, so you map over them and return them as styled components
	if (
		error.networkError &&
		error.networkError.result &&
		error.networkError.result.errors.length
	) {
		return error.networkError.result.errors.map((error, i) => (
			<ErrorStyles key={i}>
				<p data-test="graphql-error">
					<strong>Shoot!</strong>
					{error.message.replace("GraphQL error: ", "")}
				</p>
			</ErrorStyles>
		));
	}
	// Else just return the singular styled component
	return (
		<ErrorStyles>
			{/* data-test makes it super easy to find these components in your tests */}
			<p data-test="graphql-error">
				<strong>Shoot!</strong>
				{error.message.replace("GraphQL error: ", "")}
			</p>
		</ErrorStyles>
	);
};

DisplayError.defaultProps = {
	error: {},
};

DisplayError.propTypes = {
	error: PropTypes.object,
};

export default DisplayError;
