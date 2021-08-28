const express = require("express");
const app = express.Router();
let data = require("../mongo/data.js");
let contacts = require("../mongo/contacts.js");
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
  
  let username = req.body.newusername;
  let email = req.body.newemail;
  let password = req.body.newpassword;
  
  let checkEmail = await data.findOne({Email: email});
  if (checkEmail) return res.redirect("/signup?error=true&message=Email already used");
  
  if (!typeof validator.isEmail(email) == 'true') {
    return res.redirect("/signup?error=true&message=Invalid email")
  }
  
  if (!typeof validator.isStrongPassword(password, {minLength: 8, minNumber: 1, minSymbols: 1}) == 'true') {
    return res.redirect("/signup?error=true&message=Password not strong. min length 8, min number 1, min symbols 1")
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
  
  let newContact = await GetContact(dataStruct.UID);
  newContact.List.push({id: 'OLVGGLFUCKxRac8FOg', num: 1})
  newContact.save()
  
  req.session.user = dataStruct;
  
  res.redirect("/me");
  
  console.log(`[CREATED_EVENT] ${email} created - ${req.ip}`)
  
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

async function GetContact(UID) {
  if (!UID) return;
  
  let check = await contacts.findOne({UID: UID});
  
  if (!check) {
    
    let newData = new contacts({
      UID: UID,
      List: []
    });
    
    return newData;
  }
  
  return check;
}