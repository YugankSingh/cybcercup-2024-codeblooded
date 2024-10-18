const mongoose = require("mongoose")
const multer = require("multer")
const path = require("path")
const AVATAR_PATH = "/uploads/users/avatar"
const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		emoji: {
			type: String,
		},
		avatar: {
			type: String,
		},
		avatarBlurhash: {
			type: String,
		},
		worshippers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				index: true,
			},
		],
		gods: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				index: true,
			},
		],
		description: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
).index({ name: "text" })

let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, "..", AVATAR_PATH))
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now())
	},
})

// static methods
userSchema.statics.uploadAvatar = multer({ storage: storage }).single("avatar")
userSchema.statics.avatarPath = AVATAR_PATH

const User = mongoose.model("User", userSchema)

module.exports = User
