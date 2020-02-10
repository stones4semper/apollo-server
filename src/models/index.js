import Sequelize from 'sequelize';
const dotenv = require('dotenv');

dotenv.config();
const DBName=process.env.DBName
const DBUser=process.env.DBUser
const DBPassword=process.env.DBPassword
let sequelize;
(process.env.DATABASE_URL) ? sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: process.env.DB_DIALECT, })
: sequelize = new Sequelize(DBName,DBUser,DBPassword, { dialect: process.env.DB_DIALECT, },);
 
const models = {  
	User: sequelize.import('./user'),
	Message: sequelize.import('./message'),
};

Object.keys(models).forEach(key => {
	if ('associate' in models[key]) { models[key].associate(models) }
});

export { sequelize };
export default models;
