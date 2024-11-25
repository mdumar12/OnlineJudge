import express from 'express';
import { createSubmission, getSubmissions, getSubmissionById, updateSubmission, deleteSubmission } from "../controller/submissionController.js";
import isAuthenticated from "../middleware/authentication.js";

const router = express.Router();

// Create a new submission
router.post('/', isAuthenticated, createSubmission);

// Get all submissions
router.get('/', isAuthenticated, getSubmissions);

// Get a single submission by ID
router.get('/:id', isAuthenticated, getSubmissionById);

// Update a submission
router.put('/:id', isAuthenticated, updateSubmission);

// Delete a submission
router.delete('/:id', isAuthenticated, deleteSubmission);

export default router;
