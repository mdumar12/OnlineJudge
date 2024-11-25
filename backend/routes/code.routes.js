import express from 'express';
import { executeCode } from '../controller/codeController.js';
import isAuthenticated from '../middleware/authentication.js';

const router = express.Router();

router.post('/execute', isAuthenticated, executeCode);

export default router;
