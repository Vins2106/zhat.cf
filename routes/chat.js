const express = require("express");
const app = express.Router();
let data = require("../mongo/data.js");
let messages = require("../mongo/message.js");
let contacts = require("../mongo/contacts.js");
let validator = require("validator");

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
        num: c.num,
        bot: !acc.Bot ? false : true
      });
      cached++;
    });
  }
  
  if (cached) {
    return Promise.all(cached).then(() => {
      res.render("index.ejs", {
        req,
        res,
        contacts,
        data,
        getrandomuser
      })
    })
  } else {
      res.render("index.ejs", {
        req,
        res,
        contacts,
        data,
        getrandomuser
      })    
  }
    
}) 

async function randomUser(req) {
  return await getrandomuser(req);
}

async function getrandomuser(req) {
  let list = await data.find();
  let final = list.filter(x => !x.Bot && x.UID !== req.session.user.UID);
  
  let user = final[Math.floor(Math.random() * final.length)];
  
  return `https://zhat.cf/me/add?add=${user.UID}`
}

// contact
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

  let uemail = req.body.user;
  
  let checkUser = await data.findOne({UID: uemail});
  if (!checkUser) return res.redirect("/me/add?error=true&message=User not found");
  
  if (checkUser.UID == req.session.user.UID) {
    return res.redirect("/me/add?error=true&message=You cant add yourself");
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
    if (checkAlr) return res.redirect("/me/add?error=true&message=Already on contact")
    
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
    if (checkAlr) return res.redirect("/me/add?error=true&message=Already on contact")    
    
   heContacts.List.push({id: req.session.user.UID, num: 1});
   heContacts.save();
  }  
  
  res.redirect("/me/add?success=true")
});

// settings
app.get("/settings", checkAuth, async (req, res) => {
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

app.post("/settings", checkAuth, async (req, res) => {
  
  let username = req.body.username;
  let password = req.body.password;
  let avatar = req.body.avatar;
  let email = req.body.email;
  let wallpaper = req.body.wallpaper;
  
  if (!typeof validator.isStrongPassword(password) == 'true') {
    return res.redirect("/me/settings?error=true&message=Password not strong")
  }
  
  if (!avatar.startsWith("https://") && !avatar.startsWith("http://")) {
    return res.redirect("/me/settings?error=true&message=Invalid avatar url");
  } else if (!avatar.endsWith(".png") && !avatar.endsWith(".jpg") && !avatar.endsWith(".gif")) {
    return res.redirect("/me/settings?error=true&message=Avatar url must be .png, .jpg, or .gif");
  }
  
  if (wallpaper) {
  if (!wallpaper.startsWith("https://") && !wallpaper.startsWith("http://")) {
    return res.redirect("/me/settings?error=true&message=Invalid wallpaper url");
  } else if (!wallpaper.endsWith(".png") && !wallpaper.endsWith(".jpg") && !wallpaper.endsWith(".gif")) {
    return res.redirect("/me/settings?error=true&message=Wallpaper url must be .png, .jpg, or .gif");
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
    data,
    getrandomuser: async function(req) {
      return getrandomuser(req)
    }
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