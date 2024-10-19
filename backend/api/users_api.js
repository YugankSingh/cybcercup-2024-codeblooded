const User = require("../models/user")
const SignUpOTP = require("../models/signupOTP")
const s3Delete = require("../util/multer-s3").delete
const {
	login,
	deleteRefreshToken,
	deleteUserSession,
} = require("../util/session")
const env = require("../util/environment")
const crypto = require("crypto")
const SignupOTPMailer = require("../mailers/signup_otp_mailer")
const speakeasy = require("speakeasy")
const qrcode = require("qrcode")
const MFADetails = require("../models/mfa")
const { hashPassword, checkPassword } = require("../util/password")

//get the sign in data

module.exports.createSession = async (req, res, next) => {
	try {
		let { email, password, totp } = req.body
		// totp = parseInt(totp)
		if (!email || !password || !totp)
			return res
				.status(401)
				.json({ message: "Please provide all of email, password and totp" })

		let user = await User.findOne({ email: email })
		let mfaDetails = await MFADetails.findOne({ email: email })

		if (!mfaDetails) {
			return res.status(401).json({
				message:
					"MFA Details are not found, please contact admin to setup mfa authenticator.",
			})
		}

		if (
			!user ||
			!checkPassword(user.passwordHash, password, user.passwordSalt)
		) {
			return res.status(401).json({
				message: "Invalid Email or Password.",
			})
		}

		const secret = mfaDetails.mfaSecret
		const isValid = speakeasy.totp.verify({
			secret: secret,
			encoding: "base32",
			token: totp,
			step: 30,
			window: 1,
		})


		if (!isValid)
			return res.status(401).json({
				message: "Invalid Authenticator TOTP.",
			})

		await sendSession(req, res, user, "Signed In Successfully")
	} catch (error) {
		next(error)
	}
}

module.exports.destroySession = async (req, res, next) => {
	try {
		// todo take care of refreshToken
		await deleteUserSession(req, res)

		res.clearCookie("sessionKey", {
			httpOnly: true,
			sameSite: "none",
			signed: true,
			// turn this on for it to work in browser
			secure: true,
		})

		return res
			.status(200)
			.json({ message: "Signed Out Successfully", success: true })
	} catch (error) {
		next(error)
	}
}

module.exports.startSession = async (req, res, next) => {
	try {
		if (!req.isAuthenticated) {
			return res.status(200).json({
				message: "You are not logged in",
				isLoggedIn: false,
				success: true,
			})
		}
		let user = await User.findById(req.user.id).select("name email")
		if (!user) {
			return res.status(200).json({
				message: "Error in logging in",
				isLoggedIn: false,
				success: true,
			})
		}
		let userObject = userMongoToUserObject(user)
		return res.status(200).json({
			message: "Here Keep The User Data",
			isLoggedIn: true,
			success: true,
			data: {
				user: userObject,
			},
		})
	} catch (error) {
		next(error)
	}
}

async function registerUser(name, email, password) {
	const { salt, hashedPassword } = await hashPassword(password)
	const user = await User.create({
		name: name,
		email: email,
		passwordHash: hashedPassword,
		passwordSalt: salt,
	})
	return user
}

const getOTPString = () => {
	let otpString = ""
	for (let i = 0; i < 6; i++) otpString += crypto.randomInt(10)
	return otpString
}
module.exports.getOTPAndMFA = async (req, res, next) => {
	try {
		const { email } = req.params
		let user = await User.findOne({ email })
		if (user)
			return res.status(422).json({
				success: false,
				message: "User with this Email ID already exists",
			})
		const otp = getOTPString()
		await SignUpOTP.deleteMany({ email })
		const OTP = await SignUpOTP.create({ email, otp })
		SignupOTPMailer(OTP)

		const secret = speakeasy.generateSecret({
			name: `Traffic Manager (${email})`,
		})


		try {
			await MFADetails.deleteMany({ email: email })
		} catch (error) {}
		await MFADetails.create([{ email: email, mfaSecret: secret.base32 }])

		qrcode.toDataURL(secret.otpauth_url, (err, dataURL) => {
			if (err) {
				return res.status(500).json({ error: "Failed to generate QR code" })
			}

			return res.status(200).json({
				success: true,
				message: `OTP sent successfully, check ${email}, and configure MFA`,
				data: { qrCode: dataURL },
			})
		})
	} catch (error) {
		return next(error)
	}
}

module.exports.create = async (req, res, next) => {
	try {
		const { password, confirmPassword, confirm_password, email, name, otp } =
			req.body
		if (password != confirm_password)
			return res.status(422).json({
				success: false,
				message: "Password and Confirm Password Didn't Match",
			})

		let user = await User.findOne({ email })
		if (user)
			return res.status(422).json({
				success: false,
				message: "User with this Email ID already exists",
			})
		let OTP = await SignUpOTP.findOne({ email })
		if (!OTP)
			return res.status(422).json({
				success: false,
				message: "Seems like the OTP has expired, or doesn't exist",
			})
		if (OTP.otp !== otp)
			return res.status(422).json({
				success: false,
				message:
					"The OTP entered is wrong,\nPlease make sure you are entering the latest OTP",
			})
		if (Date.now() - OTP.createdAt > 1000 * 60 * 10)
			return res.status(422).json({
				success: false,
				message: "The OTP has expired you will have to refill the form.",
			})

		user = await registerUser(name, email, password)
		await sendSession(req, res, user, "Signed Up Successfully")
	} catch (error) {
		return next(error)
	}
}

// you can parse the mongoDB user
let sendSession = async (req, res, user, message) => {
	// don't forget to remove secrets before sending it to the client as resonse

	// todo: change this secret

	await login(req, res, user._id)

	return res.status(200).json({
		message: message,
		data: {
			user: userMongoToUserObject(user),
		},
		success: true,
	})
}

module.exports.update = async (req, res) => {
	try {
		let user = await User.findById(req.user.id).select("-worshippers -gods")
		let msg = ""
		if (req.body.name && req.body.name != "") {
			user.name = req.body.name
		}
		if (req.file) {
			if (user.avatar) {
				s3Delete(user.avatar)
			}
			user.avatar = req.file.s3.key
			user.avatarBlurhash = req.file.s3.blurHash
		}

		var emojiRegex = /^\p{Emoji}$/u
		if (req.body.emoji && req.body.emoji != "") {
			if (emojiRegex.test(req.body.emoji)) user.emoji = req.body.emoji
			else msg += "Invalid Emoji, "
		}
		if (req.body.description && req.body.description != "") {
			if (req.body.description.length < 200)
				user.description = req.body.description
			user.description = req.body.description
		}
		await user.save()
		await sendSession(req, res, user, "Updated Information Successfully")
	} catch (error) {
		next(error)
	}
}

module.exports.get = async (req, res) => {
	try {
		let { userId } = req.params
		let user = await User.findById(userId).select("name email avatar emoji")
		if (!user) {
			return res.status(404).json({
				message: "User Not Found",
			})
		}
		return res.status(200).json({
			message: "Here Keep The User Data",
			success: true,
			data: {
				user: user,
			},
		})
	} catch (error) {
		next(error)
	}
}

module.exports.search = async (req, res) => {
	try {
		let { searchText } = req.params
		if (!searchText)
			return res.status(200).json({
				message: "No Search Text",
				success: true,
				data: {
					result: [],
				},
			})
		const searchRegex = new RegExp(getSearchRegex(searchText), "gi")
		let result = await User.find({ name: searchRegex }).select("name avatar")

		return res.status(200).json({
			message: "Done",
			success: true,
			data: {
				result,
			},
		})
	} catch (error) {
		next(error)
	}
}

function getSearchRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}
function userMongoToUserObject(user) {
	return {
		id: user._id,
		name: user.name,
		email: user.email,
		avatar: user.avatar,
		gods: user.gods,
		emoji: user.emoji,
	}
}
