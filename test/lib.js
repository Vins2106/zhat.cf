const options = {
  gate: "api/bot",
  v: "v1"
};
const ngrok = require("ngrok");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fetch = require("node-fetch")
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.listen(3030)

const cors = require("cors");
app.use(cors());
const EventEmitter = require('events');

class BaseClient extends EventEmitter {
  constructor(options = {}) {
    super();
  }
}

class Client extends BaseClient {
  constructor(options = {}) {
    super(options);
    
    this.token = process.env.ZHAT;
    this.user = {}
    
    ngrok.connect(3030).then(url => {
      this.addr = url;
    })   
    
    
    Object.defineProperty(this, 'client', { value: this });
    app.post("/receive", async (req, res) => {
      if (!req.body) return;
      
      req.body.author.send = function (ctn) {
        fetch(`https://zhat.cf/api/send/message`, {
          method: "PATCH",
          headers: {
            'Content-Type': "application/json"
          },
          body: JSON.stringify({
            
          })
        })
      };
      
      this.client.emit("message", req.body);
    })
  }
  
  async login(token = this.token) {
    fetch(`https://zhat.cf/${options.gate}/${options.v}/findbot`, {
      method: "POST",
      headers: {
            'Content-Type': 'application/json',
            },
      body: JSON.stringify({ token })
    }).then(res => res.json()).then(data => {
    fetch(`https://zhat.cf/${options.gate}/${options.v}/connect`, {
      method: "POST",
      headers: {
            'Content-Type': 'application/json',
            },
          body: JSON.stringify({
            uid: data.uid,
            addr: this.client.addr
          })
        }).then(res => res.json()).then(data2 => {
        this.client.user = data2;
        this.client.emit("ready", data2)
    })      
    })
  }
}

// class Client extends EventEmitter {
//   constructor() {
//     super();
    
//     ngrok.connect(3030).then(url => {
//       this.addr = url;
//     })
    
//     this.emit("ready")
    
// // (async function() {
// //   const url = await ngrok.connect(3030)
// //   addr = url;
// // })();
//   }

//   login(token) {
//     let clientEvt = this;
    
//     fetch(`https://zhat.cf${options.gate}/${options.v}/findbot`, {
//       method: "POST",
//       body: JSON.stringify({ token })
//     })
//       .then(res => res.json())
//       .then(async data => {
      
//         fetch(`https://zhat.cf${options.gate}/${options.v}/connect`, {
//           method: "POST",
//           body: JSON.stringify({
//             uid: data.uid,
//             addr: this.addr
//           })
//         })
//           .then(res => res.json())
//           .then(async final => {
          
//           clientEvt.emit("ready");
//         });
//       });
//   }
// }


module.exports = {
  Client
};