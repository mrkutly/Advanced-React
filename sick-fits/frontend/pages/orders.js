import PleaseSignIn from "../components/PleaseSignIn";
import MyOrders from "../components/MyOrders";

export default props => {
	return (
		<div>
			<PleaseSignIn>
				<MyOrders />
			</PleaseSignIn>
		</div>
	);
};
