const sendForgotPasswordMail = require("../mailers/forgot_password_mailer")
const User = require("../models/user")
const ResetPasswordToken = require("../models/resetPasswordToken")

module.exports.sendMail = async (req, res, next) => {
	try {
		let { email } = req.params
		let user = await User.findOne({ email })
		if (!user) {
			res.status(403).json({
				message:
					"Oops Seems like the email ID is not yet signed up with us\nOr probably its a TYPO IDK :|",
				success: false,
			})
			return res.redirect("back")
		}
		await ResetPasswordToken.deleteOne({ user: user.id })

		let resetPasswordToken = await ResetPasswordToken.create({
			user: user,
			hash: require("crypto").randomBytes(128).toString("hex"),
		})
		sendForgotPasswordMail(resetPasswordToken)

		return res.status(200).json({
			success: true,
		})
	} catch (error) {
		next(error)
	}
}

module.exports.reset = async (req, res, next) => {
	try {
		const {
			user_id: userID,
			token: tokenHash,
			password,
			confirm_password,
		} = req.body
		let token = await ResetPasswordToken.findOne({
			user: userID,
		})
		if (!token)
			return res.status(400).json({
				message: "The User ID is invalid,\nor the token is already used.",
				success: false,
			})
		if (token.hash != tokenHash) {
			return res.status(403).json({
				message: "Oops Seems like the token you sent us is invalid.",
				success: false,
			})
		}
		if (password != confirm_password) {
			return res
				.status(403)
				.json({ success: true, message: "Both Passwords do not match" })
		}

		token.remove()
		if ((Date.now() - token.createdAt) / (1000 * 60) > 10) {
			return res.status(403).json({
				message: "Sorry, You are late,\nYour token expired",
				success: false,
			})
		}
		await User.findByIdAndUpdate(userID, { password })
		return res.status(200).json({ success: true })
	} catch (error) {
		next(error)
	}
}
