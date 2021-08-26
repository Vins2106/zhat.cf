module.exports = () => {
  const Zhat = require("./lib.js");
  const client = new Zhat.Client();
  client.login(process.env.ZHAT);
  
  client.on("ready", () => {
    console.log("Ready!")
  });
  
  console.log(client)
  
  
  
  
  
  
};