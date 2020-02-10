import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';


// acts as middleware for Graphql - will check if user is logged in. Used in conjunction with combineResolvers.
export const isAuthenticated = (parent, args, { me }) =>
  me ? skip : new ForbiddenError('Not authenticated as a User');

  export const isAdmin = combineResolvers(
    isAuthenticated,
    (parent, args, { me: { role }}) =>
      role === 'ADMIN'
        ? skip
        : new ForbiddenError('Not Authorized as Admin')
  );

  export const isINSTRUCTOR = combineResolvers(
    isAuthenticated,
    (parent, args, { me: { role }}) =>
      role === 'INSTRUCTOR' || role === 'ADMIN'
        ? skip
        : new ForbiddenError('Not Authorized as INSTRUCTOR')
  );

// permission based
export const isMessageOwner = async (
  parent,
  { id },
  { models, me },
) => {
  const messsage = await models.Message.findById(id, { raw: true });

  if (message.userId !== me.id) {
    throw new ForbiddenError('Not Authenticated as owner');
  }
  return skip;
};
