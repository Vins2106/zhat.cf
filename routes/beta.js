const express = require("express");
const app = express.Router();
let data = require("../mongo/data.js");
var validator = require('validator');
let contacts = require("../mongo/contacts.js");

app.get("/", checkAuth, async (req, res) => {
  res.render("beta/index.ejs")
});

app.get("/login", async (req, res) => {
  res.render("beta/login.ejs")
})

module.exports = app;

function checkAuth(req, res, next) {
  if (req.session.user) return next();
  
  return res.redirect("/login")
}

async function GetContact(UID) {
  let check = await contacts.findOne({UID: UID});
  
  if (!check) {
    
    let newData = new contacts({
      UID: UID,
      List: []
    });
    
    newData.save()
    
    return newData;
  }
  
  return check;
}