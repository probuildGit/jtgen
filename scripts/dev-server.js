const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const env = {
  ...process.env,
  PORT: process.env.PORT || '3003',
  PROXY_PORT: process.env.PROXY_PORT || '3004'
};

const proxy = spawn(process.execPath, ['server.web.js'], {
  cwd: root,
  env,
  stdio: 'inherit'
});

const reactScripts = path.join(root, 'node_modules', 'react-scripts', 'bin', 'react-scripts.js');
const app = spawn(process.execPath, [reactScripts, 'start'], {
  cwd: root,
  env,
  stdio: 'inherit'
});

let shuttingDown = false;

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  proxy.kill('SIGTERM');
  app.kill('SIGTERM');
  setTimeout(() => process.exit(code || 0), 200);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
proxy.on('exit', (code) => {
  if (!shuttingDown && code) shutdown(code);
});
app.on('exit', (code) => shutdown(code || 0));
