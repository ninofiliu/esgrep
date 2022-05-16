/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  transform: {
    "\\.ts$": "@sucrase/jest-plugin",
  },
};
