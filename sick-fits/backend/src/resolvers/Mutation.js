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
		// now run the mutation (this is defined in the prisma.graphqlfile on line 433)
		return ctx.db.mutation.updateItem(
			{
				data: updates,
				where: { id: args.id },
				// passing info as the second arg tells it what to return (the item)
			},
			info
		);
	},
};

module.exports = Mutations;
