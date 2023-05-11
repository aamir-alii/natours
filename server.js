const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

mongoose
  .connect(process.env.DATABASE_URI, {
    dbName: 'Natours',
  })
  .then((_con) => console.log('db connected'))
  .catch((error) => console.log(error.message));

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () =>
  console.log(`App Running on http://localhost:${PORT}`)
);

process.on('uncaughtException', (err) => {
  console.log('uncaught Exeception! 💥 Shuttig Down!');
  server.close(() => {
    process.exit(1);
  });
});
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! 💥 Shuttig Down!');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

// process.on('uncaughtException');
