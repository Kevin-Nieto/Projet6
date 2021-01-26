const Sauces = require('../models/Sauces');
const fs = require('fs');

//Création d'une sauce (methode "post")

exports.createSauce = (req, res, next) => {
	const sauceObject = JSON.parse(req.body.sauce);
	const sauce = new Sauces({ //On crée un nouvel objet sauce qui contiendra les informations entrée par l'utilisateur
    ...sauceObject,
	likes: 0,
	imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
	dislikes: 0,
	usersLiked: [],
	usersDisliked: [],
	userId : req.userId
  });
	sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistré !'})) //Si la requète est validé, on afficher un message
    .catch(error => res.status(400).json({ error })); //Sinon on renvoi une erreur
};

//Modification d'une sauce existante (methode "put")
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`//Si un fichier image est présent dans la methode "put", on remplace l'ancinne par la nouvelle
    } : { ...req.body };

  Sauces.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id }) //On utilise ".updateone" pour mettre à jour la sauce correspondante
    .then(() => res.status(200).json({ message: 'Sauce modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

//Suppression d'une sauce (methode "delete")
exports.deleteSauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => { //On va supprimer l'image de la sauce qui est dans notre dossier "images"
        Sauces.deleteOne({ _id: req.params.id }) //Et on supprime la sauce correspondant avec ".deleteOne"
          .then(() => res.status(200).json({ message: 'Sauce supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

//On récupère notre tableau avec toutes les sauces (methode "get")
exports.getAllSauce = (req, res, next) => {
  Sauces.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

//On récupère une sauce corréspondante à l'id demandé (methode "get")
exports.getOneSauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.like_dislike = (req, res, next) => { //Systeme de like/dislike d'une sauce. On récupère une sauce, ajoute le userId dans le tableau des likes/dislikes et ajoute ou retire 1 like/dislike sur la sauce
	Sauces.findOne({ _id: req.params.id })
		.then(sauce => {
			if (req.body.like === 1 && sauce.usersLiked.indexOf(req.userId) === -1) { //Si l'utilisateur like et que le userId n'est pas présent dans usersLiked, on ajoute son userId et 1 like
				sauce.usersLiked.push(req.userId);
				sauce.likes ++;
			}
			else if (req.body.like === 0 && sauce.usersLiked.indexOf(req.userId) !== -1){ //Si l'utilisateur annule son like on retire son userId du tableau usersLiked et retire 1 like
				for( let i = 0; i < sauce.usersLiked.length; i++){
					if (sauce.usersLiked[i] === req.userId) {
						sauce.usersLiked.splice(i, 1);
					}
				}
				sauce.likes --;
			}
			else if (req.body.like === -1 && sauce.usersDisliked.indexOf(req.userId) === -1) { //Si l'utilisateur dislike et que le userId n'est pas présent dans usersDisliked, on ajoute son userId et 1 dislike
				sauce.usersDisliked.push(req.userId);
				sauce.dislikes ++;
			}
			else { //Si l'utilisateur annule son dislike on retire son userId du tableau usersDisliked et retire 1 dislike
				for( let i = 0; i < sauce.usersDisliked.length; i++){
					if (sauce.usersDisliked[i] === req.userId) {
						sauce.usersDisliked.splice(i, 1);
					}
				}
				sauce.dislikes --;
			}
			sauce.save();
			res.status(200).json({ message: 'Like/dislike enregistré !'})
		})
		.catch(error => res.status(400).json({ error }));
};	
