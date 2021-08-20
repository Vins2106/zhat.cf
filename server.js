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

app.get('/', async (req, res) => {
  res.render("home.ejs", {
    req,
    res
  })
});

// beta
const betaRoutes = require("./routes/beta.js");
app.use("/beta", betaRoutes);

// login
const loginRoutes = require("./routes/login.js");
app.use("/login", loginRoutes)

// sign up
const signupRoutes = require("./routes/signup.js")
app.use("/signup", signupRoutes)

// me
const chatRoutes = require("./routes/chat.js")
app.use("/me", chatRoutes)

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
  
    let done;
    let done2;
    let current = 2;
    let current2 = 2;
    let cached = [];
    let cached2 = [];
    let contactsList, contactsList2;
  try {
    
    contactsList = await GetContact(message.author.UID);
    if (contactsList.List[0]) {
      done = contactsList.List.map(x => {
        if (x.id == message.to) {
          if (x.num == 2) {
          cached.push({id: x.id, num: 3})
            current++;            
          } else {
          cached.push({id: x.id, num: 2})
          if (current == 2) {
            current++;
          }              
          }
        } else {
          cached.push({id: x.id, num: current})
          current++;
        }
      })
    }

    
    console.log(message)
    contactsList2 = await GetContact(message.to)
    
    if (contactsList2.List[0]) {
      done2 = contactsList2.List.map(x => {
        if (x.id == req.session.user.UID) {
          if (x.num == 2) {
          cached2.push({id: x.id, num: 3})
            current2++;     
          } else {
          cached2.push({id: x.id, num: 2})
          if (current2 == 2) {
            current2++; 
          }              
          }
        } else {
          cached2.push({id: x.id, num: current2})
          current2++;
        }
      })
    }          
    
    final.List.push({author: message.author, content: message.content, time: message.time, to: message.to, type: message.type});
    final.save().catch(e => {})
  } catch (e) {
    return res.status(404).send({error: true, msg: e});
  } finally {
    Promise.all(done).then(() => {
      contactsList.List = cached;
      contactsList.save();
    Promise.all(done2).then(() => {
      console.log(`[MESSAGE_CREATE_EVENT] author: ${message.author.Username} to: ${message.to} content: ${message.content} time: ${message.time}`)
      contactsList2.List = cached2;
      contactsList2.save();
      res.status(200).send({error: false});
    }) 
    })
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
    io.sockets.emit("isOnline", userid);
    users[socket.id] = userid;
    clearTimeout(cds[userid])
    delete cds[userid]
  })
  
  
  socket.on("message", message => {
    io.sockets.emit("message2", message)
  })
  
  socket.on("disconnect", reason => {
    cds[users[socket.id]] = setTimeout(() => {
      io.sockets.emit("isOffline", users[socket.id]);
      delete users[socket.id];
      delete cds[users[socket.id]]
    }, 1 * 1000);
  })
  
  socket.on("newMessages", opt => {
    io.sockets.emit("newMessage", opt)
  })
  
  socket.on("message_create", opt => {
    
  });
  
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
  if (!UID) return;
  
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

async function addAllBot() {
  let all = await contacts.find();
  
  all.map(x => {
    if (x.id == "OLVGGLFUCKxRac8FOg") return;
    
    let check = x.List.find(x => x.id == "OLVGGLFUCKxRac8FOg");
    if (check) return;
    
    x.List.push({id: 'OLVGGLFUCKxRac8FOg', num: 1});
    x.save();
  })
 }