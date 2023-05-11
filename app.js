const express = require('express');
const app = express();
const loader = require('./loaders/');

loader(app);

module.exports = app;
