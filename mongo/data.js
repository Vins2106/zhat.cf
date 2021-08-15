const { Schema, model } = require("mongoose");
module.exports = model(
  "Data",
  new Schema({
    Email: String,
    Password: String,
    Username: String,
    UID: String
  })
);