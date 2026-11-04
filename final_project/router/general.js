const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: "Username already exists"
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: "User registered successfully"
  });
});


 // Get the list of books using Axios and async/await
public_users.get('/books/async', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');

    return res.status(200)
      .type('json')
      .send(JSON.stringify(response.data, null, 2));

  } catch (error) {
    return res.status(502).json({
      message: "Unable to fetch the book list",
      error: error.message
    });
  }
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200)
    .type('json')
    .send(JSON.stringify(books, null, 2));
});


 // Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  return res.status(200)
    .type('json')
    .send(JSON.stringify(book, null, 2));
});



 // Get book details by author using Axios and async/await
public_users.get('/author/async/:author', async (req, res) => {
  const author = req.params.author;

  try {
    const response = await axios.get(
      `http://localhost:5000/author/${encodeURIComponent(author)}`
    );

    return res.status(200)
      .type('json')
      .send(JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        message: "No books found for this author"
      });
    }

    return res.status(502).json({
      message: "Unable to fetch books by author",
      error: error.message
    });
  }
});
  

 // Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const bookKeys = Object.keys(books);
  const matchingBooks = {};

  bookKeys.forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      matchingBooks[isbn] = books[isbn];
    }
  });

  if (Object.keys(matchingBooks).length === 0) {
    return res.status(404).json({
      message: "No books found for this author"
    });
  }

  return res.status(200)
    .type('json')
    .send(JSON.stringify(matchingBooks, null, 2));
});



 // Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const bookKeys = Object.keys(books);
  const matchingBooks = {};

  bookKeys.forEach((isbn) => {
    if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
      matchingBooks[isbn] = books[isbn];
    }
  });

  if (Object.keys(matchingBooks).length === 0) {
    return res.status(404).json({
      message: "No books found with this title"
    });
  }

  return res.status(200)
    .type('json')
    .send(JSON.stringify(matchingBooks, null, 2));
});



 // Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  return res.status(200)
    .type('json')
    .send(JSON.stringify(book.reviews, null, 2));
});



 // Get book details by title using Axios and async/await
public_users.get('/title/async/:title', async (req, res) => {
  const title = req.params.title;

  try {
    const response = await axios.get(
      `http://localhost:5000/title/${encodeURIComponent(title)}`
    );

    return res.status(200)
      .type('json')
      .send(JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        message: "No books found with this title"
      });
    }

    return res.status(502).json({
      message: "Unable to fetch books by title",
      error: error.message
    });
  }
});


module.exports.general = public_users;
