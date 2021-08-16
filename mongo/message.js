const { Schema, model } = require("mongoose");
module.exports = model(
  "Messages",
  new Schema({
    ID: String,
    List: []
  })
);