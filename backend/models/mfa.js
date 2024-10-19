const mongoose = require("mongoose")
const Schema = mongoose.Schema

const mfaDetailsSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		mfaSecret: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
)

const MFADetailSchema = mongoose.model("MFADetailSchema", mfaDetailsSchema)

module.exports = MFADetailSchema
