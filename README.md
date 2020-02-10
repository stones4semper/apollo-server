## Function Signature of Resolvers
- 1st argument is known as the parent or root argument and always returns the previously resolved field.
- 2nd argument is the incoming arguments of a query.
- 3rd argument is known as context. This is used to inject dependencies from the outside to the resolver function.
- 4th argument is known as the info argument. This is used to get internal info about the graphQL request.

## Subscriptions
Subscriptions are GraphQL operations that watch events emitted from the Apollo Server. 

## Apollo Server Subscription Setup

Firstly had to expose the subscriptions with an advanced http server setup. 

```js
import http from 'http';

// what we wrapped our app in to set up the Apollo Server Subscription.
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages(new Date());
  }
  httpServer.listen( {port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql'); 
  });
});
```

HTTP requests in GraphQL (queries and mutations) come with a req and res object. 
The subscription however comes with a connection object. For the context object
to be passed to the resolvers, we can distinguish in the same file. 

```js
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  ...
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
      };
    }

    if (req) {
      const me = await getMe(req);

      return {
        models,
        me,
        secret: process.env.SECRET,
      };
    }
  },
});
```
You can see that we destructure both the req and connection params.
This then allows us to handle both HTTP requests and subscriptions. 

To complete the subscription setup we needed to use a PubSub Engine.

#### PubSub Engine
Pubsub is a factory that creates event generators. Created a subscription folder with an index.js
file. The PubSub instance enables subscriptions in your application.

```js
import { PubSub } from 'apollo-server';

export default new PubSub();

```

### Subscribing and Publishing with PubSub
It should be possible for another GraphQL client to listen to message creations.
Extending the src/subscription/index.js file

```js
import { PubSub } from 'apollo-server';

import * as MESSAGE_EVENTS from './message';

export const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
};

export default new PubSub();
```

Then created a message.js file in the subscription folder as well.

```js
export const CREATED = 'CREATED';
```

Now, the only thing missing is using the event and the PubSub instance in the MESSAGE RESOLVER.

```js
export default {
  Query: {
    ...
  },

  Mutation: {
    ...
  },

  Message: {
    ...
  },

  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED),
    },
  },
};
```
Let's unpack this Subscription resolver here. This revolvers returns an AsyncIterator which listens
to the events asynchronously. It also has access to all the same arguements as other resolver 
functions.

The 'publish' events for the async iterator to listen for we can do so in our mutations. Generally,
the best place to do so is where you are adding data to the database.

```js
import pubsub, { EVENTS } from '../subscription';

...

export default {
  Query: {
    ...
  },

  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, { text }, { models, me }) => {
        const message = await models.Message.create({
          text,
          userId: me.id,
        });

        pubsub.publish(EVENTS.MESSAGE.CREATED, {
          messageCreated: { message },
        });

        return message;
      },
    ),

    ...
  },

  Message: {
    ...
  },

  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED),
    },
  },
};
```

### Batching and Caching

Installed the Facebook Open source dataloader.
`npm i --save dataloader`

Then in our index.js file we imported dataloader and used it in the following way. 

```js

const batchUsers = async (keys, models) => {
  const users = await models.User.findAll({
    where: {
      id: {
        $in: keys,
      },
    },
  });

  return keys.map(key => users.find(user => user.id === key));
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  ...
  context: async ({ req, connection }) => {
    if (connection) {
      ...
    }

    if (req) {
      const me = await getMe(req);

      return {
        models,
        me,
        secret: process.env.SECRET,
        loaders: {
          user: new DataLoader(keys => batchUsers(keys, models)),
        },
      };
    }
  },
});

```

The loader acts as an abstraction on top of the models and can be passed as context to the resolvers
The DataLoader function is very important. It gives us access to a list of keys in its arguements. 
These keys are your set of identifiers (no duplication) which can be used to retrieve items from
the database. 

Now, since we are passing the loader for the batched user retrieval as context to the resolvers, we
can make the most of it in the src/resolvers/message.js file. 


##### From 
```js
    user: async (message, args, { models }) => {
      return await models.User.findById(message.userId);
    },
```

##### To
```js

export default {
  Query: {
    ...
  },

  Mutation: {
    ...
  },

  Message: {
    user: async (message, args, { loaders }) => {
      return await loaders.user.load(message.userId);
    },
  },

  Subscription: {
    ...
  },
};
```
While the load() function takes each identifier individually, it will batch all these 
identifiers into one set and request all users at the same time.

From the docs "Then load individual values from the loader. DataLoader will coalesce all 
individual loads which occur within a single frame of execution (a single tick of the event loop) 
and then call your batch function with all requested keys."
