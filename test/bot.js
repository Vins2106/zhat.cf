module.exports = () => {
  const Zhat = require("./lib.js");
  const client = new Zhat.Client();
  
  client.on("ready", () => {
    console.log("Ready!")
  });
  client.login(process.env.ZHAT);
  
  console.log(client)
  
  
  
  
};