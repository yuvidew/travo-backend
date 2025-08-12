const jwt = require("jsonwebtoken");


const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            code: 401,
            message: "Authentication error. Token required.",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });
        req.decoded = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            code: 403,
            message: "Authentication error. Invalid or expired token.",
        });
    }
}

module.exports = {
    authenticate,
};

