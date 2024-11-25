import Problem from "../models/problems.js";

// Create a new problem
export const createProblem = async (req, res) => {
  try {
    const { title, problemName, problemDescription, problemConstraints, pID_UserID, level, testCases } = req.body;
    const created_by = req.user._id;

    const newProblem = new Problem({
      title,
      problemName,
      problemDescription,
      problemConstraints,
      pID_UserID,
      level,
      created_by,
      allocated_time: undefined, // This will be set automatically based on level
      testCases
    });

    await newProblem.save();

    res.status(201).json({ message: 'Problem created successfully', newProblem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all problems
export const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find()
                                  .populate('pID_UserID', 'email')
                                  .select('-testCases'); // Exclude testCases from list
    res.status(200).json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single problem by ID
export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
                                 .populate('pID_UserID', 'email');

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Show only visible test cases
    const visibleTestCases = problem.testCases.filter(tc => tc.visible).slice(0, 3);
    const hiddenTestCases = problem.testCases.filter(tc => !tc.visible);

    res.status(200).json({
      problem,
      testCases: [...visibleTestCases, ...hiddenTestCases]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a problem
export const updateProblem = async (req, res) => {
  try {
    const updates = req.body;
    const problem = await Problem.findByIdAndUpdate(req.params.id, updates, { new: true })
                                 .populate('pID_UserID', 'email');

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.status(200).json({ message: 'Problem updated successfully', problem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a problem
export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.status(200).json({ message: 'Problem deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
