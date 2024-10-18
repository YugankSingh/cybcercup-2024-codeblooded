const mongoose = require("mongoose")
const Schema = mongoose.Schema

const postSchema = new Schema(
	{
		content: {
			type: String,
			required: true,
		},
		media: [
			{
				key: { type: String, required: true },
				category: { type: String, enum: ["image", "video"], required: true },
				blurhash: { type: String },
			},
		],
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		comments: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Comment",
			},
		],
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Like",
			},
		],
	},
	{
		timestamps: true,
	}
)
postSchema.index({ createdAt: 1 })

const Post = mongoose.model("Post", postSchema)

module.exports = Post
