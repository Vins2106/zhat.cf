const express = require("express");
const app = express.Router();
let data = require("../mongo/data.js");
let messages = require("../mongo/message.js");
let contacts = require("../mongo/contacts.js");
let bots = require("../mongo/Bots.js");
let validator = require("validator");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post("/create", async (req, res) => {
  if (!req.body) return notFound(res, "Failed, no data we receive");
  if (!req.body.username) return notFound(res, "Failed, username not provided");
  
  let username = req.body.username;
  let avatar = req.body.avatar ? req.body.avatar : null;
  let token = makeid(20);
  let uid = makeid(18);
  
  let checkUsername = await bots.findOne({Username: username});
  if (checkUsername) return forBidden(res, "Username already used")
  
  return Json(res, {text: "test success"})
  
  let botStruct = {
    Username: username,
    Avatar: avatar,
    TOKEN: token,
    UID: uid,
    Bot: true
  }
  
  let newData = new bots(botStruct);
  
  newData.save();
  
  return Json(res, botStruct)
});

app.post("/login", async (req, res) => {
  if (!req.body) return notFound(res, "No token provided")
  let data = req.body;
  if (!data.token) return notFound(res, "No token provided")
  
  let findBot = await bots.findOne({TOKEN: data.token});
  if (!findBot) return notFound(res, "Invalid token")
  
  req.bot = findBot;
  
  return Json(res, findBot)
});

const EventEmitter = require('events');
class startBot extends EventEmitter {
  constructor(bot) {
    super();
    
    this
  }
}

module.exports = app;

function notFound(res, str) {
  return res.status(404).json({error: {msg: str}})
}

function forBidden(res, str) {
  return res.status(403).json(str)
}

function Json(res, str = {}) {
  return res.status(200).json(str)
}

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