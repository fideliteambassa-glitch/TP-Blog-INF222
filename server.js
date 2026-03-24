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
const PORT = process.env.PORT || 3000;
// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Blog API - Interface Web</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; color: #1f2937; margin: 0; padding: 20px; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                h1 { color: #2563eb; text-align: center; font-size: 2em; margin-bottom: 10px; }
                p.subtitle { text-align: center; color: #6b7280; margin-bottom: 30px; }
                .btn-docs { display: block; width: fit-content; margin: 0 auto 30px; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; transition: 0.3s; }
                .btn-docs:hover { background: #1d4ed8; }
                
                .section { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e5e7eb; }
                h2 { margin-top: 0; color: #374151; font-size: 1.5em; }
                
                input, textarea { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; font-family: inherit; }
                button { padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s; }
                button:hover { background: #059669; }
                
                .article-card { background: white; border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: flex-start; }
                .article-content h3 { margin: 0 0 10px 0; color: #111827; }
                .article-content p { margin: 0; color: #4b5563; }
                .btn-delete { background: #ef4444; padding: 8px 15px; font-size: 0.9em; }
                .btn-delete:hover { background: #dc2626; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Interface de Gestion du Blog</h1>
                <p class="subtitle">Projet Backend INF 222 - Déployé sur Railway</p>
                
                <a href="/api-docs" class="btn-docs">📖 Consulter la documentation Swagger</a>

                <div class="section">
                    <h2>📝 Ajouter un article</h2>
                    <form id="add-form">
                        <input type="text" id="title" placeholder="Titre de l'article" required>
                        <textarea id="content" placeholder="Contenu de l'article" rows="4" required></textarea>
                        <button type="submit">➕ Publier l'article</button>
                    </form>
                </div>

                <div class="section">
                    <h2>📚 Liste des articles</h2>
                    <div id="articles-list">
                        <p>Chargement des articles...</p>
                    </div>
                </div>
            </div>

            <script>
                //  IMPORTANT : Remplace '/articles' par la route de ton API si elle est différente (ex: '/api/articles')
                const API_URL = '//articles';

                // Fonction pour récupérer et afficher les articles
                async function fetchArticles() {
                    const list = document.getElementById('articles-list');
                    try {
                        const response = await fetch(API_URL);
                        const data = await response.json();
                        
                        list.innerHTML = ''; // On vide la liste
                        
                        if(data.length === 0) {
                            list.innerHTML = '<p>Aucun article trouvé. Ajoutez-en un !</p>';
                            return;
                        }

                        data.forEach(article => {
                            // On adapte selon ton modèle (title/titre, content/contenu)
                            const titre = article.title || article.titre || 'Sans titre';
                            const contenu = article.content || article.contenu || 'Sans contenu';
                            
                            const div = document.createElement('div');
                            div.className = 'article-card';
                            div.innerHTML = \`
                                <div class="article-content">
                                    <h3>\${titre}</h3>
                                    <p>\${contenu}</p>
                                </div>
                                <button class="btn-delete" onclick="deleteArticle('\${article._id}')">🗑️ Supprimer</button>
                            \`;
                            list.appendChild(div);
                        });
                    } catch (error) {
                        list.innerHTML = '<p style="color: red;">Erreur de connexion à l\\'API.</p>';
                    }
                }

                // Fonction pour ajouter un article
                document.getElementById('add-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    // On récupère les valeurs
                    const titleValue = document.getElementById('title').value;
                    const contentValue = document.getElementById('content').value;

                    // Adapte 'title' et 'content' selon les noms dans ton schéma MongoDB
                    const newArticle = { title: titleValue, content: contentValue };

                    await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newArticle)
                    });

                    document.getElementById('add-form').reset(); // Vide le formulaire
                    fetchArticles(); // Recharge la liste
                });

                // Fonction pour supprimer un article
                async function deleteArticle(id) {
                    if(confirm("Voulez-vous vraiment supprimer cet article ?")) {
                        await fetch(\`\${API_URL}/\${id}\`, { method: 'DELETE' });
                        fetchArticles(); // Recharge la liste
                    }
                }

                // Charger les articles au démarrage
                fetchArticles();
            </script>
        </body>
        </html>
    `);
});
app.listen(PORT, () => console.log(`Serveur sur le port ${PORT}`));
