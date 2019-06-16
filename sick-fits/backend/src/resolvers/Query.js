// if you are just doing simple things that do not require any auth or special actions,
// you can use prisma's "forwardTo" func to send the query directly to your DB.
const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");
const permissionTypes = require("../permissionTypes");

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
	async users(parent, args, ctx, info) {
		// check if they are logged in
		if (!ctx.request.userId) throw new Error("You must be logged in");
		// check if user has permissions to query all the users
		hasPermission(ctx.request.user, [
			permissionTypes.ADMIN,
			permissionTypes.PERMISSIONUPDATE,
		]);

		// if they do, query all the users
		return ctx.db.query.users({}, info);
	},
};

module.exports = Query;
