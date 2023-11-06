const jwt = require('jsonwebtoken');
require('dotenv').config();

/*const verifyToken = (req, res, next) => {
    let authToken = req.headers['authorization'];
    
        if (authToken && authToken.startsWith('Bearer ')){
            try{
                let token = authToken.slice(7, authToken.length);
                const decoded = jwt.verify(token, process.env.APP_SECRET);
                req.userDn = decoded.userDn;
            }catch(err){
                console.log(err)
                return res.status(401).json({"message": "Invalid token"})
            }
        }else{
            return res.status(403).json({"message": "Token is required for authentication"})
        }
    
    return next();
}*/
const isEmployeeLoggedIn = (req, res, next) => {
    if (req.session.userDn){
        return next();
    }else{
        return res.redirect('/auth/employee-login');
    }
}

const isAdminLoggedIn = (req, res, next) => {
    if (req.session.adminEmail){
        return next();
    }else{
        return res.redirect('/auth/admin-login');
    }
}

module.exports = {
    isEmployeeLoggedIn,
    isAdminLoggedIn
};