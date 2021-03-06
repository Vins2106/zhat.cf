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
const botDatas = require("quick.db")
const fetch = require("node-fetch")

app.post("/create", async (req, res) => {
  if (!req.body) return notFound(res, "Failed, no data we receive");
  if (!req.body.username) return notFound(res, "Failed, username not provided");
  
  let username = req.body.username;
  let owner = req.body.owner;
  let avatar = req.body.avatar ? req.body.avatar : null;
  let token = makeid(20);
  let uid = makeid(18);
  
  let checkUsername = await bots.findOne({Username: username});
  if (checkUsername) return forBidden(res, "Username already used")
  
  let botStruct = {
    OWNER: owner,
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

app.post("/delete", async (req, res) => {
  if (!req.body) return notFound(res, "Failed, no data we receive");
  if (!req.body.token) return notFound(res, "Failed, token not provided");
  if (!req.body.uid) return notFound(res, "Failed, token not provided");
  
  let findUser = await data.findOne({UID: req.body.uid});
  if (!findUser) return notFound(res, "User not found")
  let findBot = await bots.findOne({TOKEN: req.body.token, OWNER: req.body.uid});
  if (!findBot) return notFound(res, "Bot not found");  
  
  findUser.bots = findUser.bots - 1;
  findUser.save()
  findBot.remove();
  
  return Json(res, {msg: "success"})
});

app.post("/regenerate", async (req, res) => {
  
  if (!req.body) return notFound(res, "Failed, no data we receive");
  if (!req.body.token) return notFound(res, "Failed, token not provided");
  if (!req.body.owner) return notFound(res, "Failed, token not provided");
  
  let findBot = await bots.findOne({TOKEN: req.body.token, OWNER: req.body.owner});
  if (!findBot) return notFound(res, "Bot not found");
  
  findBot.TOKEN = makeid(20);
  findBot.save();
  
  return Json(res, findBot);
});

app.patch("/login", async (req, res) => {
  let findBot = await bots.findOne({TOKEN: req.params.token});
  if (!findBot) return notFound(res, "Invalid token");
  
  return Json(res, {msg: "Success"})
});

app.post("/findbot", async (req, res) => {
  if (!req.body.token) return notFound(res, "Invalid token")
  
  let findBot = await bots.findOne({TOKEN: req.body.token})
  if (!findBot) return notFound(res, "Invalid token")
  
  return Json(res, {uid: findBot.UID})
})

app.post("/connect", async (req, res) => {
  if (!req.body) return notFound(res, "Invalid bot")
  if (!req.body.uid) return notFound(res, "Invalid uid")
  if (!req.body.addr) return notFound(res, "Invalid addres")
  
  let findBot = await bots.findOne({
    UID: req.body.uid
  });
  
  if (!findBot) return notFound(res, "Bot not found");
  
  botDatas.set(req.body.uid, req.body.addr)
  return Json(res, findBot);
});

app.post("/receive", async (req, res) => {
  
  if (!req.body) return notFound(res, "Bot not found");
  
  let findBotData = botDatas.get(req.body.to)
  
  req.body.createAt = Date.now();
  
  fetch(findBotData + "/receive", {
    method: "POST",
           headers: {
             'Content-Type': 'application/json'
       },    
    body: JSON.stringify(req.body)
  }).then(res => res.json()).then(data => {
    if (!data) return Json(res, {error: {msg: "Bot is offline"}})
  }).catch(e => {
    return Json(res, {error: {msg: "Bot is offline"}})
  })  
  
});

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