import axios from 'axios';
import { showAlert, hideAlert } from './alerts';
export const updateSetting = async (userData, type) => {
  try {
    const url =
      type === 'data'
        ? '/api/v1/users/updateme'
        : '/api/v1/users//updatemypassword';
    const res = await axios({
      url,
      method: 'PATCH',
      data: userData,
    });
    showAlert(
      'success',
      `${type[0].toUpperCase() + type.slice(1)} updated successfully`
    );
    if (type === 'password') setTimeout(hideAlert, 5000);
  } catch (error) {
    showAlert('error', error.response.data.message);
    setTimeout(hideAlert, 5000);
  }
};
