const form = document.getElementById("register-form");
const errorMsg = document.querySelector(".error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    user: form.user.value,
    password: form.password.value,
    email: form.email.value,
    nombres: form.nombres.value,
    telefono: form.telefono.value,
  };

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.success) {
      window.location.href = result.redirectUrl;
    } else {
      errorMsg.textContent = result.message || "Error al registrarse.";
      errorMsg.classList.remove("escondido");
    }
  } catch (err) {
    console.error("Error:", err);
    errorMsg.textContent = "Error del servidor.";
    errorMsg.classList.remove("escondido");
  }
});
