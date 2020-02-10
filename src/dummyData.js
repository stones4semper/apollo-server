const dotenv = require('dotenv')
dotenv.config()
const PASSWORD = process.env.PASSWORD

var randomWords = require('random-words')
import models, { sequelize } from './models'

const createUsersWithMessages = async date => {
	await models.User.create(
		{
			username: 'Admin',
			email: 'admin@gmail.com',
			pix:`/assets/img/teacher_1.jpg`,
			password: PASSWORD,
			fullname:"Eloike David",
			role: 'ADMIN',
			messages: [
				{
					text: 'Published the School of Hard Knocks',
					createdAt: date.setSeconds(date.getSeconds() + 1),
				},
			],
		},
		{
			include: [models.Message],
		},
	);
	var num;
    var arr = Array.from({length: 20}, () => Math.floor(Math.random() * 20));
    for (let ind = 0; ind < 50; ind++) {
		var description = arr.includes(ind) ? randomWords({ exactly: 25, join: ' ' }): null
		num = Math.floor(Math.random()*(6 - 1) + 1)
		await models.User.create({
			username: `agent${ind}`,
			email: `agent${ind}@gmail.com`,
			password: PASSWORD,
			fullname:`Agent ${ind}`,
			pix:`/assets/images/agen-s-3-${num}.jpg`,
			role: 'AGENT',
			description: description,
			isAgentApproved:'No'          
		});

		await models.User.create({
			username: `guest${ind}`,
			email: `guest${ind}@gmail.com`,
			password: PASSWORD,
			fullname: `Guest ${ind}`,     
			pix:`/assets/images/agen-s-3-${num}.jpg`,
		})
    }


	console.log('finished')
};

export default createUsersWithMessages