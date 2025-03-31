const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  publishDate: { type: Date, required: true },
  isbn: { type: String, required: true },
  quantity: { type: Number, required: true },
  categoryId: String
})

module.exports = mongoose.model('Book', bookSchema);