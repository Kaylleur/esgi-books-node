const express = require("express");
const router = express.Router();
const Category = require("../models/category"); // Adapter le chemin vers ton modèle

// 1. Récupérer toutes les catégories (GET /api/categories)
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Récupérer une catégorie par son ID (GET /api/categories/:id)
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json(category);
  } catch (err) {
    // Par exemple, erreur si l'ID n'est pas un ObjectId valide
    res.status(500).json({ error: err.message });
  }
});

// 3. Créer une nouvelle catégorie (POST /api/categories)
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: '"name" is required' });
    }

    // Création d'une instance du modèle Category
    const newCategory = new Category({ name });
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (err) {
    // Gérer l'erreur mongoose "unique: true" (duplicat de nom)
    if (err.code === 11000) {
      return res.status(400).json({ error: "Category name must be unique" });
    }
    res.status(500).json({ error: err.message });
  }
});

// 4. Mettre à jour une catégorie (PUT /api/categories/:id)
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: '"name" is required' });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Category name must be unique" });
    }
    console.log(err)
    res.status(500).json({ error: err.message });
  }
});

// 5. Supprimer une catégorie (DELETE /api/categories/:id)
router.delete("/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }
    // 204 => pas de contenu
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
