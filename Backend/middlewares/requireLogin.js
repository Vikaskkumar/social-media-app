const jwt = require('jsonwebtoken');
const {Jwt_secret} = require('../keys');
const mongoose = require('mongoose');
const USER = mongoose.model('USER');


module.exports = async (req,res,next) =>{

    const { authorization } = req.headers;
    if(!authorization || !authorization.startsWith("Bearer ")){
        return res.status(401).json({error:"You must have to logged in"});
    }
    
    try {
        const token = authorization.slice(7).trim();
        if (!token || !Jwt_secret) {
            return res.status(401).json({error:"you must have logged in"});
        }

        const { _id } = jwt.verify(token, Jwt_secret);
        const userData = await USER.findById(_id);
        if (!userData) {
            return res.status(401).json({error:"you must have logged in"});
        }

        req.user = userData;
        next();
    } catch (error) {
        return res.status(401).json({error:"you must have logged in"});
    }

}
