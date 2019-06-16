const { GraphQLServer } = require("graphql-yoga");
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const db = require("./db");

// Create GraphQL Yoga Server
function createServer() {
	return new GraphQLServer({
		typeDefs: "src/schema.graphql",
		resolvers: { Mutation, Query },
		resolverValidationOptions: { requireResolversForResolveType: false },
		// expose your database in your resolvers
		context: req => ({ ...req, db }),
	});
}

module.exports = createServer;
