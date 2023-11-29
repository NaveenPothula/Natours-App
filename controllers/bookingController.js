const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const factory = require('./handleFactory');

exports.getCheckoutSession = async (req, res, next) => {
  try {
    // 1) Get currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: `${tour.summary}`,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
            },
            unit_amount: tour.price * 100
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/?tour=${
        req.params.tourId
      }&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`
    });

    // 3) Create session as response
    res.status(200).json({
      status: 'success',
      session
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createBookingCheckout = async (req, res, next) => {
  // This is TEMPORARY, because it's UNSECURE: everyone can make belonging without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
};

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
