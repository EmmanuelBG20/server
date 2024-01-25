// middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Acceso denegado' });

    jwt.verify(token, 'tu_secreto_secreto', (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });

        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
