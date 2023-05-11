const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

const run = async () => {
  await mongoose.connect(process.env.DATABASE_URI, {
    dbName: 'Natours',
  });
};
const PORT = process.env.PORT || 7000;

run()
  .then((_con) => {
    console.log('db connected');
    const server = app.listen(PORT, () =>
      console.log(`App Running on http://localhost:${PORT}`)
    );

    process.on('uncaughtException', (err) => {
      console.log('uncaught Exeception! 💥 Shuttig Down!');
      console.log(err);
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
    process.on('SIGTERM', () => {
      console.log('SIGTERM Recieved! 💥 Shuttig Down!');
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit();
  });

// process.on('uncaughtException');
