const { AppError } = require('../utils/');
const sendErrorDev = (req, res, error) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(error.statusCode).json({
      status: error.status,
      error,
      message: error.message,
      stack: error.stack,
    });
  } else {
    res.status(error.statusCode).render('error', {
      title: 'something went wrong',
      msg: error.message,
    });
  }
};

const sendErrorProd = (req, res, error) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message || 'unknown',
      });
    } else {
      console.error('Error 💥', error);
      res.status(500).json({
        status: 'error',
        message: 'something went very wrong',
      });
    }
  } else {
    if (error.isOperational) {
      res.status(error.statusCode).render('error', {
        title: 'Something went wrong',
        msg: error.message,
      });
    } else {
      res.status(error.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Something went wrong',
      });
    }
  }
};

const handleCastErrorDb = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDb = (err) => {
  // const value = err?.errmsg?.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const message = `duplicate field value: ${err.keyValue.name}. please use other one`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = (err) =>
  new AppError('invalid token please login', 401);
const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map(
    (el) => `${el.path} : ${el.message}`
  );
  const message = `invalid input data: ${errors.join(', ')}`;
  return new AppError(message, 400);
};
const handleTokenExpiredError = (err) =>
  new AppError('your token is expired login again!', 401);
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(req, res, err);
  } else {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = handleCastErrorDb(error);
    }
    if (err.code === 11000) error = handleDuplicateFieldsDb(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDb(error);
    if (err.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenError(error);
    }
    if (err.name === 'TokenExpiredError') {
      error = handleTokenExpiredError(error);
    }
    if (!error.message) error.message = err.message;
    sendErrorProd(req, res, error);
  }
};
