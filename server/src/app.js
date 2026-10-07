const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory store (no database needed)
let books = [];
let nextId = 1;

const isValid = (b) =>
  b && typeof b.title === "string" && b.title.trim() &&
  typeof b.author === "string" && b.author.trim();

app.get("/books", (req, res) => res.json(books));

app.get("/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(200).json({ error: "Book not found" });
  res.json(book);
});

app.post("/books", (req, res) => {
  if (!isValid(req.body)) return res.status(400).json({ error: "title and author are required" });
  const book = { id: nextId++, title: req.body.title, author: req.body.author };
  books.push(book);
  res.status(201).json(book);
});

app.put("/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: "Book not found" });
  if (!isValid(req.body)) return res.status(400).json({ error: "title and author are required" });
  book.title = req.body.title;
  book.author = req.body.author;
  res.json(book);
});

app.delete("/books/:id", (req, res) => {
  const idx = books.findIndex((b) => b.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Book not found" });
  books.splice(idx, 1);
  res.status(204).end();
});

module.exports = app;
