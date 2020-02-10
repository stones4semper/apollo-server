import { gql } from 'apollo-server-express';

export default gql`
    extend type Query { 
        users: [User!] 
        userty(where: String, offset: Int): [User!] 
        user(id: ID!): User
        me: User
    }

    extend type Mutation {
        signUp(
            username: String!
            fullname: String!
            email: String!
            role: String!
            password: String!
            Rpassword:String!
        ): Token!
        signIn(login: String!, password: String!): Token!        
        deleteUser(id: ID!): Boolean!
    }
     
    type Token {
        token: String!
        user:[User!]
    }
 
    type User {
        id: ID 
        fullname: String
        username: String!
        email: String!
        role: String!
        isAgentApproved: String!
        pix: String
        facebook: String        
        website: String
        youtube: String
        googlePlus: String
        instagram: String
        twitter: String
        whatsapp: String
        skype: String
        description: String
        messages: [Message]
    }
`;
