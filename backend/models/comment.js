const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema({
	content:{
		type: String,
		required: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post',
		required: true
	},
	likes: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Like'
	}]
},{
	timestamps: true
})


let Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment;