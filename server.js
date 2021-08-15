const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));


app.get('/', checkAuth, (req, res) => {
  res.render("index.ejs")
});

app.get('/login', async (req, res) => {
  res.render("login.ejs")
})

app.use("/", async (req, res) => {
  res.status(404).render("404.ejs")
})

io.on('connection', (socket) => {
});

function checkAuth(req, res, next) {
  if (req.session) return next();
  
  return res.redirect("/login")
}

http.listen(port, () => {
  console.log(`[system] running`);
});