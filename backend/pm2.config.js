module.exports = {
  name: 'xcontext-backend',
  script: 'dist/index.js',
  interpreter: 'bun',
  env: {
    PATH: `${process.env.BUN_PATH}`,
  },
};
