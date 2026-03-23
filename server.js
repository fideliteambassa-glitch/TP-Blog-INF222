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

// 2. MODÈLE (Champs demandés : titre, contenu, auteur, date, categorie, tags)
const Article = mongoose.model('Article', new mongoose.Schema({
    titre: { type: String, required: true },
    contenu: { type: String, required: true },
    auteur: { type: String, required: true },
    categorie: { type: String, default: "Général" },
    tags: [String],
    date: { type: Date, default: Date.now }
}));

// --- 3. ROUTES API (Strictement conformes au sujet) ---

// GET /api/articles (Liste complète ou filtrée)
app.get('/api/articles', async (req, res) => {
    try {
        let query = {};
        if (req.query.categorie) query.categorie = req.query.categorie;
        if (req.query.auteur) query.auteur = req.query.auteur;
        const articles = await Article.find(query);
        res.status(200).json(articles);
    } catch (err) { res.status(500).json({ message: "Erreur serveur" }); }
});

// GET /api/articles/search?query=texte (Recherche demandée)
app.get('/api/articles/search', async (req, res) => {
    try {
        const t = req.query.query;
        const results = await Article.find({
            $or: [{ titre: new RegExp(t, 'i') }, { contenu: new RegExp(t, 'i') }]
        });
        res.status(200).json(results);
    } catch (err) { res.status(500).json({ message: "Erreur recherche" }); }
});

// GET /api/articles/:id (Article unique)
app.get('/api/articles/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: "Article non trouvé" });
        res.status(200).json(article);
    } catch (err) { res.status(400).json({ message: "Format ID invalide" }); }
});

// POST /api/articles (Création avec renvoi ID)
app.post('/api/articles', async (req, res) => {
    try {
        const nouvelArticle = new Article(req.body);
        await nouvelArticle.save();
        res.status(201).json(nouvelArticle);
    } catch (err) { res.status(400).json({ message: "Données manquantes" }); }
});

// PUT /api/articles/:id (Modification)
app.put('/api/articles/:id', async (req, res) => {
    try {
        const modifie = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!modifie) return res.status(404).json({ message: "Article non trouvé" });
        res.status(200).json(modifie);
    } catch (err) { res.status(400).json({ message: "Erreur modification" }); }
});

// DELETE /api/articles/:id (Suppression + Confirmation)
app.delete('/api/articles/:id', async (req, res) => {
    try {
        const supp = await Article.findByIdAndDelete(req.params.id);
        if (!supp) return res.status(404).json({ message: "Article non trouvé" });
        res.status(200).json({ message: "Article supprimé avec succès" });
    } catch (err) { res.status(500).json({ message: "Erreur suppression" }); }
});

// --- 4. CONFIGURATION SWAGGER DÉTAILLÉE ---
const swaggerOptions = {
    swaggerDefinition: {
        swagger: "2.0",
        info: { title: "Blog API INF222", version: "1.0.0", description: "Documentation TP Gabriella Mfegue" },
        paths: {
            "/api/articles": {
                "get": { "summary": "Liste complète ou filtrée (?categorie=...)", "parameters": [{ "name": "categorie", "in": "query", "type": "string" }, { "name": "auteur", "in": "query", "type": "string" }], "responses": { "200": { "description": "OK" } } },
                "post": { "summary": "Créer un article", "parameters": [{ "name": "body", "in": "body", "schema": { "type": "object", "properties": { "titre": { "type": "string" }, "contenu": { "type": "string" }, "auteur": { "type": "string" }, "categorie": { "type": "string" }, "tags": { "type": "array", "items": { "type": "string" } } } } }], "responses": { "201": { "description": "Créé" } } }
            },
            "/api/articles/search": {
                "get": { "summary": "Recherche", "parameters": [{ "name": "query", "in": "query", "required": true, "type": "string" }], "responses": { "200": { "description": "OK" } } }
            },
            "/api/articles/{id}": {
                "get": { "summary": "Voir un article", "parameters": [{ "name": "id", "in": "path", "required": true, "type": "string" }], "responses": { "200": { "description": "OK" }, "404": { "description": "Non trouvé" } } },
                "put": { "summary": "Modifier", "parameters": [{ "name": "id", "in": "path", "required": true, "type": "string" }, { "name": "body", "in": "body", "schema": { "type": "object", "properties": { "titre": { "type": "string" }, "contenu": { "type": "string" } } } }], "responses": { "200": { "description": "Mis à jour" } } },
                "delete": { "summary": "Supprimer", "parameters": [{ "name": "id", "in": "path", "required": true, "type": "string" }], "responses": { "200": { "description": "Supprimé" } } }
            }
        }
    },
    apis: []
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(3000, () => console.log(` Serveur : http://localhost:3000/api-docs`));