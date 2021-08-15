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
  res.render("login.ejs")
});

app.post('/login', async (req, res) => {
  console.log(req.body);
  
  let checkFirstEmail = await data.findOne({Email: req.body.email});
  if (!checkFirstEmail) return res.redirect("/login?error=true&message=Invalid+email");
  
  let checkFirstEmailPassword = await data.findOne({Email: req.body.email, Password: req.body.password});
  if (!checkFirstEmailPassword) return res.redirect("/login?error=true&message=Invalid+emaile+&+password");
  
  res.redirect("/login")
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