const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Mutations = {
	async createItem(parent, args, ctx, info) {
		// create the item
		// args are the properties of the object we are creating, so we can just spread them
		// info contains the actual query that got passed in, so we know what to return after the item is created
		const item = await ctx.db.mutation.createItem({ data: { ...args } }, info);
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
		const item = await ctx.db.query.item({ where }, `{ id title }`);
		// TODO 2. check if they own that item or have the permissions
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
};

module.exports = Mutations;
