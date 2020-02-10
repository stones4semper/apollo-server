import { combineResolvers } from 'graphql-resolvers';
// import { AuthenticationError, UserInputError } from 'apollo-server';
import Joi from 'joi'
import { isAuthenticated, isAdmin } from './authorization';
import {SignUp, SignIn} from '../functions/joi'
import {createToken} from '../functions/jwt' 
var config    = require('../config.json');
import Sequelize from 'sequelize';
const Op = Sequelize.Op

export default {
	Query: {
		users: combineResolvers(isAdmin, async (parent, args, { models }) => {
			return await models.User.findAll();
		}), 
		user: combineResolvers(isAuthenticated, async (parent, { id }, { models }) => {
			return await models.User.findById(id);
		}),  
		me: combineResolvers(isAuthenticated, async (parent, args, { models, me }) => {
			if(!me) return null;    
			return await models.User.findByPk(me.id);
		}),
	},
	Mutation: {
		signUp: async (parent, { username, fullname, email, role, password, Rpassword }, { models, secret }) => {
			if(password !== Rpassword) return new Error('Password did not match')			
			var thejoi = { username, fullname, email, password }
			const checkUserEm = await models.User.find({ where: { email: email }})
			if (checkUserEm) return new Error('Email address already Exist')			
			const checkUserUs = await models.User.find({ where: { username: username }})
			if (checkUserUs) return new Error('Username already Exist')
			
			await Joi.validate(thejoi, SignUp, {abortEarly:false})
			const user = await models.User.create({
				username, 
				fullname, 
				email,
				role,
				password,
				pix:'https://via.placeholder.com/300x300.png?text=Click+here+to+change+image'
			});
			return { token: createToken(user) };
		},
		signIn: async (parent, { login, password }, { models, secret }, ) => {
			const user = await models.User.findByLogin(login)
			if (!user) return new Error('Incorrect Username/Email or password')			
			const isValid = await user.validatePassword(password);
			if (!isValid) return new Error('Incorrect Username/Email or password')		
			return { token: createToken(user) }
		},		
		deleteUser: combineResolvers(
			isAdmin,
			async (parent, { id }, { models }) => {
				return await models.User.destroy({ where: { id },})
			}
		)
	},
	
	User: { 
		messages: async (user, args, { models }) => {
			return await models.Message.findAll({
				where: { userId: user.id }, 
			});
		},
	},
}
