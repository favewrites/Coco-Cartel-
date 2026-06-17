// backend/config/flutterwave.js

const Flutterwave = require('flutterwave-node-v3');

// The robot grabs your secret key from the .env box
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY, // From your .env file
  process.env.FLW_SECRET_KEY  // From your .env file
);

// Share the robot with other files
module.exports = flw;