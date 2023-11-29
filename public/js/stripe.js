/*eslint-disable*/

import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51Nyg96SFreGyZNU6vfpzlMP8w6o28PyL4HbCulcjhrzDpe8xYg0gNvr9cLcTmubk9fd1IeYUXKEUYtlVn9ksDWpV00tcck32lG'
);

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from api
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
    console.log(session);
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
