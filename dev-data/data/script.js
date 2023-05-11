const fs = require('fs');
const { Tour, Review, User } = require('../../models/');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose
  .connect(process.env.DATABASE_URI, {
    dbName: 'Natours',
  })
  .then((_con) => console.log('db connected'))
  .catch((error) => console.log(error.message));

// read Json File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// to import data
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data Imported');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
// to Delete Data

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('Data Deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// process.exit();
