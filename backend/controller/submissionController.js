import Submission from '../models/submission.js';

// Create a new submission
export const createSubmission = async (req, res) => {
  try {
    const { userId, problem_Id, problem_code, code_time_to_run, code_auxillary_space, status, contestType } = req.body;
    const newSubmission = new Submission({
      userId,
      problem_Id,
      problem_code,
      code_time_to_run,
      code_auxillary_space,
      status,
      contestType
    });

    await newSubmission.save();

    res.status(201).json({ message: 'Submission created successfully', newSubmission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all submissions
export const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
                                        .populate('userId', 'email')
                                        .populate('problem_Id', 'title');
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single submission by ID
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
                                       .populate('userId', 'email')
                                       .populate('problem_Id', 'title');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.status(200).json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a submission
export const updateSubmission = async (req, res) => {
  try {
    const updates = req.body;
    const submission = await Submission.findByIdAndUpdate(req.params.id, updates, { new: true })
                                       .populate('userId', 'email')
                                       .populate('problem_Id', 'title');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.status(200).json({ message: 'Submission updated successfully', submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a submission
export const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.status(200).json({ message: 'Submission deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
