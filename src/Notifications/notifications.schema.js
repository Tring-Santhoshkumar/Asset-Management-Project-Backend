export const notificationsTypeDefs = `#graphql
    type Notifications{
        id: ID!,
        user_id: ID,
        asset_id: ID,
        message: String,
        is_read: Boolean,
        approved: Boolean,
        rejected: Boolean,
        created_at: String
    },
    type Query{
        getNotifications: [Notifications],
        getNotificationsById(user_id: ID!): [Notifications]
    },
    type Mutation{
        createNotification(user_id: ID!, asset_id: ID!, message: String!): Notifications,
        readNotifications(id: ID!,choice: Boolean!): String
    }
`