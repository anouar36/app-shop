// Simple script to run Next.js dev server
const { createServer } = require('next');
const app = createServer({
  dev: true,
  dir: '.',
});

app.prepare().then(() => {
  console.log('Next.js server is running on http://localhost:3006');
}).catch(err => {
  console.error('Error starting Next.js server:', err);
});
