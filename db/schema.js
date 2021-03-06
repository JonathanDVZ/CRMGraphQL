const { gql } = require('apollo-server');

//Schema
const typeDefs = gql`
    type User {
        id: ID
        name: String
        lastname: String
        email: String
        creationDate: String
    }

    type Token {
        token: String
    }

    type Product {
        id: ID
        name: String
        existence: Int
        price: Float
        creationDate: String
    }

    type Client {
        id: ID
        name: String
        lastname: String
        company: String
        email: String
        phoneNumber: String
        creationDate: String
        seller: ID
    }

    type Order {
        id: ID!
        order: [OrderGroup],
        total: Float
        client: Client
        seller: ID
        creationDate: String
        status: StatusOrder
    }

    type OrderGroup {
        id: ID,
        quantity: Int
        name: String
        price: Float
    }

    type TopClient {
        total: Float
        client: [Client]
    }

    type TopSeller {
        total: Float
        seller: [User]
    }

    input UserInput {
        name: String!
        lastname: String!
        email: String!
        password: String!
    }

    input AuthenticateInput {
        email: String!
        password: String!
    }

    input ProductInput {
        name: String!
        existence: Int!
        price: Float 
    }

    input ClientInput {
        name: String!
        lastname: String!
        company: String!
        email: String!
        phoneNumber: String
    }

    input OrderProductInput {
        id: ID
        quantity: Int,
        name: String
        price: Float
    }

    input OrderInput {
        order: [OrderProductInput]
        client: ID
        status: StatusOrder
    }

    enum StatusOrder {
        PENDING
        COMPLETED
        CANCELLED
    }

    type Query{
        #Users
        getUser : User

        #Products
        getProducts : [Product]
        getProduct(id: ID!) : Product

        #Clients
        getClients : [Client]
        getClientsSeller : [Client]
        getClient(id: ID!) : Client

        #Orders
        getOrders : [Order]
        getOrdersSeller : [Order]
        getOrder(id: ID!) : Order
        getOrderByStatus(status: String!) : [Order]

        ##Advanced Searches
        bestClients : [TopClient]
        bestSellers : [TopSeller]
        searchProduct(text: String!) : [Product]
    }
    
    type Mutation {
        #Users
        newUser(input: UserInput) : User
        authenticateUser(input: AuthenticateInput) : Token

        #Products
        newProduct(input: ProductInput) : Product
        updateProduct(id: ID!, input: ProductInput) : Product
        deleteProduct(id: ID!) : String

        #Clients
        newClient(input: ClientInput) : Client
        updateClient(id: ID!, input: ClientInput) : Client
        deleteClient(id: ID!) : String

        #Orders
        newOrder(input: OrderInput) : Order
        updateOrder(id: ID!, input: OrderInput) : Order
        deleteOrder(id: ID!) : String
    }
`;

module.exports = typeDefs;