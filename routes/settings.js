const express = require("express");
const app = express.Router();
let data = require("../mongo/data.js");
var validator = require('validator');

app.get("/", checkAuth, async (req, res) => {
  if (req.query.error == "true") {
    return res.render("settings.ejs", {
      req,
      res,
      error: true,
      msg: req.query.message
    })  
  }
  
  res.render("settings.ejs", {
    error: false,
    req,
    res
  })
});

app.post("/", checkAuth, async (req, res) => {
  
  let username = req.body.username;
  let password = req.body.password;
  let avatar = req.body.avatar;
  let email = req.body.email;
  let wallpaper = req.body.wallpaper;
  
  if (!typeof validator.isStrongPassword(password) == 'true') {
    return res.redirect("/settings?error=true&message=Password not strong")
  }
  
  if (!avatar.startsWith("https://") && !avatar.startsWith("http://")) {
    return res.redirect("/settings?error=true&message=Invalid avatar url");
  } else if (!avatar.endsWith(".png") && !avatar.endsWith(".jpg") && !avatar.endsWith(".gif")) {
    return res.redirect("/settings?error=true&message=Avatar url must be .png, .jpg, or .gif");
  }
  
  if (wallpaper) {
  if (!wallpaper.startsWith("https://") && !wallpaper.startsWith("http://")) {
    return res.redirect("/settings?error=true&message=Invalid wallpaper url");
  } else if (!wallpaper.endsWith(".png") && !wallpaper.endsWith(".jpg") && !wallpaper.endsWith(".gif")) {
    return res.redirect("/settings?error=true&message=Wallpaper url must be .png, .jpg, or .gif");
  }      
  }
  
  let findAcc = await data.findOne({Email: req.body.email});
  findAcc.Username = username;
  findAcc.Password = password;
  findAcc.Avatar = avatar;
  if (wallpaper) {
    findAcc.Wallpaper = wallpaper;
  } else {
    findAcc.Wallpaper = null;
  }
  findAcc.save();
  
  req.session.user = findAcc;
  
  return res.redirect("/me")
  
});

module.exports = app;

function checkAuth(req, res, next) {
  if (req.session.user) return next();
  
  return res.redirect("/login")
}