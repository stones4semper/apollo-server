import Joi from 'joi'

const email = Joi.string().email().required().label('Email')
const username = Joi.string().alphanum().min(4).max(30).required().label('Username')
const fullname = Joi.string().max(254).required().label('Name')
const password = Joi.string().regex(/(?=^.{8,30}$)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).*/).label('Password').options({
    language:{
        string:{
            regex:{
                base:'Password must contain be an uppercase, lowercase letter, digit,special character and must be between 8 to 30 characters'
            }
        }
    }
})

export const SignUp = Joi.object().keys({  
    email, username, fullname, password
})
export const SignIn = Joi.object().keys({
    password
})