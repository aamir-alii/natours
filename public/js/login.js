import axios from 'axios';
import { showAlert, hideAlert } from './alerts';

export const login = async (email, password) => {
  const body = { email, password };
  try {
    const res = await axios({
      method: 'post',
      url: 'http://localhost:8000/api/v1/users/login',
      data: body,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'logged in successfully');
      setTimeout(() => window.location.assign('/'), 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    setTimeout(() => hideAlert(), 3000);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:8000/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully');
      if ((location.pathname = '/me')) {
        let url = location.origin + '/';
        location.href = url;
      } else {
        location.reload(true);
      }
    }
  } catch (error) {
    console.log(error);
    showAlert('error', 'Error logging out! try again');
  }
};
