const ldapUtils = require('../utils/ldap.utils');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// TODO: Authentication for administrators

/*async function authenticate_employee(userDn, password){
    return new Promise(async (resolve, reject) => {
    try{
        console.log(userDn)
        await ldapUtils.createLdapConnection(userDn, password);

        const token = jwt.sign({userDn: userDn}, process.env.APP_SECRET, {expiresIn: '1h'})
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
}*/

async function authenticate_employee(userDn, password){
    return new Promise(async (resolve, reject) => {
    try{
        console.log(userDn)
        await ldapUtils.createLdapConnection(userDn, password);
        resolve(userDn)
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
        console.log(req.body)
        const userDn = await authenticate_employee(req.body.userDn, req.body.password)
        if (userDn){
            req.session.userDn = userDn;
            req.session.loggedIn = true;
            res.redirect('/employee/home')
        }else{
            res.status(401).json({"message": "Invalid credentials"})
        }
    }catch(error){
        if (error.name === 'InvalidCredentialsError'){
            res.status(401).json({"message": "Invalid credentials"})
        
        }else{
            console.log(error)
            res.status(500).json({"message": "Server Error"})
        }
        
    }
}

async function post_employee_logout(req, res, next){
    try{
        req.session.destroy();
        res.redirect('/auth/login')
    }catch(error){
        console.log(error)
        res.status(500).json({"message": "Server Error"})
    }
}


module.exports = {
    post_employee_login,
    post_employee_logout
};