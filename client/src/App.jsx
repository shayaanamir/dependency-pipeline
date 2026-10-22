import { useEffect, useState } from "react";

export default function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    const res = await fetch("/books");
    setBooks(await res.json());
  };

  useEffect(() => {
    load().catch(() => setError("Could not reach the server"));
  }, []);

  const addBook = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author }),
    });
    if (!res.ok) {
      setError((await res.json()).error);
      return;
    }
    setTitle("");
    setAuthor("");
    load();
  };

  const deleteBook = async (id) => {
    await fetch(`/books/${id}`, { method: "DELETE" });
    load();
  };

  const query = search.trim().toLowerCase();
  const visibleBooks = books.filter(
    (b) => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query)
  );

  return (
    <main>
      <h1>Book Manager</h1>

      <form onSubmit={addBook}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <button type="submit">Add</button>
      </form>
      {error && <p className="error">{error}</p>}

      <input
        placeholder="Search by title or author"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul>
        {visibleBooks.map((b) => (
          <li key={b.id}>
            <span>
              <strong>{b.title}</strong> by {b.author}
            </span>
            <button onClick={() => deleteBook(b.id)}>Delete</button>
          </li>
        ))}
        {visibleBooks.length === 0 && (
          <li className="empty">{books.length === 0 ? "No books yet." : "No matching books."}</li>
        )}
      </ul>
    </main>
  );
}
