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


class Client extends EventEmitter {
  constructor() {
    super();
    
    let addr = this.addr;
    
    ngrok.connect(3030)
    
// (async function() {
//   const url = await ngrok.connect(3030)
//   addr = url;
// })();
  }
  
  evt(event, opt = {}) {
    if (!this.bot) throw TypeError("No bot");

    if (event === "ready") {
      this.emit("ready")
    }
  }

  login(token) {
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
          this.evt("ready");
        });
      });
  }
}


module.exports = {
  Client
};