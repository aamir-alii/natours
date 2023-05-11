const express = require('express');
const app = express();
const loader = require('./loaders/');

// loading all middleware and routes
loader(app);

module.exports = app;
