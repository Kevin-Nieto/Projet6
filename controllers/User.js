const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validator = require('validator');
const passwordValidator = require('password-validator');

//Fonction "signup", pour que l'utilisateur puisse créer un compte
exports.signup = (req, res, next) => {
	let schemaPassword = new passwordValidator();
	schemaPassword
	.is().min(8)                                    // Minimum length 8
	.is().max(20)                                  // Maximum length 20
	.has().uppercase()                              // Must have uppercase letters
	.has().lowercase()								// Must have lowercase letters
	.has().digits(2)                                // Must have at least 2 digits
	.has().not().spaces()                           // Should not have spaces
	.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values
	if (schemaPassword.validate(req.body.password) === true && validator.isEmail(req.body.email)) {
		bcrypt.hash(req.body.password, 10) //On va faire un "hash" du mot de passe, on lui demande de faire 10 tours pour le sécuriser. (Plus il y a de tour, plus se sera sécurisé, mais aussi plus long)
	.then(hash => {
		const user = new User({ //On crée un nouvel utilisateur avec son email et le mot de passe
			email: req.body.email,
			password: hash
		});
		user.save()
		.then(() => res.status(201).json({ message: 'Utilisateur crée !'}))
		.catch(error => res.status(400).json({ error }));
	})
	.catch(error => res.status(500).json({ error }));
	}
	else {
		res.status(500).json({ error: ' email ou mot de passe invalide '});
	}
};

//Fonction pour se connecter
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) { //Si l'utilisateur n'est pas dans la base de donnée, on lui affiche un message d'erreur
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password) //On utilise "bcrypt.compare" pour comparer le hash du mot de passe dans la base de donnée, et celui qui vient d'être entré
        .then(valid => {
          if (!valid) { //Si la fonction "compare" nous dis que les deux mots de passe ne sont pas identique, on afficher une erreur
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({ //Sinon on crée un 'token', qui sera envoyé pour chaque demande d'authentification. Cela permet à l'utilisateur de se connecter qu'une seule fois au site
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};