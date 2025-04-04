const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  publishDate: { type: Date, required: true },
  isbn: { type: String, required: true },
  quantity: { type: Number, required: true },
  categoryId: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  reviews: [
    {
      user: { type: String, required: true },
      message: { type: String, required: true },
      rating: { type: Number, required: true },
    }
  ]
})

module.exports = mongoose.model('Book', bookSchema);