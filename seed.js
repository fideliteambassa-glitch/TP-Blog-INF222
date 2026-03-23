const mongoose = require('mongoose');

// On utilise la même adresse que dans server.js
const MONGO_URI = 'mongodb://127.0.0.1:27017/blog_tp'; 

// On définit le modèle ici aussi pour que le script sache quoi remplir
const Article = mongoose.model('Article', new mongoose.Schema({
    titre: { type: String, required: true },
    contenu: String,
    auteur: { type: String, required: true },
    categorie: String,
    tags: [String],
    date: { type: Date, default: Date.now }
}));

const articles = [
    { titre: "Découvrir Node.js", contenu: "Node.js est un runtime JS.", auteur: "Gabriella", categorie: "Tech", tags: ["JS"] },
    { titre: "Maitriser MongoDB", contenu: "NoSQL est puissant.", auteur: "Gabriella", categorie: "Base de données", tags: ["NoSQL"] },
    { titre: "Express et les API", contenu: "Créer des routes facilement.", auteur: "Gabriella", categorie: "Backend", tags: ["Express"] },
    { titre: "L'importance du JSON", contenu: "Le format d'échange standard.", auteur: "Gabriella", categorie: "Dev", tags: ["JSON"] },
    { titre: "Sécurité Backend", contenu: "Protéger ses données.", auteur: "Gabriella", categorie: "Cyber", tags: ["Security"] },
    { titre: "Le rôle de Mongoose", contenu: "L'ODM pour MongoDB.", auteur: "Gabriella", categorie: "Tech", tags: ["Mongoose"] },
    { titre: "Documentation Swagger", contenu: "Documenter pour les autres.", auteur: "Gabriella", categorie: "Doc", tags: ["Swagger"] },
    { titre: "Tests avec Postman", contenu: "Valider ses endpoints.", auteur: "Gabriella", categorie: "QA", tags: ["Postman"] },
    { titre: "Déploiement Cloud", contenu: "Mettre en ligne son API.", auteur: "Gabriella", categorie: "Cloud", tags: ["Deploy"] },
    { titre: "Architecture REST", contenu: "Les principes fondamentaux.", auteur: "Gabriella", categorie: "Arch", tags: ["REST"] }
];

async function seedDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connexion pour le remplissage réussie");
        
        await Article.deleteMany({}); // On vide la base pour éviter les doublons
        await Article.insertMany(articles);
        
        console.log(" Succès : 10 articles ont été créés dans 'blog_tp' !");
        process.exit();
    } catch (err) {
        console.error("❌ Erreur :", err);
        process.exit(1);
    }
}

seedDB();