const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.render("index.ejs")
});

io.on('connection', (socket) => {
});

http.listen(port, () => {
  console.log(`[system] running`);
});