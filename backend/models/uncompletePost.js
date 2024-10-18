const mongoose = require("mongoose")
const Schema = mongoose.Schema

const minute = 60000;
const uncompletePostSchema = new Schema(
	{
		createdAt: { type: Date, expires: 30*minute, default: Date.now },
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
)

const UncompletePost = mongoose.model("UncompletePost", uncompletePostSchema)

module.exports = UncompletePost
