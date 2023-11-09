import express from "express";
import { engine } from "express-handlebars";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import cookieParser from "cookie-parser";

const dbPromise = open({
  filename: "./data.db",
  driver: sqlite3.Database,
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use("/public", express.static("./public"));

app.use(async (req, res, next) => {
  console.log('cookies', req.cookies);
  if (!req.cookies.authToken) {
    return next();
  }
  const db = await dbPromise;
  const authToken = await db.get("SELECT * FROM AuthTokens WHERE token=?;", req.cookies.authToken);
  if (!authToken) {
    return next();
  }
  const user = await db.get("SELECT id FROM Users WHERE id=?", authToken.userId);
  if (!user) {
    return next();
  }
  req.user = user.id
  next();
});

app.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const messages = await db.all("SELECT * FROM Messages;");
    const user = req.user;
    res.render("home", { messages, user });
  } catch (e) {
    console.log(e);
    res.render("home", { error: "Something went wrong"});
  }
});

app.get("/register", (req, res) => {
  if (req.user) {
    res.redirect("/");
    return;
  }
  res.render("register");
});

app.post("/message", async (req, res) => {
  const db = await dbPromise;
  await db.run("INSERT INTO Messages (message) VALUES (?);", req.body.message);
  res.redirect("/");
});

app.post("/register", async (req, res) => {
  if (
    !req.body.username ||
    !req.body.password ||
    req.body.username.length === 0 ||
    req.body.password.length === 0
  ) {
    return res.render("register", { error: "invalid parameters" });
  }
  const db = await dbPromise;
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  let result;
  try {
    result = await db.run(
      "INSERT INTO Users (username, passwordHash) VALUES (?, ?)",
      req.body.username,
      passwordHash
    );
  } catch (e) {
    return res.render("register", {
      error:
        e.code === "SQLITE_CONSTRAINT"
          ? "Username taken"
          : "Something went wrong"
    });
  }
  const token = v4();
  await db.run('INSERT INTO AuthTokens (token, userId) VALUES (?, ?);', token, result.lastID);
  res.cookie('authToken', token);
  res.redirect("/");
});

async function setup() {
  const db = await dbPromise;
  await db.migrate({ force: false });
  app.listen(8080, () => {
    console.log("listening on http://localhost:8080");
  });
}

setup();
