const ldapUtils = require('../utils/ldap.utils');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// TODO: Authentication for administrators

async function authenticate_employee(userDn, password){
    return new Promise(async (resolve, reject) => {
    try{
        console.log(userDn)
        await ldapUtils.createLdapConnection(userDn, password);

        const token = jwt.sign({userDn: userDn}, process.env.JWT_SECRET, {expiresIn: '1h'})
        console.log(token)
        resolve(token)
    }catch(err){
        //console.log(err)
        reject(err)
    }finally{
        ldapUtils.closeLdapConnection();
    }
    });
}

async function post_employee_login(req, res, next){
    try{
        const token = await authenticate_employee(req.body.userDn, req.body.password)
        if (token){
            res.json({"message": "success", "token": token})
        }else{
            res.status(401).json({"message": "Invalid credentials"})
        }
    }catch(error){
        if (error.name === 'InvalidCredentialsError'){
            res.status(401).json({"message": "Invalid credentials"})
        
        }else{
            res.status(500).json({"message": "Server Error"})
        }
        
    }
}

module.exports = {
    post_employee_login
};