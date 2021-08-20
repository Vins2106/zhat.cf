      let subtn = document.getElementById("submit-btn")
      let postDataMsgThumb = {author: <%- JSON.stringify(req.session.user) %>, content: '👍', to: '<%= he.UID %>', bot: false}
        subtn.onclick = function() {
          if (subtn.type !== "button") return;
          
        socket.emit('message', postDataMsgThumb);
        socket.emit('newMessages', {id: '<%= req.session.user.UID %>', username: '<%= req.session.user.Username %>', to: '<%= he.UID %>', msg: "👍"})
                                     
        
        subtn.disabled = true
        subtn.classList.add("disabled");
        
          // 4
        setTimeout(() => {
          subtn.disabled = false
        subtn.classList.remove("disabled");
        }, 2000)          
        }
      input.addEventListener("keyup", () => {
      if (!isEmptyOrSpaces(input.value)) {
        subtn.innerHTML = "Send!"
        subtn.type = "submit"
        subtn.disabled = false;
      } else if (isEmptyOrSpaces(input.value)) {
        subtn.type = "button"
        subtn.innerHTML = "👍"
        console.log("thumb emoji launch")

        // 2
                   }
      })

        // 1
        // 3
      
function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
}   