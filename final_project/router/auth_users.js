const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = (username) => {
  return users.some((user) => user.username === username);
};



const authenticatedUser = (username, password) => {
  return users.some((user) =>
    user.username === username &&
    user.password === password
  );
};



regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  // Validate the request
  if (typeof username !== "string" || !username.trim() ||
      typeof password !== "string" || !password.trim()) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  // Authenticate registered user
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Invalid username or password"
    });
  }

  // Generate JWT access token
  const accessToken = jwt.sign(
    { username },
    "access",
    { expiresIn: "1h" }
  );

  // Save authentication details in session
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: "User successfully logged in"
  });
});



 // Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  // Check if a review was provided
  if (typeof review !== "string" || !review.trim()) {
    return res.status(400).json({
      message: "Review is required"
    });
  }

  // Determine whether the user has reviewed this book before
  const isUpdate = Object.prototype.hasOwnProperty.call(
    books[isbn].reviews,
    username
  );

  // Add a new review or update the existing review
  books[isbn].reviews[username] = review;

  return res.status(isUpdate ? 200 : 201).json({
    message: isUpdate
      ? "Review updated successfully"
      : "Review added successfully",
    reviews: books[isbn].reviews
  });
});


 // Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  // Check whether the book exists
  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  // Check whether the user has reviewed this book
  if (!Object.prototype.hasOwnProperty.call(
    books[isbn].reviews, username
  )) {
    return res.status(404).json({
      message: "You have not reviewed this book"
    });
  }

  // Delete only the authenticated user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews
  });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
