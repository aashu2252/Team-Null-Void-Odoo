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
        role: decoded.role,
        permissions: decoded.permissions || []
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

const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden, no permissions found'
      });
    }

    const hasPermission = requiredPermissions.some(permission => 
      req.user.permissions.includes(permission) || req.user.permissions.includes('*')
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden, insufficient permissions'
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
