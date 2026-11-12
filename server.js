const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const db = new Database("tasks.db");

app.use(express.json());
app.use(express.static("public"));

db.exec("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0)");

app.get("/api/tasks", (req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks").all();
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const title = req.body.title;
  const info = db.prepare("INSERT INTO tasks (title) VALUES (?)").run(title);
  res.status(201).json({ id: info.lastInsertRowid, title: title, done: 0 });
});

app.put("/api/tasks/:id", (req, res) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  if (!task) return res.status(404).json({ error: "Not Found" });

  const title = req.body.title !== undefined ? req.body.title : task.title;
  const done = req.body.done !== undefined ? (req.body.done ? 1 : 0) : task.done;

  db.prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ?").run(title, done, req.params.id);
  res.json({ id: task.id, title: title, done: done });
});

app.delete("/api/tasks/:id", (req, res) => {
  db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

app.listen(3000, () => {
  console.log("Сервер працює: http://localhost:3000");
});
