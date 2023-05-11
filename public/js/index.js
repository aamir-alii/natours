import '@babel/polyfill';
import { login, logout } from './login.js';
import { displayMap } from './mapbox.js';
import { updateSetting } from './updateSetting.js';
import { bookTour } from './stripe.js';

// DOM Elements
const loginBtn = document.getElementById('login');
const logoutBtn = document.querySelector('.nav__el--logout');
const mapElement = document.getElementById('map');
const emailElement = document.getElementById('email');
const nameElement = document.getElementById('name');
const photoElement = document.getElementById('photo');
const passwordElement = document.getElementById('password');
const userDataForm = document.querySelector('.form-user-data');
const userSettingForm = document.querySelector('.form-user-settings');
const bookTourElement = document.getElementById('book-tour');
// Delegations
if (photoElement) {
  photoElement.addEventListener('change', () => {
    const image = photoElement.files[0];
    document.getElementById('user-photo').src = URL.createObjectURL(image);
  });
}
if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData();
    const name = nameElement.value;
    const email = emailElement.value;
    const photo = photoElement.files[0];
    form.append('name', name);
    form.append('email', email);
    form.append('photo', photo);
    console.log(form);
    await updateSetting(form, 'data');
    setTimeout(() => location.reload(true), 3000);
  });
}
if (userSettingForm) {
  userSettingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSetting(
      { currPassword, password, passwordConfirm },
      'password'
    );
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
if (mapElement) {
  const locations = JSON.parse(mapElement.dataset.locations);
  displayMap(locations);
}
if (loginBtn) {
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = emailElement.value;
    const password = passwordElement.value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => logout());
}

if (bookTourElement) {
  bookTourElement.addEventListener('click', async (e) => {
    e.target.textContent = 'Proccessing...';
    const tourId = e.target.dataset.tourId;
    await bookTour(tourId);
    e.target.textContent = 'Book Tour Now!';
  });
}
