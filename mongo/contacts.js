const { Schema, model } = require("mongoose");
module.exports = model(
  "Contacts",
  new Schema({
    UID: String,
    List: Array
  })
);