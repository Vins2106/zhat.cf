const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo');
let data = require("./mongo/data.js");
let contacts = require("./mongo/contacts.js");
var validator = require('validator');

require("dotenv").config()

mongoose.connect(process.env.mongo, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
  secret: 'super cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.mongo,
    autoRemove: 'disabled',
    touchAfter: 30000
  })
}));

app.use(express.static(__dirname + "/public"));


app.get('/', checkAuth, async (req, res) => {
  
  let Contacts = await GetContact(req.session.user.UID)
  let contacts = [];
  
  console.log(Contacts)
  
  if (Contacts.List[0]) {
    Contacts.List.reverse().map(async c => {
      let acc = await data.findOne({UID: c});
      if (!acc) return;
      
      contacts.push({
        username: acc.Username,
        avatar: acc.Avatar,
        uid: acc.UID
      });
    });
  }
  
  setTimeout(() => {
  res.render("index.ejs", {
    req,
    res,
    contacts
  })    
  }, 500)
});

app.get('/login', async (req, res) => {
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

app.post('/login', async (req, res) => {
  
  let checkFirstEmail = await data.findOne({Email: req.body.email});
  if (!checkFirstEmail) return res.redirect("/login?error=true&message=Invalid email");
  
  let checkFirstEmailPassword = await data.findOne({Email: req.body.email, Password: req.body.password});
  if (!checkFirstEmailPassword) return res.redirect("/login?error=true&message=Invalid email & password");
  
  req.session.user = checkFirstEmailPassword;
  res.redirect("/")
});

app.get("/signup", async (req, res) => {
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

app.post("/signup", async (req, res) => {
  
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
    Avatar: "https://i.stack.imgur.com/l60Hf.png"
  }
  
  let newData = new data(dataStruct);
  newData.save();
  
  req.session.user = dataStruct;
  
  res.redirect("/");
  
});

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
  
  if (!typeof validator.isStrongPassword(password) == 'true') {
    return res.redirect("/settings?error=true&message=Password not strong")
  }
  
  if (!avatar.startsWith("https://") && !avatar.startsWith("http://")) {
    return res.redirect("/settings?error=true&message=Invalid avatar url");
  } else if (!avatar.endsWith(".png") && !avatar.endsWith(".jpg") && !avatar.endsWith(".gif")) {
    return res.redirect("/settings?error=true&message=Avatar url must be .png or .jpg");
  }
  
  let findAcc = await data.findOne({Email: req.body.email});
  findAcc.Username = username;
  findAcc.Password = password;
  findAcc.Avatar = avatar;
  findAcc.save();
  
  req.session.user = findAcc;
  
  return res.redirect("/")
  
});

app.get("/contact/add", checkAuth, async (req, res) => {
  
  if (req.query.success == "true") {
    return res.render("add.ejs", {
      req,
      res,
      error: false,
      success: true
    })
  }
  
  if (req.query.error == "true") {
    return res.render("add.ejs", {
      req,
      res,
      error: true,
      msg: req.query.message,
      success: false
    })  
  }  
  
  return res.render("add.ejs", {
    error: false,
    success: false,
    req,
    res
  })
  
});

app.post("/contact/add", checkAuth, async (req, res) => {
  
  let uemail = req.body.user;
  
  let checkUser = await data.findOne({Email: uemail});
  if (!checkUser) return res.redirect("/contact/add?error=true&message=User not found");
  
  let ourContacts = await GetContact(req.session.user.UID)
  if (!ourContacts) {
    let newContact = new contacts({
      UID: req.session.user.UID,
      List: [checkUser.UID]
    });
    
    newContact.save();
  } else {
    let checkAlr = ourContacts.List.find(x => x == checkUser.UID);
    if (checkAlr) return res.redirect("/contact/add?error=true&message=Already on contact")
    
   ourContacts.List.push(checkUser.UID);
   ourContacts.save();
  }
  
  let heContacts = await GetContact(checkUser.UID);
  if (!heContacts) {
    let newContact = new contacts({
      UID: checkUser.UID,
      List: [req.session.user.UID]
    });
    
    newContact.save();
  } else {
    let checkAlr = heContacts.List.find(x => x == req.session.user.UID);
    if (checkAlr) return res.redirect("/contact/add?error=true&message=Already on contact")    
    
   heContacts.List.push(req.session.user.UID);
   heContacts.save();
  }  
  
  res.redirect("/contact/add?success=true")
});

app.get("/chat/:uid", checkAuth, async (req, res) => {
  
  let findTarget = await data.findOne({UID: req.params.uid});
  if (!findTarget) return res.redirect("/");
  
  res.render("chat.ejs", {
    req,
    res,
    he: findTarget
  })
  
});

app.get("/logout", async (req, res) => {
  req.session.user = null;
  
  res.redirect("/login");
});

app.use("/", async (req, res) => {
  res.status(404).render("404.ejs")
});

io.on('connection', (socket) => {
  
  socket.on("message", message => {
    io.emit("message2", message)
  })
  
});

function checkAuth(req, res, next) {
  if (req.session.user) return next();
  
  return res.redirect("/login")
}

http.listen(port, () => {
  console.log(`[system] running`);
});

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