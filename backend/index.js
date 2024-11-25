import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { userRoutes } from "./routes/user.route.js";
import problemRoutes  from "./routes/problem.routes.js";
import submissionRoutes from "./routes/submission.router.js";
import bodyParser from 'body-parser';
import codeRoutes from './routes/code.routes.js';

// console.log('PORT:', process.env.PORT); 
// // Log to verify PORT 
// console.log('DATABASE_URL:', process.env.DATABASE_URL); 
// // Log to verify DATABASE_URL 
// console.log('SECRET_KEY:', process.env.SECRET_KEY);
// console.log('EMAIL_USER:', process.env.EMAIL_USER); 
// // Log to verify EMAIL_USER 
// console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

const io = new Server(server, {
    cors: { origin: 'http://localhost:5173' }
});

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/user', userRoutes);
app.use('/problems', problemRoutes);
app.use('/submissions', submissionRoutes);
app.use('/api/code', codeRoutes);

app.get('/', (req, res) => {
    res.send(`Server is running on ${PORT}`);
});

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('DB connected successfully...'))
    .catch((err) => console.log('DB failed to connect...', err));

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
