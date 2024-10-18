const mongoose = require("mongoose")
const Schema = mongoose.Schema

const refreshTokenSchema = new Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		created: { type: Date, default: Date.now },
	},
	{ timestamps: true }
)

const RefreshTokenSchema = mongoose.model(
	"RefreshTokenSchema",
	refreshTokenSchema
)

module.exports = RefreshTokenSchema
