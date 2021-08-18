const express = require("express");
const app = express.Router();
let data = require("../mongo/data.js");
var validator = require('validator');

app.get("/", async (req, res) => {
  if (req.query.error == "true") {
    return res.render("signup.ejs", {
      error: true,
      msg: req.query.message
    })
  }  
  
  res.render("signup.ejs", {
    error: false
  })
  
});

app.post("/", async (req, res) => {
  
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  
  let checkEmail = await data.findOne({Email: email});
  if (checkEmail) return res.redirect("/signup?error=true&message=Email already used");
  
  if (!typeof validator.isStrongPassword(password) == 'true') {
    return res.redirect("/signup?error=true&message=Password not strong")
  }

  let dataStruct = {
    Email: email,
    Password: password,
    Username: username,
    UID: makeid(18) ,
    Avatar: "https://i.stack.imgur.com/l60Hf.png",
    Wallpaper: false
  }
  
  let newData = new data(dataStruct);
  newData.save();
  
  req.session.user = dataStruct;
  
  res.redirect("/");
  
});

module.exports = app;

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}