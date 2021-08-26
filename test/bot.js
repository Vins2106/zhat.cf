module.exports = () => {
  const Zhat = require("./lib.js");
  const client = new Zhat.Client();
  client.login(process.env.ZHAT);
  
  client.on("ready", () => {
    console.log(`Login as ${client.user.Username}`)
  });
  
  let prefix = "!";
  
  client.on("message", async message => {
    
    return console.log(message)
    
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();
    
    if (cmd == "help") {
      return message.send("Help your self");
    }
  });
  
  console.log(client)
  
  
  
  
  
  
};