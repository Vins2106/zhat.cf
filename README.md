                let args = message.content.slice(prefix.length).trim().split(/ +/g);
                let cmd = args.shift().toLowerCase();
                
                let command = cmds.find(x => x.name == cmd);
                if (command) {
                  setTimeout(() => {
                    let response = command.response.replace(/{{args}}/g, args.join(" "));
                  postMsg({author: <%- JSON.stringify({Username: he.Username, UID: he.UID, Avatar: he.Avatar, Bot: he.Bot}) %>, content: response, to: '<%= req.session.user.UID %>', bot: false})
                  createMessage(<%- JSON.stringify({Username: he.Username, UID: he.UID, Avatar: he.Avatar, Bot: he.Bot}) %>, response, false, "he")
                  scrollTo(0, chats.scrollHeight)            
                  }, 500)
                } else {
                  return;
                }