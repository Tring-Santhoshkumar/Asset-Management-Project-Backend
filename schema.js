export const typeDefs = `#graphql
    type user{
        id: ID!
        name: String!,
        email: String!,
        role: String!,
        profile_pic: String,
        dob: String,
        gender: String,
        blood_group: String,
        marital_status: String,
        phone: String,
        address: String,
        designation: String,
        department: String,
        city: String,
  	    state: String,
  	    pin_code: String,
  	    country: String,
        assigned_assets: [Asset]
    },
    type Asset{
        id: ID!,
        type: String,
        name: String,
        version: String,
        specifications: String,
        condition: String,
        assigned_to: ID,
        assigned_status: String,
        assigned_date: String,
        return_date: String
    },
    type Query{
        users : [user],
        user(id: ID!) : user,
        allAssets : [Asset],
        asset(id: ID!): Asset,
    },
    type Mutation{
        register(name: String!, email: String!, password: String!, role: String!): user,
        login(email: String!, password: String!): String,
        updateUser(id: ID!,name: String!,email: String!,profile_pic: String,dob: String!, gender: String!, blood_group: String!, marital_status: String!,
            phone: String!, address: String!, designation: String!, department: String!, city: String!,state: String!,pin_code: String!,country: String!) : user,
        assignAsset(id: ID!, assigned_to: ID!): Asset,
        addAsset(type: String!, serial_no: String!, name: String!, version: String!, specifications: String!, condition: String!, assigned_to: ID , assigned_status: String!, assigned_date: String, return_date: String) : String
    }
`