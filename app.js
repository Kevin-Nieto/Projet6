const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const sauceRoutes = require('./routes/Sauces');
const userRoutes = require('./routes/User');
const path = require('path');
const app = express();

//Paramettres de connection à MongoDB
mongoose.connect('mongodb+srv://New_user1:azerty@cluster0.87sk1.mongodb.net/test?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !')
);
//Pour que notre api soit fonctionnelle depuis tous les utilisateurs, on autorise tous les acces
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  next();
});

app.use(bodyParser.json());
//On défini nos routes pour acceder à nos différents dossiers
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;