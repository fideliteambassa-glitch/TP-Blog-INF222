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
            <title>Blog API - Gestion Complète</title>
            <style>
                :root { --primary: #2563eb; --success: #10b981; --danger: #ef4444; --warning: #f59e0b; --bg: #f3f4f6; --text: #1f2937; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: var(--bg); color: var(--text); margin: 0; padding: 20px; }
                .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                h1 { color: var(--primary); text-align: center; margin-bottom: 5px; }
                p.subtitle { text-align: center; color: #6b7280; margin-bottom: 30px; }
                
                .header-actions { display: flex; justify-content: center; margin-bottom: 30px; }
                .btn-docs { padding: 10px 20px; background: var(--primary); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; transition: 0.2s; }
                .btn-docs:hover { background: #1d4ed8; }

                .grid { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; }
                @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }

                .panel { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
                h2 { margin-top: 0; color: #374151; font-size: 1.3em; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }

                .form-group { margin-bottom: 15px; }
                label { display: block; margin-bottom: 5px; font-weight: bold; color: #4b5563; }
                input, textarea { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; font-family: inherit; }
                
                .btn-submit { width: 100%; padding: 12px; background: var(--success); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1em; transition: 0.2s; }
                .btn-submit:hover { background: #059669; }
                .btn-cancel { width: 100%; padding: 10px; margin-top: 10px; background: #9ca3af; color: white; border: none; border-radius: 6px; cursor: pointer; display: none; }

                .article-card { background: white; border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 15px; border-radius: 8px; position: relative; }
                .article-card h3 { margin: 0 0 10px 0; color: #111827; }
                .article-card p { margin: 0 0 15px 0; color: #4b5563; line-height: 1.5; }
                
                .card-actions { display: flex; gap: 10px; }
                .btn-edit { background: var(--warning); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9em; }
                .btn-delete { background: var(--danger); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9em; }
                
                .status-msg { padding: 10px; border-radius: 6px; margin-bottom: 15px; display: none; font-weight: bold; text-align: center; }
                .success { background: #d1fae5; color: #065f46; display: block; }
                .error { background: #fee2e2; color: #991b1b; display: block; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>⚙️ Administration du Blog</h1>
                <p class="subtitle">Interface Frontend Complète connectée à l'API (INF 222)</p>
                
                <div class="header-actions">
                    <a href="/api-docs" class="btn-docs">📖 Voir la Documentation Swagger</a>
                </div>

                <div id="statusMessage" class="status-msg"></div>

                <div class="grid">
                    <div class="panel">
                        <h2 id="formTitle">📝 Créer un article</h2>
                        <form id="articleForm">
                            <input type="hidden" id="articleId">
                            <div class="form-group">
                                <label>Titre de l'article</label>
                                <input type="text" id="title" required placeholder="Ex: Introduction à Node.js">
                            </div>
                            <div class="form-group">
                                <label>Contenu</label>
                                <textarea id="content" rows="6" required placeholder="Rédigez votre contenu ici..."></textarea>
                            </div>
                            <button type="submit" id="submitBtn" class="btn-submit">➕ Publier l'article</button>
                            <button type="button" id="cancelBtn" class="btn-cancel" onclick="resetForm()">Annuler la modification</button>
                        </form>
                    </div>

                    <div class="panel">
                        <h2>📚 Tous les articles</h2>
                        <div id="articlesList">
                            <p>Chargement des articles en cours...</p>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                // ==========================================
                // ⚠️ IMPORTANT : VERIFIE CETTE ROUTE
                // ==========================================
                const API_URL = '/api/articles'; // Mets '/api/articles' si c'est ce que tu as dans ton backend !
                
                const form = document.getElementById('articleForm');
                const titleInput = document.getElementById('title');
                const contentInput = document.getElementById('content');
                const idInput = document.getElementById('articleId');
                const submitBtn = document.getElementById('submitBtn');
                const cancelBtn = document.getElementById('cancelBtn');
                const formTitle = document.getElementById('formTitle');
                const statusMessage = document.getElementById('statusMessage');

                // Afficher un message de succès ou d'erreur
                function showMessage(msg, isError = false) {
                    statusMessage.textContent = msg;
                    statusMessage.className = 'status-msg ' + (isError ? 'error' : 'success');
                    setTimeout(() => statusMessage.style.display = 'none', 3000);
                }

                // 1. LIRE (GET) - Récupérer tous les articles
                async function fetchArticles() {
                    const list = document.getElementById('articlesList');
                    try {
                        const response = await fetch(API_URL);
                        if (!response.ok) throw new Error('Erreur réseau');
                        const data = await response.json();
                        
                        list.innerHTML = ''; 
                        if(data.length === 0) {
                            list.innerHTML = '<p>Aucun article trouvé. La base de données est vide.</p>';
                            return;
                        }

                        data.forEach(article => {
                            const titre = article.title || article.titre || 'Sans titre';
                            const contenu = article.content || article.contenu || 'Sans contenu';
                            const id = article._id;

                            const div = document.createElement('div');
                            div.className = 'article-card';
                            // On échappe les guillemets pour éviter les bugs dans le onclick
                            const safeTitre = titre.replace(/'/g, "\\'");
                            const safeContenu = contenu.replace(/'/g, "\\'");

                            div.innerHTML = \`
                                <h3>\${titre}</h3>
                                <p>\${contenu}</p>
                                <div class="card-actions">
                                    <button class="btn-edit" onclick="editArticle('\${id}', '\${safeTitre}', '\${safeContenu}')">✏️ Modifier</button>
                                    <button class="btn-delete" onclick="deleteArticle('\${id}')">🗑️ Supprimer</button>
                                </div>
                            \`;
                            list.appendChild(div);
                        });
                    } catch (error) {
                        list.innerHTML = '<p style="color: red;">❌ Erreur de connexion à l\\'API. Vérifie que la route API_URL est correcte.</p>';
                    }
                }

                // 2. CREER (POST) & 3. METTRE A JOUR (PUT/PATCH)
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const payload = {
                        title: titleInput.value,
                        content: contentInput.value
                        // Si ton modèle utilise "titre" et "contenu", change les clés ici !
                    };

                    const articleId = idInput.value;
                    const method = articleId ? 'PUT' : 'POST'; // Si on a un ID, c'est une modification
                    const url = articleId ? \`\${API_URL}/\${articleId}\` : API_URL;

                    try {
                        const response = await fetch(url, {
                            method: method,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        if (response.ok) {
                            showMessage(articleId ? 'Article modifié avec succès !' : 'Article publié avec succès !');
                            resetForm();
                            fetchArticles();
                        } else {
                            throw new Error('Erreur lors de la sauvegarde');
                        }
                    } catch (error) {
                        showMessage(error.message, true);
                    }
                });

                // 4. SUPPRIMER (DELETE)
                async function deleteArticle(id) {
                    if(confirm("⚠️ Êtes-vous sûr de vouloir supprimer définitivement cet article ?")) {
                        try {
                            const response = await fetch(\`\${API_URL}/\${id}\`, { method: 'DELETE' });
                            if(response.ok) {
                                showMessage('Article supprimé.');
                                fetchArticles();
                            } else {
                                throw new Error('Erreur lors de la suppression');
                            }
                        } catch (error) {
                            showMessage(error.message, true);
                        }
                    }
                }

                // Préparer le formulaire pour la modification
                function editArticle(id, title, content) {
                    idInput.value = id;
                    titleInput.value = title;
                    contentInput.value = content;
                    
                    formTitle.innerHTML = '✏️ Modifier l\\'article';
                    submitBtn.innerHTML = '💾 Enregistrer les modifications';
                    submitBtn.style.background = 'var(--warning)';
                    cancelBtn.style.display = 'block';
                    
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }

                // Réinitialiser le formulaire
                function resetForm() {
                    form.reset();
                    idInput.value = '';
                    formTitle.innerHTML = '📝 Créer un article';
                    submitBtn.innerHTML = '➕ Publier l\\'article';
                    submitBtn.style.background = 'var(--success)';
                    cancelBtn.style.display = 'none';
                }

                // Charger la liste au démarrage
                fetchArticles();
            </script>
        </body>
        </html>
    `);
});
app.listen(PORT, () => console.log(`Serveur sur le port ${PORT}`));
