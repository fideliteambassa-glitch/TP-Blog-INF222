const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  contenu: { type: String, required: true },
  auteur: { type: String, required: true },
  date: { type: String, required: true },
  categorie: { type: String, required: true },
  tags: { type: [String], default: [] }
});

module.exports = mongoose.model('Article', articleSchema);