const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    let authToken = req.headers['authorization'];
    
        if (authToken && authToken.startsWith('Bearer ')){
            try{
                let token = authToken.slice(7, authToken.length);
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.userDn = decoded.userDn;
            }catch(err){
                console.log(err)
                return res.status(401).json({"message": "Invalid token"})
            }
        }else{
            return res.status(403).json({"message": "Token is required for authentication"})
        }
    
    return next();
} 

module.exports = {
    verifyToken
};