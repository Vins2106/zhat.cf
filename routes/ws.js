const express = require("express");
const app = express.Router();
const WebSocket = require("ws")
const http = require('http').Server(app);
 
app.get("/", async (req, res) => {
  res.render("botws.ejs")
})

module.exports = app;