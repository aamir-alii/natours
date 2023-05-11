const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');

module.exports = async (app) => {
  // for server side rendering
  app.set('view engine', 'pug');
  app.set('views', `${__dirname}/../views`);
  // for setting important headers // http header
  app.use((req, res, next) => {
    next();
    res.setHeader(
      'Content-Security-Policy',
      "script-src  'self' api.mapbox.com https://js.stripe.com/v3/ unsafe-inline",
      "script-src-elem 'self' api.mapbox.com https://js.stripe.com/v3/",
      'font-src *'
    );
  });
  app.use(helmet({}));
  // router mounting

  app.use(compression());
  app.use(cors({ origin: '*' }));
  // rate limiter from same ip
  const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP please try again in 1 hour',
  });

  app.use('/api', limiter);
  // body parser for json
  app.use(express.json());
  // body parser for form encoded
  app.use(bodyParser.urlencoded({ extended: true }));
  // parse cookies
  app.use(cookieParser());
  // data sanitization against NoSql injection
  app.use(mongoSanitize());
  // data sanitization against XSS
  app.use(xss());
  // prevent paramater polution
  app.use(
    hpp({
      whitelist: ['duration'],
    })
  );
  // for logging req details
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  // for serving static files
  app.use(express.static(`${__dirname}/../public`));

  return app;
};
