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
    autoRemove: 'disabled'
  })
}));

app.use(express.static(__dirname + "/public"));


app.get('/', checkAuth, (req, res) => {
  res.render("index.ejs")
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
  
});

app.use("/", async (req, res) => {
  res.status(404).render("404.ejs")
});

io.on('connection', (socket) => {
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