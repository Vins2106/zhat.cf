module.exports = async () => {
const Discord = require("discord.js");
const client = new Discord.Client({
  disabledMentions: "everyone"
});
  
  let status = {
    api: {
      percent: `100%`,
      status: "Good"
    },
    system: {
      percent: `100%`,
      status: "Good"
    },
    lastIncident: "None"
  }

client.on("ready", () => {
  console.log("[BOT] ready")
});

client.login(process.env.TOKEN);

let prefix = "#"

client.on("message", async message => {
  if (message.author.bot) return;
  let args = message.content.slice(prefix.length).trim().split(/ +/g)
  let cmd = args.shift().toLowerCase();
  
  if (cmd == "help") {
    return message.channel.send("#status");
  }
  
  if (cmd === "status") {
    return message.channel.send(`
**API** : \`${status.api.percent}\` ${status.api.status}
**System** : \`${status.system.percent}\` ${status.system.status}
_ _
**Last incident**
\`${status.lastIncident}\`
_ _
**Info**
30% < = **Very Bad**
31% - 64% = **Bad**
65% > = **Good**

ping: **${Date.now() - message.createdTimestamp}ms**
    `)
  }
});  
}