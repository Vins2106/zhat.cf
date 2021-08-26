module.exports = () => {
//   const express = require("express");
//   const app = express();
//   const bodyParser = require("body-parser");
//   let EventEmitter = require("events")
  
// const cors = require('cors');
// app.use(cors());  
  
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())  

//   class newBot extends EventEmitter {
//     constructor() {
//       super()
      
//     }
    
//     evtMessage(message) {
//       this.emit("message", message)
//     }
//   }  
  
//   let Bot = new newBot();
  
//   Bot.on("message", msg => {
//     if (msg.content == "hello") {
//       console.log('hello!')
//     }
//   })
  
//   app.post("/newmessage", async (req, res) => {
//     Bot.evtMessage(req.body)
//   })

  
//   app.listen(3030)
  
//   const ngrok = require('ngrok');
// (async function() {
//   const url = await ngrok.connect(3030)
//   console.log(url)
// })();
}