const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');

      // Attach decoded payload to request
      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token verification failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

module.exports = protect;
