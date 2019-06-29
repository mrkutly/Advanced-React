import PleaseSignIn from "../components/PleaseSignIn";
import Order from "../components/Order";

export default props => {
	return (
		<div>
			<PleaseSignIn>
				<Order id={props.query.id} />
			</PleaseSignIn>
		</div>
	);
};
