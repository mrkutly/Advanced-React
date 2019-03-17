const Mutations = {
	async createItem(parent, args, ctx, info) {
		// create the item
		// args are the properties of the object we are creating, so we can just spread them
		// info contains the actual query that got passed in, so we know what to return after the item is created
		const item = await ctx.db.mutation.createItem({ data: { ...args } }, info);
		return item;
	},
};

module.exports = Mutations;
