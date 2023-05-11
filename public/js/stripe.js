import axios from 'axios';
const stripe = Stripe(
  'pk_test_51N5kcfSBF1x0nnlTZKkgviNoX5YtNf5mPEUxcUzADubnoqZ0QU7eSd1dqBkt06B1y7ofZxiqKhOrKvqBcwSo1cIi00lsTduWWu'
);
export const bookTour = async (tourId) => {
  try {
    // get Sessoin from backend
    const res = await axios(`/api/v1/bookings/session/${tourId}`);

    const session = res.data.session;
    stripe.redirectToCheckout({
      sessionId: session.id,
    });
  } catch (err) {
    console.log(err);
  }
};
