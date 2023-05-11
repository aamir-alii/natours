export const showAlert = (type, message) => {
  const markup = `<div class='alert alert--${type}'>${message}  </div> `;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
};

export const hideAlert = () => {
  const element = document.querySelector('.alert');
  element.parentElement.removeChild(element);
};
