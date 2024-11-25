import express from 'express';
import { createProblem, getProblems, getProblemById, updateProblem, deleteProblem } from '../controller/problemController.js';
import isAuthenticated from '../middleware/authentication.js';

const router = express.Router();

// Create a new problem
router.post('/', isAuthenticated, createProblem);

// Get all problems
router.get('/', isAuthenticated, getProblems);

// Get a single problem by ID
router.get('/:id', isAuthenticated, getProblemById);

// Update a problem
router.put('/:id', isAuthenticated, updateProblem);

// Delete a problem
router.delete('/:id', isAuthenticated, deleteProblem);

export default router;
