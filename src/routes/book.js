const express = require('express');
const router = express.Router();

const Book = require('../models/book');
const {checkBearerToken} = require("../utils/auth");

router.get('/', checkBearerToken ,async (req, response) => {
  const {skip, limit} = req.query;
  const books = await Book.find({},).skip(skip || 0).limit(limit || 10);
  return response.json(books);
});



router.get('/:id', async (req, res) => {
  const {id} = req.params;
  if (!id) {
    return res.status(400).json({message: '"id" is required'});
  }
  const book = await Book.findOne({_id: id});
  if (!book) {
    return res.status(404).json({message: 'Book not found'});
  }
  return res.status(200).json(book);
});

router.post('/', async (req, res) => {
  const {title, author} = req.body;
  if (!title) {
    return res.status(400).json({message: '"title" is required'});
  }
  if (!author) {
    return res.status(400).json({message: '"author" is required'});
  }

  const newBook = {
    ...req.body,
  };

  const result = await Book.insertOne(newBook);
  return res.status(201).json(await Book.findOne({_id: result.insertedId}));
});

router.put('/:id', async (req, res) => {
  const {id} = req.params;
  if (!id) {
    return res.status(400).json({message: '"id" is required'});
  }

  await Book.updateOne({_id: id},
    req.body
  );

  return res.status(200).json(await Book.findOne({_id: id}));
});

router.delete('/:id', async (req, res) => {
  const {id} = req.params;
  await Book.deleteOne({_id: id});
  return res.status(204).end();
});

module.exports = router;