const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect middleware to check if the user is logged in and has a valid token
const protect = async (req, res, next) => {
  let token;

  // Check if the token is in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      // Get the token from the Authorization header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token and get user information
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get the user from the database
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Attach the user object to the request for further use in route handlers
      req.user = user;

      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

module.exports = protect;
