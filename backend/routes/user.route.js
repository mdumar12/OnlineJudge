import express from 'express';
import { email_verification, forgotPassword, login, profile, register, resetPassword, updateProfile, validateUser, validateUpdateProfile} from '../controller/userController.js';
import isAuthenticated from '../middleware/authentication.js';

const router = express.Router();

router.post('/register', validateUser, register);
router.get('/register/verify-email/:token', email_verification);
router.post('/login', login);
router.post('/login/forgot_password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/profile', isAuthenticated, profile);
router.post('/profile/updateProfile', isAuthenticated, validateUpdateProfile, updateProfile);

export { router as userRoutes };
