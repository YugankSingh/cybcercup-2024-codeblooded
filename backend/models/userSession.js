const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSessionSchema = new Schema(
	{
		sessionKey: {
			type: String,
			required: "true",
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		clientAgent: {
			type: String,
			required: true,
		},
		macAddress: {
			type: String,
			required: true,
		},
		ipAddress: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
)

const UserSessionSchema = mongoose.model("UserSessionSchema", userSessionSchema)

module.exports = UserSessionSchema
