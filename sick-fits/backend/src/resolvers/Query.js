// if you are just doing simple things that do not require any auth or special actions,
// you can use prisma's "forwardTo" func to send the query directly to your DB.
const { forwardTo } = require("prisma-binding");

const Query = {
	items: forwardTo("db"),
	// this is the same as...
	// ? async items(parent, args, ctx, info) {
	// ?	const items = await ctx.db.query.items();
	// ?	return items;
	// ? },
};

module.exports = Query;
