const mongoose = require("mongoose")
const Schema = mongoose.Schema

const signupOTPSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		otp: {
			type: String,
			required: true,
			maxLength: 6,
			minLength: 6,
		},
	},
	{ timestamps: true }
)

const SignupOTPSchema = mongoose.model("SignupOTPSchema", signupOTPSchema)

module.exports = SignupOTPSchema
