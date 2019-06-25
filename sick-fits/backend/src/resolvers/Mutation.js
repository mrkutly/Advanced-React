const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeEmail } = require("../mail");
const { hasPermission } = require("../utils");
const { ADMIN, ITEMDELETE, PERMISSIONUPDATE } = require("../permissionTypes");
const stripe = require("../stripe");

const Mutations = {
	async createItem(parent, args, ctx, info) {
		// create the item
		// args are the properties of the object we are creating, so we can just spread them
		// info contains the actual query that got passed in, so we know what to return after the item is created

		if (!ctx.request.userId) {
			throw new Error("You must be logged in to do that!");
		}

		const item = await ctx.db.mutation.createItem(
			{
				data: {
					// this is how you create a relationship between the item and the user
					user: {
						connect: { id: ctx.request.userId },
					},
					...args,
				},
			},
			info
		);
		return item;
	},

	updateItem(parent, args, ctx, info) {
		// first, take a copy of the updates
		const updates = { ...args };
		// remove id from updates (you don't want to update the id)
		delete updates.id;
		// now run the mutation (this is defined in the prisma.graphql file on line 433)
		return ctx.db.mutation.updateItem(
			{
				data: updates,
				where: { id: args.id },
				// passing info as the second arg tells it what to return (the item)
			},
			info
		);
	},

	async deleteItem(parent, args, ctx, info) {
		const where = { id: args.id };
		// 1. find the item
		const item = await ctx.db.query.item({ where }, `{ id title user { id } }`);
		// TODO 2. check if they own that item or have the permissions
		const ownsItem = item.user.id === ctx.request.userId;
		const canDelete = ctx.request.user.permissions.some(perm =>
			[ADMIN, ITEMDELETE].includes(perm)
		);

		if (!ownsItem && !canDelete)
			throw new Error("You do not have permission to do that");

		// 3. delete it
		return ctx.db.mutation.deleteItem({ where }, info);
	},

	async signup(parent, args, ctx, info) {
		// sometimes ppl type their email addresses with capital letters, so just lowercase it
		args.email = args.email.toLowerCase();
		// hash the password
		const password = await bcrypt.hash(args.password, 10);
		// create the user in the DB
		const user = await ctx.db.mutation.createUser(
			{
				data: {
					...args,
					password,
					// you have to use "set" because permissions are an enum, not just a string
					permissions: { set: ["USER"] },
				},
			},
			info
		);
		// create JWT token for them
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		// set the JWT as a cookie on the response
		ctx.response.cookie("token", token, {
			// this says JS cannot access this cookie
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
		});

		// finally, we return the user to the browser
		return user;
	},

	async signin(parent, { email, password }, ctx, info) {
		// check if there is a user with that email
		const user = await ctx.db.query.user({ where: { email } });
		if (!user) {
			throw new Error(`No user found with the email address ${email}.`);
		}
		// check password
		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			throw new Error("Invalid password");
		}
		// generate jwt
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		// set cookie with jwt
		ctx.response.cookie("token", token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365,
		});
		// return user
		return user;
	},

	signout(parent, args, ctx, info) {
		ctx.response.clearCookie("token");
		return { message: "Goodbye!" };
	},

	async requestReset(parent, { email }, ctx, info) {
		// Check if this is a real user
		const user = await ctx.db.query.user({ where: { email } });

		if (!user) {
			throw new Error(`No user found with the email ${email}`);
		}
		// Set a reset token and expiry on that user
		const randomBytesPromise = promisify(randomBytes);
		const resetToken = (await randomBytesPromise(20)).toString("hex");
		const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
		const res = await ctx.db.mutation.updateUser({
			where: { email },
			data: { resetToken, resetTokenExpiry },
		});

		// email them the reset token
		const mailResponse = await transport.sendMail({
			from: "mark.sauer.utley@gmail.com",
			to: user.email,
			subject: "Your password reset",
			html: makeEmail(`
				Your password reset token is here! 
				\n\n 
				<a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
					Click here to reset your password
				</a>
			`),
		});
		// return the message
		return { message: "You will be sent an email shortly" };
	},

	async resetPassword(parent, args, ctx, info) {
		// check if the passwords match
		if (args.newPassword !== args.confirmPassword) {
			throw new Error("Password and confirm password must match");
		}
		// check if it is a legit reset token
		// check if it has expired
		const [user] = await ctx.db.query.users({
			where: {
				resetToken: args.resetToken,
				// check prisma.graphql - USERWHEREINPUT to find this query
				resetTokenExpiry_gte: Date.now() - 3600000,
			},
		});

		if (!user) {
			throw new Error("Invalid or expired reset token");
		}

		// hash their new password
		const newPassword = await bcrypt.hash(args.newPassword, 10);
		// save the new password to the user
		const updatedUser = await ctx.db.mutation.updateUser({
			where: {
				email: user.email,
			},
			data: {
				password: newPassword,
				// remove old reset token fields from user
				resetToken: null,
				resetTokenExpiry: null,
			},
		});

		// generate jwt
		const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
		// set jwt cookie
		ctx.response.cookie("token", token, {
			// this says JS cannot access this cookie
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
		});
		// return user
		return updatedUser;
	},

	async updatePermissions(parent, args, ctx, info) {
		// check if they are logged in
		if (!ctx.request.userId) throw new Error("You must be logged in");
		// query the current user
		const currentUser = await ctx.db.query.user(
			{
				where: { id: ctx.request.userId },
			},
			info
		);
		// check that they have the permissions to do this
		hasPermission(currentUser, [ADMIN, PERMISSIONUPDATE]);
		// update the permissions
		return ctx.db.mutation.updateUser(
			{
				data: {
					permissions: {
						set: args.permissions,
					},
				},
				where: {
					id: args.userId,
				},
			},
			info
		);
	},

	async addToCart(parent, args, ctx, info) {
		// check the they are signed in
		const { userId } = ctx.request;

		if (!userId) throw new Error("You must be signed in");

		// query the user's current cart
		// ? see the generated graphql file to see the cartItems query
		// cartItems returns an array, but since there will only
		// ever be one cart item with this user and this item, we can destructure it
		const [existingCartItem] = await ctx.db.query.cartItems({
			where: {
				user: { id: userId },
				item: { id: args.id },
			},
		});

		// check if that item is already in that cart
		if (existingCartItem) {
			// if it is, increment it by one
			return ctx.db.mutation.updateCartItem(
				{
					where: { id: existingCartItem.id },
					data: { quantity: ++existingCartItem.quantity },
				},
				info
			);
		}
		// if not, create a fresh cart item for the user
		return ctx.db.mutation.createCartItem(
			{
				data: {
					user: { connect: { id: userId } },
					item: { connect: { id: args.id } },
				},
			},
			info
		);
	},

	async removeFromCart(parent, args, ctx, info) {
		// find cart item
		const cartItem = await ctx.db.query.cartItem(
			{
				where: { id: args.id },
			},
			`{ id, user { id } }`
		);
		// make sure we found the item
		if (!cartItem) throw new Error("No cart item found");

		// make sure they own the cart item
		if (cartItem.user.id !== ctx.request.userId) {
			throw new Error("not yours!");
		}
		// delete the cartItem
		return ctx.db.mutation.deleteCartItem({ where: { id: args.id } }, info);
	},
	async createOrder(parent, args, ctx, info) {
		// 1. Query the current user and make sure they are signed in
		const { userId } = ctx.request;
		if (!userId) throw new Error("You must sign in to complete this order.");

		const user = await ctx.db.query.user(
			{ where: { id: userId } },
			`{
				id 
				name 
				email 
				cart { 
					id 
					quantity 
					item { 
						title 
						price 
						id 
						description 
						image 
						largeImage
					}
				}
			}`
		);
		// 2. Recalculate total price (don't trust the client side!)
		const amount = user.cart.reduce(
			(acc, { quantity, item: { price } }) => acc + quantity * price,
			0
		);

		// 3. Create the stripe charge (turn token into money)
		const charge = await stripe.charges.create({
			amount,
			currency: "USD",
			source: args.token,
		});

		// 4. convert the cartItems to orderItems
		const orderItems = user.cart.map(({ quantity, item }) => {
			const orderItem = {
				quantity,
				user: { connect: { id: userId } },
				...item,
			};
			delete orderItem.id;
			return orderItem;
		});

		// 5. create the order in our db
		const order = await ctx.db.mutation.createOrder(
			{
				data: {
					total: charge.amount,
					charge: charge.id,
					items: { create: orderItems },
					user: { connect: { id: userId } },
				},
			},
			info
		);

		// 6. clear user's cart and delete cartItems from db
		const cartItemIds = user.cart.map(ci => ci.id);
		await ctx.db.mutation.deleteManyCartItems({
			where: { id_in: cartItemIds },
		});

		// 7. return order to the client
		console.log(order);
		return order;
	},
};

module.exports = Mutations;
