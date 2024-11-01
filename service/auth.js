const JWT = require('jsonwebtoken');
const secret = "RadheKrishna$1103003@$"

function setUser(user){
    return JWT.sign({
        _id:user._id,
        email:user.email
    },secret)
}

function getUser(token){
    if(!token) return null;
    try {
        return JWT.verify(token,secret);
    } catch (error) {
        return null;
    }

    
}

module.exports = {
    setUser,getUser,
}