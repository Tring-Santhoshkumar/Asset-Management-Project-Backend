export const userTypeDefs = `#graphql
    type user{
        id: ID!
        name: String!,
        email: String!,
        role: String!,
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
        status: String,
        created_at: String,
        updated_at: String,
        deleted_at: String,
        reset_password: String,
        assigned_assets: [Asset]
    },
    input updateUserInput{
        id: ID!,
        name: String!,
        email: String!,
        dob: String!,
        gender: String!,
        blood_group: String!, 
        marital_status: String!,
        phone: String!, 
        address: String!, 
        designation: String!, 
        department: String!, 
        city: String!,
        state: String!,
        pin_code: String!,
        country: String!
    },
    type Query{
        users : [user],
        user(id: ID!) : user
    },
    type Mutation{
        register(name: String!, email: String!, password: String!, role: String!): user,
        login(email: String!, password: String!): String,
        changePassword(id: ID!, password: String!): String,
        updateUser(input: updateUserInput) : user,
        addUser(name: String!,email: String!,role: String!): String,
        deleteUser(id: ID!): String,
    }
`