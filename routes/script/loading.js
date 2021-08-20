      window.onload = function() {
        setTimeout(() => {
          document.getElementById('body').classList.remove("loading-body");
          document.getElementById('loading').classList.add("not-showing")
          scrollTo(0, chats.scrollHeight)
        }, 1000)
      }