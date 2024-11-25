import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export const executeJava = (code, callback) => {
  const filePath = path.resolve('./temp', 'Program.java');
  const command = `javac ${filePath} && java -cp ./temp Program`;

  fs.writeFileSync(filePath, code);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      callback(stderr, null);
    } else {
      callback(null, stdout);
    }
  });
};
