const { Schema, model } = require("mongoose");
module.exports = model(
  "Bots",
  new Schema({
    TOKEN: String,
    UID: String,
    Username: String,
    Avatar: String,
    Email: String,
    Wallpaper: String,
    Password: String,
    Bot: true
  })
);