const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
  res.render("index.ejs")
});

app.get('/login', async (req, res) => {
  res.render("login.ejs")
})

io.on('connection', (socket) => {
});

http.listen(port, () => {
  console.log(`[system] running`);
});