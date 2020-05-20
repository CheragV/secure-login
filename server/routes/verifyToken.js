const jwt = require('jsonwebtoken');

function auth(req, res, next) { 
    const token = req.header('auth-token');
    if (!token) { 
        res.status(400).send('Access Denied');
    }
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (e) { 
        res.status(400).send('Invalid token');
    }
}

module.exports = auth;