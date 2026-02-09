#!/usr/bin/env node

const {spawn} = require('child_process');

const port = process.env.NODE_ENV === 'production' ? 3000 : 3200;
// const port = process.env.NODE_ENV === 'production' ? 3000 : 3000;
const mode =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';
const env = process.env.NODE_ENV || 'development';

console.log(`🚀 Starting webpack dev server in ${env} mode on port ${port}...`);

console.log(`🚀 BASE_URL: ${process.env.BASE_URL}`);


const webpack = spawn(
  'webpack',
  [
    'serve',
    '--mode',
    mode,
    '--config',
    'webpack.config.js',
    '--port',
    port.toString(),
  ],
  {
    stdio: 'inherit',
    shell: true,
  },
);

webpack.on('error', error => {
  console.error('❌ Error starting webpack server:', error);
  process.exit(1);
});

webpack.on('exit', code => {
  process.exit(code);
});
