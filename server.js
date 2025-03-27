import { ApolloServer } from "@apollo/server";
import { startStandaloneServer} from '@apollo/server/standalone'
import { userTypeDefs } from "./src/Users/user.schema.js";
import { assetTypeDefs } from "./src/Assets/asset.schema.js";
import { notificationsTypeDefs } from "./src/Notifications/notifications.schema.js";
import { userResolvers } from "./src/Users/user.resolvers.js";
import { assetResolvers } from "./src/Assets/asset.resolvers.js";
import { notificationsResolvers } from "./src/Notifications/notifications.resolvers.js";

const server = new ApolloServer({
    typeDefs: [userTypeDefs, assetTypeDefs, notificationsTypeDefs],
    resolvers: [userResolvers, assetResolvers, notificationsResolvers]
})
await startStandaloneServer(server, {
    listen : {port : 3001}
})