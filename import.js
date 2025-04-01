const { MongoClient, ObjectId} = require("mongodb");
const fs = require("fs");

// URL de connexion à MongoDB (en local, généralement "mongodb://localhost:27017")
const url = "mongodb://localhost:27017";

// Nom de la base de données dans laquelle on souhaite insérer les données
const dbName = "booksDatabase"; // <-- à adapter selon tes besoins

// Nom de la collection MongoDB
const collectionName = "books"; // <-- à adapter


async function main() {
    // Création d'une instance de client
    const client = new MongoClient(url, { useUnifiedTopology: true });

    try {
        // Connexion au serveur
        await client.connect();
        console.log("Connecté à MongoDB");

        // Sélection de la base de données
        const db = client.db(dbName);
        await db.collection('books').deleteMany({});
        await db.collection('categories').deleteMany({});

        const categories = JSON.parse(fs.readFileSync("categories.json", "utf8"))
            .map(c => ({ name: c.name }));
        const result_ = await db.collection('categories').insertMany(categories);
        const realCategories = await db.collection('categories').find().toArray();

        // Lecture du fichier JSON (assure-toi que le fichier existe dans le même dossier)
        const data = JSON.parse(fs.readFileSync("books.json", "utf8")).map(book => {
            // On ajoute un champ "category" avec une catégorie aléatoire
            book.category = realCategories[Math.floor(Math.random() * realCategories.length)]._id;
            book.reviews = [];
            for(let i = 0; i < Math.floor(Math.random() * 5); i++) {
                book.reviews.push({
                    rating: Math.floor(Math.random() * 5) + 1,
                    message: "What a great book!",
                    user: 'Anonymous'
                });
            }
            return {
                _id: new ObjectId(), // On génère un nouvel ID pour chaque document
                ...book
            };
        });



        // On insère tous les documents du fichier JSON dans la collection
        const result = await db.collection(collectionName).insertMany(data);

        console.log(`${result.insertedCount} documents insérés dans la collection "${collectionName}"`);
    } catch (err) {
        console.error("Erreur lors de l'importation :", err);
    } finally {
        // Fermeture de la connexion
        await client.close();
    }
}

main();


// db.books.aggregate([{ $match: { author: "J.K. Rowling" } }, { $group: { _id: "$author",  totalBooks: { $sum: 1 }, avgPrice: { $avg: "$price" }    }  }])