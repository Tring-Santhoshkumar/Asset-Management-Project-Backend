export const assetTypeDefs = `#graphql
    type Asset{
        id: ID!,
        serial_no: String,
        type: String,
        name: String,
        version: String,
        specifications: String,
        condition: String,
        assigned_to: ID,
        assigned_status: String,
        assigned_date: String,
        return_date: String,
        created_at: String,
        updated_at: String,
        deleted_at: String,
    },
    input addAssetInput{
        type: String!,
        serial_no: String!, 
        name: String!, 
        version: String!, 
        specifications: String!, 
        condition: String!, 
        assigned_to: ID , 
        assigned_status: String!, 
        assigned_date: String, 
        return_date: String
    },
    type Query{
        allAssets : [Asset],
        asset(id: ID!): Asset,
        assetByUserId(assigned_to: ID!): [Asset],
    },
    type Mutation{
        assignAsset(id: ID!, assigned_to: ID!): Asset,
        requestAsset(id: ID!): String,
        addAsset(input: addAssetInput) : String,
        deleteAsset(id: ID!): String,
        deAssignAsset(id: ID!): String,
    }
`