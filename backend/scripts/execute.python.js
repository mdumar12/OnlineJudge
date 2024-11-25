import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export const executePython = (code, callback) => {
  const filePath = path.resolve('./temp', 'program.py');
  const command = `python ${filePath}`;

  fs.writeFileSync(filePath, code);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      callback(stderr, null);
    } else {
      callback(null, stdout);
    }
  });
};
