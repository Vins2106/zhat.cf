module.exports = () => {
  const Zhat = require("./lib.js");
  const client = new Zhat();
  
  client.on("ready", () => {
    console.log(`Login!`)
  });
  
  client.login(process.env.ZHAT)
  
};