module.exports = () => {
const io = require('socket.io')(`wss://zhat.cf/${process.env.ZHAT}`);

io.on("connection", async (socket) => {
  console.log(socket.id)
  
  socket.on("message", msg => {
    console.log(msg)
  })
})  
}