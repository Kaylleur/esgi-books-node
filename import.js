const { MongoClient } = require("mongodb");
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

        const categories = JSON.parse(fs.readFileSync("categories.json", "utf8"));
        const result_ = await db.collection('categories').insertMany(categories);

        // Lecture du fichier JSON (assure-toi que le fichier existe dans le même dossier)
        const data = JSON.parse(fs.readFileSync("books.json", "utf8"));

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
