#!/usr/bin/env node

const { spawn } = require('child_process');

const port = process.env.NODE_ENV === 'production' ? 3000 : 3200;
const env = process.env.NODE_ENV || 'development';

console.log(`🚀 Starting server in ${env} mode on port ${port}...`);

const serve = spawn('npx', ['serve', '-s', 'dist', '-l', `tcp://0.0.0.0:${port}`], {
  stdio: 'inherit',
  shell: true,
});

serve.on('error', (error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});

serve.on('exit', (code) => {
  process.exit(code);
});

