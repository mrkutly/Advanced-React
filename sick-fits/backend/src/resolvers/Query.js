// if you are just doing simple things that do not require any auth or special actions,
// you can use prisma's "forwardTo" func to send the query directly to your DB.
const { forwardTo } = require("prisma-binding");

const Query = {
	items: forwardTo("db"),
	item: forwardTo("db"),
	itemsConnection: forwardTo("db"),
	// this is the same as...
	// ? async items(parent, args, ctx, info) {
	// ?	const items = await ctx.db.query.items();
	// ?	return items;
	// ? },
	me(parent, args, ctx, info) {
		// check if there is a current user id
		if (!ctx.request.userId) return null;
		// if there is, find the user and return the query
		return ctx.db.query.user(
			{
				where: { id: ctx.request.userId },
			},
			info
		);
	},
};

module.exports = Query;
