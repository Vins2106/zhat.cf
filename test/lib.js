const EventEmitter = require("events");
const options = {
  gate: "/api/bot",
  v: "v1"
};
const ngrok = require("ngrok");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fetch = require("node-fetch")

const cors = require("cors");
app.use(cors());


class ClientBeta extends EventEmitter {
  constructor() {
    super();
  }
}

class Client extends EventEmitter {
  constructor() {
    super();
    
    ngrok.connect(3030).then(url => {
      this.addr = url;
    })
    
    this.emit("ready")
    
// (async function() {
//   const url = await ngrok.connect(3030)
//   addr = url;
// })();
  }

  login(token) {
    let clientEvt = this;
    
    fetch(`https://zhat.cf${options.gate}/${options.v}/findbot`, {
      method: "POST",
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(async data => {
      
        fetch(`https://zhat.cf${options.gate}/${options.v}/connect`, {
          method: "POST",
          body: JSON.stringify({
            uid: data.uid,
            addr: this.addr
          })
        })
          .then(res => res.json())
          .then(async final => {
          
          clientEvt.emit("ready");
        });
      });
  }
}


module.exports = {
  Client
};