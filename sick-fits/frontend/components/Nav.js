import Link from "next/link";
import NavStyles from "./styles/NavStyles";
import User from "./User";
import SignOut from "./SignOut";

const Nav = () => {
	return (
		<User>
			{({ data: { me } }) => (
				<NavStyles>
					<Link href="/items">
						<a>Shop</a>
					</Link>
					{/* only show these if the person is signed in */}
					{me && (
						<>
							<Link href="/sell">
								<a>Sell</a>
							</Link>
							<Link href="/orders">
								<a>Orders</a>
							</Link>
							<Link href="/me">
								<a>Account</a>
							</Link>
							<SignOut />
						</>
					)}
					{!me && (
						<Link href="/signup">
							<a>Sign In</a>
						</Link>
					)}
				</NavStyles>
			)}
		</User>
	);
};

export default Nav;
