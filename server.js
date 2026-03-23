const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(bodyParser.json());

// 1. CONNEXION MONGODB
const MONGO_URI = 'mongodb://127.0.0.1:27017/blog_tp'; 
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connexion MongoDB réussie !"))
    .catch(err => console.log("❌ Erreur de connexion :", err));

// 2. MODÈLE D'ARTICLE
const Article = mongoose.model('Article', new mongoose.Schema({
    titre: { type: String, required: true },
    contenu: String,
    auteur: { type: String, required: true },
    categorie: String,
    tags: [String],
    date: { type: Date, default: Date.now }
}));

// --- 3. ROUTES API (CRUD COMPLET) ---

// LIRE TOUS LES ARTICLES
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// RECHERCHER UN ARTICLE PAR TITRE
app.get('/api/articles/recherche', async (req, res) => {
    try {
        const query = req.query.q;
        const articles = await Article.find({ titre: new RegExp(query, 'i') });
        res.json(articles);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// LIRE UN SEUL ARTICLE (PAR SON ID)
app.get('/api/articles/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: "Article non trouvé" });
        res.json(article);
    } catch (err) { res.status(500).json({ message: "ID invalide" }); }
});

// CRÉER UN ARTICLE
app.post('/api/articles', async (req, res) => {
    try {
        const nouvelArticle = new Article(req.body);
        await nouvelArticle.save();
        res.status(201).json(nouvelArticle);
    } catch (err) { res.status(400).json({ message: "Erreur de création" }); }
});

// MODIFIER UN ARTICLE (Mise à jour)
app.put('/api/articles/:id', async (req, res) => {
    try {
        const articleModifie = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!articleModifie) return res.status(404).json({ message: "Article non trouvé" });
        res.json(articleModifie);
    } catch (err) { res.status(400).json({ message: "Erreur lors de la modification" }); }
});

// SUPPRIMER UN ARTICLE
app.delete('/api/articles/:id', async (req, res) => {
    try {
        const articleSupprime = await Article.findByIdAndDelete(req.params.id);
        if (!articleSupprime) return res.status(404).json({ message: "Article non trouvé" });
        res.json({ message: "Article supprimé avec succès" });
    } catch (err) { res.status(500).json({ message: "Erreur lors de la suppression" }); }
});

// --- 4. CONFIGURATION SWAGGER ---
const swaggerOptions = {
    swaggerDefinition: {
        swagger: "2.0",
        info: {
            title: "Blog API INF222 - Gabriella Mfegue",
            version: "1.0.0",
            description: "Documentation complète du CRUD pour le TP"
        },
        paths: {
            "/api/articles": {
                "get": { "summary": "Liste tous les articles", "responses": { "200": { "description": "OK" } } },
                "post": {
                    "summary": "Ajouter un article",
                    "parameters": [{ "name": "body", "in": "body", "schema": { "type": "object", "properties": { "titre": { "type": "string" }, "contenu": { "type": "string" }, "auteur": { "type": "string" } } } }],
                    "responses": { "201": { "description": "Créé" } }
                }
            },
            "/api/articles/{id}": {
                "get": { "summary": "Voir un article par ID", "parameters": [{ "name": "id", "in": "path", "required": true, "type": "string" }], "responses": { "200": { "description": "OK" } } },
                "put": { 
                    "summary": "Modifier un article", 
                    "parameters": [
                        { "name": "id", "in": "path", "required": true, "type": "string" },
                        { "name": "body", "in": "body", "schema": { "type": "object", "properties": { "titre": { "type": "string" }, "contenu": { "type": "string" } } } }
                    ], 
                    "responses": { "200": { "description": "Mis à jour" } } 
                },
                "delete": { "summary": "Supprimer un article", "parameters": [{ "name": "id", "in": "path", "required": true, "type": "string" }], "responses": { "200": { "description": "Supprimé" } } }
            },
            "/api/articles/recherche": {
                "get": { "summary": "Rechercher", "parameters": [{ "name": "q", "in": "query", "type": "string" }], "responses": { "200": { "description": "OK" } } }
            }
        }
    },
    apis: []
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 5. LANCEMENT
const PORT = 3000;
app.listen(PORT, () => {
    console.log(` Serveur : http://localhost:${PORT}`);
    console.log(` Swagger : http://localhost:${PORT}/api-docs`);
});