    let modal = document.getElementById("user-modal");
      
      let display = false;
      
      function toggleModal() {
        if (display) {
          display = false;
          modal.classList.remove("on")
        } else {
          display = true;
          modal.classList.add("on")
        }
      }
      
      function copyId() {
        navigator.clipboard.writeText('<%= he.UID %>');
        alert("Copied")
      }

    let isNavbar = false;
      
      function toggleNavbar() {
        let navbar = document.getElementById("navbar");
        
        if (isNavbar) {
          navbar.classList.remove("on");
          isNavbar = false;
        } else if (!isNavbar) {
          navbar.classList.add("on");
          isNavbar = true;
        }
      }
