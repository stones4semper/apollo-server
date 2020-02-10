import jwt from 'jsonwebtoken'
// import {AuthenticationError} from 'apollo-server-express'
import fs from 'fs';
import path from 'path';
const privateKey = fs.readFileSync(path.join(__dirname, './key/priv.key'), 'utf8');
const publicKey = fs.readFileSync(path.join(__dirname, './key/pub.pem'), 'utf8');
const expiresIn = '30m'

export const verifyJWT = async (token)=>{ 
    try{
        return await jwt.verify(token, publicKey)
    } catch(err){
        console.log(err)
        // return new Error('Your session expired, sign in again')
    } 
}

export const createToken = async (user) => {
    const { id, email, username, role, isTeacherApproved } = user;
    return await jwt.sign({ id, email, username, role, isTeacherApproved }, privateKey, { algorithm: 'RS256'}, {expiresIn}); 
};