const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// In-memory user storage
const users = [];

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static("views"));

// Registration Page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views/register.html"));
});

// Register User
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const existingUser = users.find(
    (user) => user.username === username
  );

  if (existingUser) {
    return res.send("User already exists!");
  }

  users.push({ username, password });

  res.redirect("/login");
});

// Login Page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views/login.html"));
});

// Login User
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.send("Invalid username or password");
  }

  req.session.user = username;

  res.redirect("/dashboard");
});

// Middleware to protect routes
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }

  res.redirect("/login");
}

// Protected Page
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.send(`
      <h1>Welcome, ${req.session.user}</h1>
      <p>This is a secured page.</p>
      <a href="/logout">Logout</a>
  `);
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});