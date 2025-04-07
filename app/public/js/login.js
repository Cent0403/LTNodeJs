const form = document.getElementById("login-form");
const errorMsg = document.querySelector(".error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    user: form.user.value,
    password: form.password.value,
  };

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.success) {
      window.location.href = result.redirectUrl;
    } else {
      errorMsg.textContent = result.message || "Error al iniciar sesión.";
      errorMsg.classList.remove("escondido");
    }
  } catch (err) {
    console.error("Error:", err);
    errorMsg.textContent = "Error del servidor.";
    errorMsg.classList.remove("escondido");
  }
});
