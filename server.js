import { ApolloServer } from "@apollo/server";
import { startStandaloneServer} from '@apollo/server/standalone'
import { typeDefs } from "./Schema/schema.js";
import { resolvers } from "./resolvers.js";

const server = new ApolloServer({
    typeDefs,
    resolvers
})
await startStandaloneServer(server,{
    listen : {port : 3001}
})