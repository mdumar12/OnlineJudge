import { executeJava } from "../scripts/execute.java.js";
import { executePython }  from "../scripts/execute.python.js";
import executeCpp  from "../scripts/execute.cpp.js";


export const executeCode = (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: 'Language and code are required' });
  }
  
  const execute = {
    'java': executeJava,
    'python': executePython,
    'cpp': executeCpp,
  }[language];

  if (!execute) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  execute(code, (error, output) => {
    if (error) {
      res.status(500).json({ error });
    } else {
      res.status(200).json({ output });
    }
  });
};
