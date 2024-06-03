const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        return decoded;
    } catch (err) {
        console.error("Invalid Token:", err.message);
        return false;
    }
};

module.exports = { bcrypt, jwt, verifyToken }