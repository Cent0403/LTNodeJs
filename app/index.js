import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';
import session from 'express-session';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(session({
  secret: 'clave-secreta', // cambia esta clave para producción
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // activar HTTPS
}));

app.set("port", 4000);
app.use(express.static(__dirname + "/public"));
app.use(express.json());

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

app.get("/", (req, res) => res.sendFile(__dirname + "/pages/register.html"));
app.get("/Login", (req, res) => res.sendFile(__dirname + "/pages/login.html"));

app.get("/Inicio", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/Login");
  }
  res.sendFile(__dirname + "/pages/usuario/inicio.html");
});

app.post("/api/register", async (req, res) => {
  const { user, password, email, nombres, telefono } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'El correo electrónico no es válido.' });
  }

  try {
    const result = await pool.query(
      "INSERT INTO usuarios (usuario, nombre, email, telefono, contra) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user, nombres, email, telefono, password]
    );

    const newUser = result.rows[0];

    req.session.user = {
      usuario: newUser.usuario,
      nombre: newUser.nombre
    };

    res.json({
      success: true,
      redirectUrl: "/Inicio"
    });
  } catch (err) {
    console.error(err);

    if (err.code === '23505') {
      // PostgreSQL código 23505 = violación de restricción única
      const message = err.detail.includes("usuario")
        ? "El nombre de usuario ya existe."
        : err.detail.includes("email")
        ? "El correo electrónico ya está registrado."
        : err.detail.includes("telefono")
        ? "El número de teléfono ya está registrado."
        : "Datos duplicados.";

      return res.status(400).json({ success: false, message });
    }

    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});


app.post("/api/login", async (req, res) => {
  const { user, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE usuario = $1 AND contra = $2",
      [user, password]
    );

    if (result.rows.length > 0) {
      const usuario = result.rows[0];
      req.session.user = {
        usuario: usuario.usuario,
        nombre: usuario.nombre
      };

      res.json({ success: true, redirectUrl: "/Inicio" });
    } else {
      res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

app.get("/api/user", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

app.get("/api/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).send("Error al cerrar sesión");
    }
    res.clearCookie("connect.sid"); // Borra cookie de sesión
    res.redirect("/Login");
  });
});

app.listen(app.get("port"), () =>
  console.log("Servidor corriendo en puerto", app.get("port"))
);
