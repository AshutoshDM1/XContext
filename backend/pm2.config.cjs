module.exports = {
  name: 'xcontext-backend', // Name of your application
  script: 'dist/index.js', // Entry point of your application
  interpreter: 'bun', // Bun interpreter
  env: {
    PATH: `/root/.bun/bin/bun`, // Add "~/.bun/bin/bun" to PATH
  },
};
