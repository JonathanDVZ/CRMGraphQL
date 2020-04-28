const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: 'variables.env' });

const conectDB = require('./config/db');

//Conect DB
conectDB();

//server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {        
        try {
            const token = req.headers['authorization'] || '';

            if(token){
                const user = jwt.verify(token.replace('Bearer ',''), process.env.SECRET);

                return {
                    user
                }
            }
            
        } catch (error) {
            console.error(error);
        }
    }
});

//start server
server.listen({ port: process.env.port || 4000 }).then(({url}) => {
    console.log(`Server ready in URL ${url}`);
})