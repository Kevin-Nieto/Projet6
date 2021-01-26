const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//Model de l'utilisateur, pour qu'il puisse se connecter
const userSchema = mongoose.Schema({
	email: {type: String, require: true, unique: true},
	password: {type: String, require: true}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);