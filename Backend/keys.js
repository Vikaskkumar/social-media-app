const mongoUrl = process.env.MONGODB_URI;
const Jwt_secret = process.env.JWT_SECRET;

module.exports = { mongoUrl, Jwt_secret };
