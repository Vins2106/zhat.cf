module.exports = () => {
  const Zhat = require("./lib.js");
  const client = new Zhat.Client();
  
  client.on("ready", (ready) => {
    console.log("Ready!", ready)
  });
  
  console.log(client)
  
  client.login(process.env.ZHAT);
  
  
  
  
  
};