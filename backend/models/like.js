const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const likeSchema = new Schema({
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	//this defines object ID of the liked object
	parent: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		refPath: 'onModel'
	},
	// this field is used for defining the type of the liked object since this is a dynamic reference
	onModel: {
		type: String,
		required: true,
		enum: ['Post', 'Comment']
	},
},{
	timestamps: true
});


const Like = mongoose.model('Like', likeSchema);

module.exports = Like;