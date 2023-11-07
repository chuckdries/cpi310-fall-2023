import express from "express";
import { engine } from "express-handlebars";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const dbPromise = open({
  filename: "./data.db",
  driver: sqlite3.Database,
});

const app = express();

app.use(express.urlencoded({ extended: false }));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const messages = await db.all("SELECT * FROM Messages;");
    console.log("🚀 ~ file: index.js:22 ~ app.get ~ messages:", messages);
    res.render("home", { messages });
  } catch (e) {
    console.log(e);
  }
});

app.post("/message", async (req, res) => {
  const db = await dbPromise;
  await db.run("INSERT INTO Messages (message) VALUES (?);", req.body.message);
  res.redirect("/");
});

async function setup() {
  const db = await dbPromise;
  await db.migrate();
  app.listen(8080, () => {
    console.log("listening on http://localhost:8080");
  });
}

setup();
