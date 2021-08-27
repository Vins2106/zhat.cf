const { Schema, model } = require("mongoose");
module.exports = model(
  "BotsData",
  new Schema({
    OWNER: String,
    TOKEN: String,
    UID: String,
    Username: String,
    Avatar: String,
    Email: String,
    Wallpaper: String,
    Password: String,
    Bot: Boolean
  })
);