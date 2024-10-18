const Post = require('../models/post')
const Comment = require('../models/comment')
const Like = require('../models/like')



// note the type of input is changed to body so mind it
module.exports.toggleLike = async (req, res) => {
	try {
		let parent
		let type = req.query.type
		let id = req.query.id

		if(type == 'Post')
			parent = await Post.findById(id).populate('likes')
		else if(type == 'Comment')
			parent = await Comment.findById(id).populate('likes')
		if (!parent)
			return res.status(404).json({
				success: false,
				message: `Seems Like the ${type} does not exist`,
			})

		//check if a like already exists
		let like = await Like.findOne({
			 user: req.user.id,
			 onModel: type,
			 parent: id
		})

		if(like){
			parent.likes.pull(like._id)
			parent.save()
			like.remove()

			return res.status(200).json({
				message: 'Like removed Successfully',
				data: {
					deleted: true
				},
				success: true
			})
		}
		else{
			like = await Like.create({
				user: req.user.id,
				onModel: type,
				parent: parent.id
			})
			parent.likes.push(like._id)
			parent.save()
			return res.status(200).json({
				message: 'Liked Successfully',
				data: {
					deleted: false
				},
				success: true
			})
		}
		
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: 'Internal Server Error'
		})
	}
}