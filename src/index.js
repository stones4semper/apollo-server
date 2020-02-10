import cors from 'cors';
import express from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import DataLoader from 'dataloader';
import models, { sequelize } from './models';
import resolvers from './resolvers';
import schema from './schema';
import loaders from './loaders';
const dotenv = require('dotenv');
import { verifyJWT } from './functions/jwt'
import createUsersWithMessages from './dummyData'
dotenv.config();
const app = express();
app.use(cors());
const eraseDatabaseOnSync = true;

// authentication on a server level. 
const getMe = async req => {
    const token = req.headers['authorization'];
    if (token) return await verifyJWT(token)
};

const server = new ApolloServer({
    introspection: true,
    typeDefs: schema,
    resolvers,
    formatError: error => {
        const message = error.message
            .replace('SequelizeValidationError: ', '')
            .replace('Validation error: ', '');

        return {...error, message, };
    },
    context: async({ req, connection }) => {
        if (connection) {
            return {
                models,
                loaders: {
                    user: new DataLoader(keys => loaders.user.batchUsers(keys, models), ),
                },
            }
        }
        if (req) {
            const me = await getMe(req);
            return {
                models,
                me,
                secret: process.env.SECRET,
                loaders: {
                    user: new DataLoader(keys => loaders.user.batchUsers(keys, models)),
                },
            };
        }
    }
});

server.applyMiddleware({ app, path: '/graphql' });

// what we wrapped our app in to set up the Apollo Server Subscription.
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const isProduction = process.env.NODE_ENV == 'production' ? true : false

const port = process.env.PORT || 3000;

sequelize.sync({ force: isProduction }).then(async() => {
    if (isProduction) createUsersWithMessages(new Date());
    httpServer.listen({ port }, () => console.log(`Apollo Server on http://localhost:${port}/graphql`));
});