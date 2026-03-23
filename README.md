# API de Gestion de Blog - TP INF222
**Étudiante : Ambassa Mfegue Gabriella** **Filière : [Ta filière ex: GL]**

##  Description du projet
Ce projet consiste en la création d'une API REST pour la gestion d'un blog. Il permet de manipuler des articles (création, lecture, modification, suppression) en utilisant Node.js, Express et MongoDB.

##  Fonctionnalités (Points clés du TP)
- **Modèle de données complet** : Titre, Contenu, Auteur, Catégorie, Tags et Date.
- **Opérations CRUD** :
  - `GET /api/articles` : Liste des articles (avec filtres optionnels par catégorie/auteur).
  - `POST /api/articles` : Création d'un article.
  - `GET /api/articles/:id` : Consultation d'un article unique.
  - `PUT /api/articles/:id` : Mise à jour des informations.
  - `DELETE /api/articles/:id` : Suppression définitive.
- **Moteur de recherche** : `GET /api/articles/search?query=texte` pour rechercher dans le titre et le contenu.
- **Documentation interactive** : Swagger UI intégré.

##  Installation et Lancement
1. **Cloner le projet** :
   ```bash
   git clone [https://github.com/fideliteambassa-glitch/TP-Blog-INF222.git](https://github.com/fideliteambassa-glitch/TP-Blog-INF222.git)
   cd TP-Blog-INF222