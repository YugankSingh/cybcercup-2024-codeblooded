const Comment = require("../models/comment")
const Post = require("../models/post")
const Like = require("../models/like")


module.exports.fetchCommentsBefore = async (req, res) => {
	try {
		let { beforeTime, number, postID } = req.query
		number = Number(number)
		if (!number || !(number == 5 || number == 7))
			return res
				.status(400)
				.json({ success: false, message: "Invalid number of comments" })
		let comments = await Comment.find({
			post: postID,
			createdAt: { $lt: beforeTime },
		})
			.sort("-createdAt")
			.limit(number)
			.populate({ path: "user", select: "-password -email -worshippers -gods" })
			.populate("likes", "user -_id")
		return res.status(200).json({ success: true, data: { comments } })
	} catch (error) {
		throw error
	}
}

module.exports.create = async (req, res, next) => {
	try {
		let post = await Post.findById(req.body.post)
		if (!post)
			return res.status(404).json({
				success: false,
				message: "Seems Like the post does not exist",
			})

		let comment = await Comment.create({
			content: req.body.content,
			post: req.body.post,
			user: req.user.id,
		})
		post.comments.push(comment)
		post.save()

		comment = await comment.populate({
			path: "user",
			select: "name",
		})

		// checkAndSendLikeEmail(comment)

		return res.status(200).json({
			data: {
				comment: comment,
			},
			success: true,
			message: "Commented Successfully",
		})
	} catch (error) {
		next(error)
	}
}

module.exports.destroy = async (req, res, next) => {
	try {
		let comment = await Comment.findById(req.params.id)

		if (!comment)
			return res.status(404).json({
				success: false,
				message: "Seems Like the comment does not exist",
			})

		if (comment.user == req.user.id) {
			comment.remove()
			await Post.findByIdAndUpdate(comment.post, {
				$pull: { comments: req.params.id },
			})
			await Like.deleteMany({ parent: comment.id })
		} else {
			let post = await Post.findById(comment.post)

			if (post.user == req.user.id) {
				comment.remove()
				await Post.findByIdAndUpdate(comment.post, {
					$pull: { comments: req.params.id },
				})
				await Like.deleteMany({ parent: comment.id })
			} else {
				return res.status(403).json({
					success: false,
					message: "You are not allowed to delete this comment",
				})
			}
		}
		return res.status(200).json({
			data: {
				comment_id: comment._id,
			},
			success: true,
		})
	} catch (error) {
		return next(error)
	}
}
