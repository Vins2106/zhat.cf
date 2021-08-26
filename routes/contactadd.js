const express = require("express");
const app = express.Router();
let data = require("../mongo/data.js");
var validator = require('validator');
let contacts = require("../mongo/contacts.js");
let bots = require("../mongo/Bots.js");

app.get("/add", checkAuth, async (req, res) => {
  

  let add = req.query.add;
  
  if (add) {
    return res.render("add.ejs", {
      req,
      res,
      error:false,
      add: add,
      success: false
    })
  }
  
  if (req.query.success == "true") {
    return res.render("add.ejs", {
      req,
      res,
      error: false,
      success: true,
      add: false
    })
  }
  
  if (req.query.error == "true") {
    return res.render("add.ejs", {
      req,
      res,
      error: true,
      msg: req.query.message,
      success: false,
      add: false
    })  
  }  
  
  return res.render("add.ejs", {
    error: false,
    success: false,
    req,
    res,
    add: false
  })
  
});

app.post("/add", checkAuth, async (req, res) => {

  let uemail = req.body.userid;
  
  console.log(uemail);
  let checkUser = await data.findOne({UID: uemail});
  if (!checkUser) return res.status(200).send({r: "/contact/add?error=true&message=User not found"})
  
  if (checkUser.UID == req.session.user.UID) {
    return res.status(200).send({r: "/contact/add?error=true&message=You cant add yourself"})
  }
  
  let ourContacts = await GetContact(req.session.user.UID)
  if (!ourContacts) {
    let newContact = new contacts({
      UID: req.session.user.UID,
      List: [{id: checkUser.UID, num: 1}]
    });
    
    newContact.save();
  } else {
    let checkAlr = ourContacts.List.find(x => x.id == checkUser.UID);
    if (checkAlr) return res.status(200).send({r: `/me/${checkUser.UID}`})
    
   ourContacts.List.push({id: checkUser.UID, num: 1});
   ourContacts.save();
  }
  
  let heContacts = await GetContact(checkUser.UID);
  if (!heContacts) {
    let newContact = new contacts({
      UID: checkUser.UID,
      List: [{id: req.session.user.UID, num: 1}]
    });
    
    newContact.save();
  } else {
    let checkAlr = heContacts.List.find(x => x .id== req.session.user.UID);
    if (checkAlr) return res.status(200).send({r: `/me/${checkUser.UID}`}) 
    
   heContacts.List.push({id: req.session.user.UID, num: 1});
   heContacts.save();
  }  
  
  return res.status(200).send({r: `/me/${checkUser.UID}`})
});

module.exports = app;

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

function checkAuth(req, res, next) {
  if (req.session.user) return next();
  
  return res.redirect("/login")
}