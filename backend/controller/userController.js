import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { body, validationResult } from "express-validator";
import crypto from 'crypto';

const secretKey = process.env.SECRET_KEY;

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "Gmail", 
    secure:true,
    port:465,
    auth: { 
        user: 'umar630492866@gmail.com',  
        pass: 'vxva cvzu kfbe srng',
    } 
});

export const validateUser = [
    body('firstName').isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    body('lastName').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('phone').matches(/^\+[1-9]{1}[0-9]{1,14}$/).withMessage('Invalid phone number with country code'),
    body('role').isIn(['Student', 'Employer']).withMessage('Choose either "Student" or "Employer" from the options'),
    body('problem_solving').isInt({ min: 1, max: 5 }).withMessage('Rating must be from 1 to 5'),
    body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
];

export const validateUpdateProfile = [
    body('firstName').optional().isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    body('lastName').optional().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('phone').optional().matches(/^\+[1-9]{1}[0-9]{1,14}$/).withMessage('Invalid phone number with country code'),
    body('role').optional().isIn(['Student', 'Employer']).withMessage('Choose either "Student" or "Employer" from the options'),
    body('problem_solving').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be from 1 to 5'),
    body('password').optional().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
];

export const email_verification = async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.SECRET_KEY, { algorithm: 'HS256', expiresIn: '1h' });
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ message: 'Invalid token or user does not exist' });
        }
        user.isVerified = true;
        await user.save();
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone, password, role, problem_solving } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        const phoneExists = await User.findOne({ phone });

        if (phoneExists) {
            return res.status(400).json({ message: 'Phone Number already exists...' });
        }

        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName, lastName, email, phone, role, problem_solving, password: hashedPassword, isVerified: false
        });

        const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, { algorithm: 'HS256', expiresIn: '1d' });
        const mailOptions = {
            to: newUser.email,
            from: process.env.EMAIL_USER,
            subject: 'Email Verification',
            text: `Please verify your email by clicking the following link: http://localhost:process.env.PORT/verify-email/${token}`
        };
        await transporter.sendMail(mailOptions);

        await newUser.save();
        res.status(201).json({ message: 'Account created successfully...' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Login api 
export const login = async (req, res) => { 
    [ 
        // Email must be valid 
        body('email').isEmail().withMessage('Invalid email address'),  
        // Password must be provided 
        body('password').exists().withMessage('Password is required') 
    ]
    const errors = validationResult(req); 
    if (!errors.isEmpty()) { 
        return res.status(400).json({ errors: errors.array() }); 
    } 
    const { email, password } = req.body; 
    try { 
        const user = await User.findOne({ email }); 
        if (!user || !(await bcrypt.compare(password, user.password))) { 
            return res.status(400).json({ message: 'Invalid email or password' }); 
        } 
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' }); 
        res.status(200).json({ message: 'Login successful', token }); 
    } catch (err) {
        res.status(500).json({ error: err.message }); 
    } 
}; 

// Forgot password route 
export const forgotPassword = async (req, res) => { 
    body('email').isEmail().withMessage('Invalid email address'); 
    const { email } = req.body; 
    try { 
        const user = await User.findOne({ email }); 
        if (!user) { 
            return res.status(400).json({ message: 'User with this email does not exist' }); 
        } 
        const token = crypto.randomBytes(32).toString('hex'); 
        const hashedToken = await bcrypt.hash(token, 10); 
        user.resetPasswordToken = hashedToken; 
        user.resetPasswordExpires = Date.now() + 3600000; 
        // 1 hour 
        await user.save(); 
        const mailOptions = { 
            to: user.email, from: process.env.EMAIL_USER, 
            subject: 'Password Reset', 
            text: `Please reset your password by clicking the following link: http://localhost:8000/user/reset-password/${token}` 
        }; 
        await transporter.sendMail(mailOptions); 
        res.status(200).json({ message: 'Password reset email sent' }); 
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    } 
};

// Reset password route 
export const resetPassword = body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long');
    async(req, res) => {
    const { token } = req.params; 
    const { password } = req.body; 
    console.log('Received token:', token); 
    console.log('New password:', password);
    try { 
        const user = await User.findOne({ 
            resetPasswordToken: { $ne: null }, 
            resetPasswordExpires: { $gt: Date.now() } 
        }); 
        if (!user) { 
            return res.status(400).json({ message: 'Invalid or expired token' }); 
        } 
        const isMatch = bcrypt.compare(token, user.resetPasswordToken); 
        
        if (!isMatch) { 
            return res.status(400).json({ message: 'Invalid or expired token' }); 
        } 
        user.password = await bcrypt.hash(password, 10); 
        user.resetPasswordToken = null; 
        user.resetPasswordExpires = null; 
        await user.save(); res.status(200).json({ message: 'Password has been reset' }); 
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    } 
};

export const profile = async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password'); // Exclude the password field

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with user details
        // res.send(`Welcome, user with ID: ${user._id}`);
        res.json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                problem_solving: user.problem_solving
            }
        });
    } catch (err) {
        res.status(500).json({ status: false, message: "Something went wrong", error: err.message });
    }
};


//Logout api
export const logout=async(req, res) => {
    try{
        const token = req.header('Authorization')?.replace('Bearer ', '');
        addTokenToBlacklist(token);
        res.status(200).cookies("token","",{maxAge:0}).json({ message: 'Logout successful' });
    }catch(error){
        console.log(error);
    }
};

export const updateProfile=async(req,res) => {
    const errors = validationResult(req); 
    // Return validation errors, if any 
    if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() }); 
    } 
    const { firstName, lastName, email, phone, password, role, problem_solving } = req.body; 
    try {
        // Find the user by ID 
        const user = await User.findById(req.user.id); 
        // Assuming the user's ID is available in req.user.id 
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); 
        } 
        // Check if the email is being updated and if it already exists 
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email }); 
            if (existingUser) { 
                return res.status(400).json({ message: 'Email already exists' }); 
            } 
            user.email = email; 
        } 
        
        // Check if the phone number is being updated and if it already exists 
        if (phone && phone !== user.phone) { 
            const phoneExists = await User.findOne({ phone }); 
            if (phoneExists) { 
                return res.status(400).json({ message: 'Phone Number already exists' }); 
            } user.phone = phone; 
        } 
        
        // Update the user fields 
        if (firstName) user.firstName = firstName; 
        if (lastName) user.lastName = lastName; 
        if (role) user.role = role; 
        if (problem_solving) user.problem_solving = problem_solving; 
        // Hash the new password if it is being updated 
        if (password) { 
            const hashedPassword = await bcrypt.hash(password, 10); 
            user.password = hashedPassword; 
        } 
        // Save the updated user to the database 
        await user.save(); 
        res.status(200).json({ message: 'Profile updated successfully' }); } 
        catch (err) {
            res.status(500).json({ error: err.message });
        }
}

