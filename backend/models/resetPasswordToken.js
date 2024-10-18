const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const minute = 60000;
const resetPasswordTokenSchema = new Schema({
	createdAt: { type: Date, expires: 10*minute, default: Date.now },
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		unique: true
	},
	hash:{
		type: String,
		required: true,
	},
}, {timestamps: true});


const ResetPasswordTokenSchema = mongoose.model('ResetPasswordTokenSchema', resetPasswordTokenSchema);

module.exports = ResetPasswordTokenSchema;