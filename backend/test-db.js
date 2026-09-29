const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

console.log("Attempting to connect to:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("SUCCESS: MongoDB Connected Successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("ERROR: Failed to connect to MongoDB.");
    console.error(err);
    process.exit(1);
  });
