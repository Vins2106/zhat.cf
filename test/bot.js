module.exports = () => {
  const Zhat = require("./lib.js");
  const client = new Zhat.Client();
  
  client.on("ready", () => {
    console.log("Ready!")
  });
  
  console.log(client)
  
  client.login(process.env.ZHAT);
  
  
};