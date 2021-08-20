      
    var socket = io();
      
      console.log("connected")
      socket.emit("isConnected", '<%= req.session.user.UID %>')

      const audio = document.querySelector("audio");
      let locationHref =  window.location.href.split("me/")[1].slice(0, 18)
      var form = document.getElementById("form");
      var input = document.getElementById("input-msg");
      let chats = document.getElementById(`chat-list`);
      let emoji = document.querySelector('emoji-picker');
      let thumbBtn = document.getElementById("submit-btn");
      emoji.style.display = "none";
      audio.volume = 0.3;                                                    
      let emojiDisplay = false;
      
      <% if (messages.List[0]) { %>
      <% let msgLoaded = messages.List.map(msg => { %>      
      if ('<%= msg.author.UID %>' == '<%= req.session.user.UID %>') {  
      createMessage(<%- JSON.stringify(msg.author) %>, '<%= msg.content %>', '<%= msg.time %>', "me")
      } else {
      createMessage(<%- JSON.stringify(msg.author) %>, '<%= msg.content %>', '<%= msg.time %>', "me")
      }
      <% }) %>
      <% } %>
      
      
      
      
      function emojiToggle() {
        if (emojiDisplay) {
          emoji.style.display = "none"
          emojiDisplay = false;
        } else {
          emoji.style.display = "block"
          emojiDisplay = true;
        }
      }
      
      emoji.addEventListener('emoji-click', event => {
        emojiToggle()
        input.value += event.detail.unicode;
      }); 
      
      form.addEventListener('submit', function(e) {
        if (input.value == "") {                             
        e.preventDefault();
        form.reset()
        return;
        }
                                       
        let postDataMSG;
        
        if ('<%= he.UID %>' == "OLVGGLFUCKxRac8FOg") {
          postDataMSG = {author: <%- JSON.stringify(req.session.user) %>, content: input.value, to: '<%= he.UID %>', bot: true};
        } else {
          postDataMSG = {author: <%- JSON.stringify(req.session.user) %>, content: input.value, to: '<%= he.UID %>', bot: false};
        }
        socket.emit('message', postDataMSG);
        socket.emit('newMessages', {id: '<%= req.session.user.UID %>', username: '<%= req.session.user.Username %>', to: '<%= he.UID %>', msg: input.value})
        e.preventDefault();
        form.reset()                             
        input.setAttribute("disabled", "disabled");
        input.setAttribute("placeholder", "cooldown");
        thumbBtn.type = "button"
        thumbBtn.innerHTML = "👍"
        setTimeout(() => {
        input.disabled = false;
        input.setAttribute("placeholder", "max 100 characters");
        input.focus();
        }, 2000)
      });
      
function scrollToBottom() {
  scrollTo(0, chats.scrollHeight)
}    
      
        let prefix = "#";
        
        let cmds = [
          {
            name: "faq",
            response: "https://zhat.cf/faq"
          },
          {
            name: "how-to-add-user",
            response: "https://zhat.cf/faq#how-to-add-contact"
          },
          {
            name: "my-id",
            response: "<%= req.session.user.UID %>"
          },
          {
            name: "help",
            response: "#help, #faq, #how-to-add-user, #my-id, #updates, #say [message]"
          },
          {
            name: "updates",
            response: "https://zhat.cf/updates"
          },
          {
            name: "say",
            response: "{{args}}"
          }
        ]
        
      socket.on("message2", message => {

        if (!message.bot) {
        if (message.author.UID == '<%= req.session.user.UID %>') {
          postMsg(message);
          createMessage(message.author, message.content, false, "me")
          scrollTo(0, chats.scrollHeight)
        }
        
        if (message.to == '<%= req.session.user.UID %>' && message.author.UID == locationHref) {
          audio.play()
          createMessage(message.author, message.content, false, "he")
          scrollTo(0, chats.scrollHeight)
        }          
                
        } else if (message.bot) {
        
        if (message.author.UID == '<%= req.session.user.UID %>') {
          postMsg(message);
          createMessage(message.author, message.content, false, "me")
          scrollTo(0, chats.scrollHeight)
        
        let args = message.content.slice(prefix.length).trim().split(/ +/g);
        let cmd = args.shift().toLowerCase();
        
        let command = cmds.find(x => x.name == cmd);
        if (command) {
          setTimeout(() => {
            let response = command.response.replace(/{{args}}/g, args.join(" "));
          postMsg({author: <%- JSON.stringify(he) %>, content: response, to: '<%= req.session.user.UID %>', bot: false})
          createMessage(<%- JSON.stringify(he) %>, response, false, "he")
          scrollTo(0, chats.scrollHeight)            
          }, 500)
        } else {
          return;
        }
        
        
        }
        
        if (message.to == '<%= req.session.user.UID %>' && message.author.UID == 'OLVGGLFUCKxRac8FOg') {
          audio.play()
          createMessage(message.author, message.content, false, "he")
          scrollTo(0, chats.scrollHeight)
        }           
                            
        }
                
        
        
      })
      
      async function postMsg(message) {
        
        console.log('[MESSAGE_CREATE]')
        
        let POSTDATA = {author: message.author, content: message.content, time: moment().format('h:mm a'), to: message.to, type: "data"}
            
        fetch('https://zhat.cf/api/post/message', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
          body: JSON.stringify(POSTDATA),
        }).then(res => res.json()).then(data => {
          if (data.error) {
            return console.log(`cant post message: `, data.msg)
          } else {
            return;
          }
        })                
      }
      
      async function createMessage(user, content, time = false, mehe) {
        let base = document.createElement("div");
        base.setAttribute("class", `${mehe}-chat`);
        chats.appendChild(base);
        
        let image = document.createElement("img");
        image.setAttribute("src", user.Avatar);
        image.setAttribute("class", `${mehe}-avatar`);
        base.appendChild(image);
        
        let namemsg = document.createElement("div");
        namemsg.setAttribute("class", `${mehe}-info`);
        base.appendChild(namemsg);
        
        let name = document.createElement("span");
        name.setAttribute("class", `${mehe}-name`)
                                 

        
        let message = document.createElement("p");
        message.setAttribute("class", `${mehe}-msg`);
        let msgContent = ""
        let msgContentProto = content.split(/ +/g);
        msgContentProto.map(x => {
          if (x.startsWith("https://") || x.startsWith("http://")) {
            msgContent += ` <a style="color: black;" href="${x}" target="_blank">${x}</a>`
          } else {
            msgContent += ` ${x}`;
          }
        });
        message.innerHTML = msgContent;
        namemsg.appendChild(message);
        
        return true;
      }
      