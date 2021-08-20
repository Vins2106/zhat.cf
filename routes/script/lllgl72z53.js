      socket.on("someoneOnline", userId => {
        let user = document.getElementById(userId);
        if (!user) return;
      
        
        user.classList.remove("offline")
        user.classList.add("online")
      })
      
      socket.on("newMessage", (opt) => {
        let user = document.getElementById(`${opt.id}-lastmsg`);
        if (opt.to !== '<%= req.session.user.UID %>') return;
        if (!user) return;
        
        audio.play();
        user.innerHTML = `${opt.id == '<%= req.session.user.UID %>' ? '(you):' : '(new messages):'} ${opt.msg}`;
      })
                  
      socket.on("isOnline", userId => {
        socket.emit("updateOnline", '<%= req.session.user.UID %>')
        let user = document.getElementById(userId);
        if (!user) return;
        console.log(`${userId} is online`)
        
        user.classList.remove("offline")
        user.classList.add("online")
      });
      
      socket.on("isOffline", userId => {
        let user = document.getElementById(userId);
        if (!user) return;
        console.log(`${userId} is offline`)
        
        user.classList.remove("online")
        user.classList.add("offline")      
      })