const express = require("express");
const app = express.Router();
let data = require("../mongo/data.js");
let messages = require("../mongo/message.js");
let contacts = require("../mongo/contacts.js");

app.get("/", checkAuth, async (req, res) => {
  
  let Contacts = await GetContact(req.session.user.UID)
  let contacts = [];
  let cached;
  
  if (Contacts.List[0]) {
    cached = Contacts.List.reverse().map(async c => {
      let acc = await data.findOne({UID: c.id});
      if (!acc) return;
      
  let final;
  
  let alr = await messages.findOne({ID: `${req.session.user.UID}${acc.UID}`}) || await messages.findOne({ID: `${acc.UID}${req.session.user.UID}`})
  if (!alr) {
    let newData = new messages({
      ID: `${acc.UID}${req.session.user.UID}`,
      List: []
    });
    
    newData.save();
    final = newData;
  } else {
    final = alr;
  }        
      
      contacts.push({
        username: acc.Username,
        avatar: acc.Avatar,
        uid: acc.UID,
        messages: final,
        num: c.num
      });
      cached++;
    });
  }
  
  if (cached) {
    return Promise.all(cached).then(() => {
      res.render("index.ejs", {
        req,
        res,
        contacts
      })
    })
  } else {
      res.render("index.ejs", {
        req,
        res,
        contacts
      })    
  }
    
})

app.get("/:uid", checkAuth, async (req, res) => {
  
  let findTarget = await data.findOne({UID: req.params.uid});
  if (!findTarget) return res.redirect("/");
  
  let final;
  
  let contact = await GetContact(req.session.user.UID);
  let findContact = contact.List.find(x => x.id == findTarget.UID);
  if (!findContact) return res.redirect("/")
  
  let alr = await messages.findOne({ID: `${req.session.user.UID}${findTarget.UID}`}) || await messages.findOne({ID: `${findTarget.UID}${req.session.user.UID}`})
  if (!alr) {
    let newData = new messages({
      ID: `${findTarget.UID}${req.session.user.UID}`,
      List: []
    });
    
    newData.save();
    final = newData;
  } else {
    final = alr;
  }  
  
  res.render("chat.ejs", {
    req,
    res,
    he: findTarget,
    messages: final,
    data
  })
  
});

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