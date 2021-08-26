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
    
    this.startGateway()
    
    (async function() {
      this.gateway = await ngrok.connect(3030);
    })();
  }

  evt(event, opt = {}) {
    if (!this.bot) throw TypeError("No bot");

    this.emit(event, opt);
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
            addr: this.gateway
          })
        })
          .then(res => res.json())
          .then(async final => {
          this.evt("ready");
        });
      });
  }
}

class ClientGateway extends EventEmitter {
  constructor() {
    super();
  }
}


module.exports = Client;