const express = require('express');
const router = express.Router();

const Book = require('../models/book');
const {checkBearerToken} = require("../utils/auth");

router.get('/', checkBearerToken ,async (req, response) => {
  const {skip, limit, title, sort} = req.query;
  let filter = {};
  if(title){
    filter.title = {$regex: title, $options: 'i'};
  }
  let querySort = {title: 1};
  if(sort){
    const key = sort[0] === '-' ? sort.substring(1) : sort;
    const direction = sort[0] === '-' ? -1 : 1;
    querySort = {[key]: direction};
  }
  const books = await Book.find(filter).skip(skip || 0).limit(limit || 10).sort(querySort);
  return response.json(books);
});

// 2. Renvoyer la moyenne des notes par livre (et éventuellement le nombre de reviews)
router.get("/best-reviews", async (req, res) => {
  try {
    const pipeline = [
      // Sépare chaque review pour la calculer individuellement
      { $unwind: "$reviews" },
      // Regrouper par livre et calculer la moyenne
      {
        $group: {
          _id: { bookId: "$_id", title: "$title" },
          avgRating: { $avg: "$reviews.rating" },
          reviewCount: { $sum: 1 },
        },
      },
      // Trier par la meilleure note en premier
      { $sort: { avgRating: -1 } },
    ];

    const results = await Book.aggregate(pipeline);

    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/average-price', checkBearerToken, async (req, res) => {
  console.log('req.user');
  console.log(req.user);
  const stats = await Book.aggregate([
    {
      $group: {
        _id: '$author',
        totalBooks: {$sum: 1},
        averagePrice: { $avg: "$price" }
      }
    }
  ]).exec();
  res.json(stats);
});


router.get("/top-reviewers", async (req, res) => {
  try {
    const pipeline = [
      // Sépare chaque review en un document distinct
      { $unwind: "$reviews" },
      // Regroupe par nom d'utilisateur, et compte le nombre de reviews
      {
        $group: {
          _id: "$reviews.user",
          totalReviews: { $sum: 1 },
          averageReview: {$avg: '$reviews.rating'}
        },
      },
      // Trie du plus grand nombre de reviews au plus petit
      { $sort: { totalReviews: -1 } },
    ];

    const result = await Book.aggregate(pipeline);

    res.json(result);
  } catch (err) {
    console.error("Erreur lors de l'agrégation:", err);
    res.status(500).json({ error: err.message });
  }
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

router.post("/reviews", async (req, res) => {
  try {
    const { bookId, user, message, rating } = req.body;
    if (!bookId || !user || !message || rating == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Vérifier si le livre existe
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    if(!book.reviews){
      book.reviews = [];
    }

    // Ajouter la review
    book.reviews.push({ user, message, rating });
    await book.save();

    return res.status(201).json({ message: "Review added successfully", book });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});



module.exports = router;