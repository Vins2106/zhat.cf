const express = require("express");
const app = express.Router();
let data = require("../mongo/data.js");

app.get('/', async (req, res) => {
  if (req.query.error == "true") {
    return res.render("login.ejs", {
      error: true,
      msg: req.query.message
    })
  }
  
  res.render("login.ejs", {
    error: false
  })
});

app.post('/', async (req, res) => {
  
  let checkFirstEmail = await data.findOne({Email: req.body.email});
  if (!checkFirstEmail) return res.redirect("/login?error=true&message=Invalid email");
  
  let checkFirstEmailPassword = await data.findOne({Email: req.body.email, Password: req.body.password});
  if (!checkFirstEmailPassword) return res.redirect("/login?error=true&message=Invalid email & password");
  
  req.session.user = checkFirstEmailPassword;
  
  if (req.query.callback) {
    return res.redirect(req.query.callback);
  }
  
  res.redirect("/me")
  
  console.log(`[LOGIN_EVENT] ${req.body.email} login - ${req.ip}`)
});

module.exports = app;