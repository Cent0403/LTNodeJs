document.addEventListener("DOMContentLoaded", async function () {
    const textarea = document.getElementById("contPubli");
  
    if (textarea) {
      textarea.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
      });
    }
  
    try {
      const res = await fetch("/api/user");
      const result = await res.json();
  
      if (result.loggedIn) {
        const { usuario, nombre } = result.user;
        document.getElementById("userName").textContent = nombre;
        document.getElementById("userHandle").textContent = "@" + usuario;
      } else {
        window.location.href = "/Login";
      }
    } catch (err) {
      console.error("Error al obtener datos de sesión:", err);
      window.location.href = "/Login";
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logout-btn");
  
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          const res = await fetch("/api/logout");
          if (res.redirected) {
            window.location.href = res.url; // Te lleva al login
          }
        } catch (err) {
          console.error("Error al cerrar sesión:", err);
        }
      });
    }
  });
  