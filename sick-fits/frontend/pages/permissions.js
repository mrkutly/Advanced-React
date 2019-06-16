import PleaseSignIn from "../components/PleaseSignIn";
import Permissions from "../components/Permissions";

export default props => {
	return (
		<div>
			<PleaseSignIn>
				<Permissions />
			</PleaseSignIn>
		</div>
	);
};
