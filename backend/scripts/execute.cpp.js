import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const executeCpp = (code, callback) => {
  const filePath = path.resolve('./temp', 'program.cpp');
  const command = `g++ ${filePath} -o ./temp/program && ./temp/program`;

  fs.writeFileSync(filePath, code);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      callback(stderr, null);
    } else {
      callback(null, stdout);
    }
  });
};
export default executeCpp;
