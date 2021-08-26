module.exports = () => {
  const Zhat = require("./lib.js");
  const client = new Zhat.Client();
  
  console.log(client)
  client.on("ready", () => {
  });
  
  client.login(process.env.ZHAT)
  
};