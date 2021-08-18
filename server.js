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
let messages = require("./mongo/message.js");
var validator = require('validator');
let admins = require("./admins.json")

require("dotenv").config()

mongoose.connect(process.env.mongo, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, () => {
  console.log("[database] connected")
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
  secret: 'super cat',
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.mongo,
    autoRemove: 'disabled',
    touchAfter: 30000
  }),
  cookie: {expires: new Date(253402300000000)}  
}));

app.use(express.static(__dirname + "/public"));

app.get('/', checkAuth, async (req, res) => {
  
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
  
});

// login
const loginRoutes = require("./routes/login.js");
app.use("/login", loginRoutes)

// sign up
const signupRoutes = require("./routes/signup.js")
app.use("/signup", signupRoutes)

// settings
const settingsRoutes = require("./routes/settings.js")
app.use("/settings", settingsRoutes)

// contact
const contactaddRoutes = require("./routes/contactadd.js")
app.use("/contact", contactaddRoutes)

// chat
const chatRoutes = require("./routes/chat.js")
app.use("/chat", chatRoutes)

// invite
const inviteRoutes = require("./routes/invite.js")
app.use("/invite", inviteRoutes)

// no routes required
app.get("/faq", async (req, res) => {
  res.render("faq.ejs", {
    req,
    res
  })
});

app.get("/updates", async (req, res) => {
  res.render("updates.ejs", {
    req,
    res
  })
})

app.get("/logout", async (req, res) => {
  req.session.user = null;
  
  res.redirect("/login");
});

// api
app.patch("/api/post/message", async (req, res) => {
  
  let message = req.body;
  if (!message) return;
  
  let final;
  
  let alr = await messages.findOne({ID: `${message.to}${message.author.UID}`}) || await messages.findOne({ID: `${message.author.UID}${message.to}`}) ;
  if (!alr) {
    let newData = new messages({
      ID: `${message.to}${message.author.UID}`,
      List: []
    });
    
    newData.save();
    final = newData;
  } else {
    final = alr;
  }
  
  try {
    let done;
    let done2;
    let current = 2;
    let current2 = 2;
    let cached = [];
    let cached2 = [];
    
    let contactsList = await GetContact(message.author.UID);
    if (contactsList.List[0]) {
      done = contactsList.List.map(x => {
        if (x.id == message.to) {
          cached.push({id: x.id, num: 2})
          current++;
        } else {
          cached.push({id: x.id, num: current == 2 ? current + 1 : current})
          current++;
        }
      })
    }
    let contactsList2 = await GetContact(message.to);
    if (contactsList2.List[0]) {
      done2 = contactsList2.List.map(x => {
        if (x.id == req.session.user.UID) {
          cached2.push({id: x.id, num: 2})
          current2++;
        } else {
          cached2.push({id: x.id, num: current2 == 2 ? current2 + 1 : current2})
          current2++;          
        }
      })
    }
    
    Promise.all(done).then(() => {
      contactsList.List = cached;
      contactsList.save();
    })
    Promise.all(done2).then(() => {
      contactsList2.List = cached2;
      contactsList2.save();
    })
    final.List.push({author: message.author, content: message.content, time: message.time, to: message.to, type: message.type});
    final.save().catch(e => {})
  } catch (e) {
    return res.status(404).send({error: true, msg: e});
  } finally {
    return res.status(200).send({error: false});
  }
  
});

// status 404
app.use("/", async (req, res) => {
  res.status(404).render("404.ejs")
}); 

let users = {};
let ison = {};
let cds = {};

io.on('connection', (socket) => {
  
  socket.on("updateOnline", userid => {
    io.sockets.emit("someoneOnline", userid)
  })
  
  socket.on("isConnected", userid => {
    socket.userid = userid;
    io.sockets.emit("isOnline", userid);
    users[socket.id] = userid;
  })
  
  
  socket.on("message", message => {
    io.sockets.emit("message2", message)
  })
  
  socket.on("disconnect", reason => {
    io.sockets.emit("isOffline", users[socket.SID]);
  })
  
  socket.on("newMessages", opt => {
    console.log(opt)
    io.sockets.emit("newMessage", opt)
  })
  
});

http.listen(port, () => {
  console.log(`[system] running`);
});

function checkAuth(req, res, next) {
  if (req.session.user) return next();
  
  return res.redirect("/login")
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