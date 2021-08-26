module.exports = () => {
const express = require("express");
const app = express.Router();
const WebSocket = require("ws")
const http = require('http').Server(app);
const wss = new WebSocket.Server({server: http})
  
app.get("/botws", async (req, res) => {
  res.render("botws.ejs")
})

wss.on('connection', function connection(ws) {
  console.log('A new client Connected!');
  ws.send('Welcome New Client!');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
    
  });
});  
  
  return app;
}