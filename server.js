const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(bodyParser.json());

// 1. CONNEXION MONGODB
mongoose.connect('mongodb://127.0.0.1:27017/blog_tp')
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.log("❌ Erreur MongoDB:", err));

// 2. MODÈLE (Ajout des champs Catégorie, Tags, Date demandés par le TP)
const ArticleSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    contenu: { type: String, required: true },
    auteur: { type: String, required: true },
    categorie: { type: String, default: "Général" },
    tags: { type: [String], default: [] },
    date: { type: Date, default: Date.now }
});
const Article = mongoose.model('Article', ArticleSchema);

// --- 3. ROUTES API (CORRIGÉES SELON L'ÉNONCÉ) ---

// LIRE / AFFICHER (Avec filtres optionnels demandés : catégorie, auteur)
app.get('/api/articles', async (req, res) => {
    try {
        let filters = {};
        if (req.query.categorie) filters.categorie = req.query.categorie;
        if (req.query.auteur) filters.auteur = req.query.auteur;
        
        const articles = await Article.find(filters);
        res.json(articles);
    } catch (err) { res.status(500).json({ message: "Erreur serveur" }); }
});

// RECHERCHER UN ARTICLE (URL exacte demandée : /search?query=...)
app.get('/api/articles/search', async (req, res) => {
    try {
        const texte = req.query.query;
        const articles = await Article.find({
            $or: [
                { titre: new RegExp(texte, 'i') },
                { contenu: new RegExp(texte, 'i') }
            ]
        });
        res.json(articles);
    } catch (err) { res.status(500).json({ message: "Erreur recherche" }); }
});

// LIRE UN ARTICLE UNIQUE
app.get('/api/articles/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: "Article non trouvé" });
        res.json(article);
    } catch (err) { res.status(400).json({ message: "ID invalide" }); }
});

// CRÉER UN ARTICLE
app.post('/api/articles', async (req, res) => {
    try {
        const nouvelArticle = new Article(req.body);
        const sauvé = await nouvelArticle.save();
        res.status(201).json(sauvé);
    } catch (err) { res.status(400).json({ message: "Données invalides (titre et auteur requis)" }); }
});

// MODIFIER UN ARTICLE
app.put('/api/articles/:id', async (req, res) => {
    try {
        const modifie = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!modifie) return res.status(404).json({ message: "Article inexistant" });
        res.json(modifie);
    } catch (err) { res.status(400).json({ message: "Erreur modification" }); }
});

// SUPPRIMER UN ARTICLE
app.delete('/api/articles/:id', async (req, res) => {
    try {
        const supprime = await Article.findByIdAndDelete(req.params.id);
        if (!supprime) return res.status(404).json({ message: "Article non trouvé" });
        res.json({ message: "L'article doit être supprimé et renvoyer une confirmation" });
    } catch (err) { res.status(500).json({ message: "Erreur suppression" }); }
});

// --- 4. SWAGGER (Mise à jour pour inclure tous les champs) ---
const swaggerOptions = {
    swaggerDefinition: {
        info: { title: "Blog API INF222", version: "1.0.0", description: "TP Gabriella Mfegue" },
        basePath: "/",
    },
    apis: ["./server.js"] // On utilise ici une config simplifiée pour Swagger UI
};

// Route simplifiée pour Swagger UI (plus robuste pour les tests)
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(3000, () => console.log(` Serveur prêt sur http://localhost:3000`));