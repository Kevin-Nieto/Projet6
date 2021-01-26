const jwt = require('jsonwebtoken');
//Création d'un token d'authentification pour sécuriser les connections au site
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) { //On décode le token crée et le compare au userId pour vérifier qu'il s'agit bien du même utilisateur
      throw 'Invalid user ID';
    } else {
      req.userId = userId;
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};