import jwt from 'jsonwebtoken';
const { verify } = jwt;
import User from '../models/users.js';
// import tokenBlockList from './tokenBlockList.js';

// const secretKey = process.env.SECRET_KEY;

const auth = async (req, res, next) => {
  try {
    // if (tokenBlockList.has(token)) {
    //   throw new Error('Token is invalid');
    // }
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

export default auth;
