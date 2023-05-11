const routesLoader = require('./routes');
const expressLoader = require('./express');

module.exports = async (app) => {
  await expressLoader(app);
  console.log('🚀 express intialized');
  await routesLoader(app);
  console.log('🚀 routes intialized');
  

  return app;
};
