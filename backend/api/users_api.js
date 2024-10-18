const User = require("../models/user")
const SignUpOTP = require("../models/signupOTP")
const s3Delete = require("../config/multer-s3").delete
const returnPostsBefore = require("./posts_api").returnPostsBefore
const { login, deleteRefreshToken } = require("../config/jwt-authentication")
const { OAuth2Client } = require("google-auth-library")
const env = require("../config/environment")
const client = new OAuth2Client(env.google_client_id)
const crypto = require("crypto")
const SignupOTPMailer = require("../mailers/signup_otp_mailer")

//get the sign in data

module.exports.createSession = async (req, res, next) => {
	try {
		let user = await User.findOne({ email: req.body.email }).populate(
			"gods",
			"name avatar"
		)

		if (!user || user.password != req.body.password) {
			return res.status(401).json({
				message: "Invalid Email or Password",
			})
		}
		await sendSession(req, res, user, "Signed In Successfully")
	} catch (error) {
		next(error)
	}
}

async function verifyGoogleToken(token) {
	try {
		console.log(env.google_client_id)
		console.log(token)

		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: env.google_client_id,
		})
		const payload = ticket.getPayload()
		return payload
	} catch (error) {
		console.error(error)
		return false
	}
}

module.exports.googleLogin = async (req, res, next) => {
	try {
		const googleToken = req.body.token

		const payload = await verifyGoogleToken(googleToken)
		if (!payload)
			return res.status(403).json({
				message: "Invalid Google Token",
				success: false,
			})

		let { email, name } = payload
		let user = await User.findOne({ email }).populate("gods", "name avatar")

		if (!user) {
			// register the user
			user = await registerUser(
				name,
				email,
				crypto.randomBytes(40).toString("hex")
			)
		}
		await sendSession(req, res, user, "Signed In Successfully")
	} catch (error) {
		next(error)
	}
}

module.exports.destroySession = async (req, res, next) => {
	try {
		// todo take care of refreshToken
		await deleteRefreshToken(req, res)

		res.clearCookie("accessToken", {
			httpOnly: true,
			sameSite: "none",
			signed: true,
			// turn this on for it to work in browser
			secure: true,
		})
		res.clearCookie("refreshToken", {
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
		let posts = await returnPostsBefore(new Date())
		if (!req.isAuthenticated) {
			return res.status(200).json({
				message: "You are not logged in",
				isLoggedIn: false,
				success: true,
				data: {
					posts: posts,
				},
			})
		}
		let user = await User.findById(req.user.id)
			.select("name email avatar emoji gods")
			.populate("gods", "name avatar emoji")
		if (!user) {
			return res.status(200).json({
				message: "Error in logging in",
				isLoggedIn: false,
				success: true,
				data: {
					posts: posts,
				},
			})
		}
		let userObject = userMongoToUserObject(user)
		return res.status(200).json({
			message: "Here Keep The User Data",
			isLoggedIn: true,
			success: true,
			data: {
				user: userObject,
				posts: posts,
			},
		})
	} catch (error) {
		next(error)
	}
}

async function registerUser(name, email, password) {
	let emojis = [
		"😄",
		"😃",
		"😀",
		"😊",
		"☺",
		"😉",
		"😍",
		"😘",
		"😚",
		"😗",
		"😙",
		"😜",
		"😝",
		"😛",
		"😳",
		"😁",
		"😔",
		"😌",
		"😒",
		"😞",
		"😣",
		"😢",
		"😂",
		"😭",
		"😪",
		"😥",
		"😰",
		"😅",
		"😓",
		"😩",
		"😫",
		"😨",
		"😱",
		"😠",
		"😡",
		"😤",
		"😖",
		"😆",
		"😋",
		"😷",
		"😎",
		"😴",
		"😵",
		"😲",
		"😟",
		"😦",
		"😧",
		"😈",
		"👿",
		"😮",
		"😬",
		"😐",
		"😕",
		"😯",
		"😶",
		"😇",
		"😏",
		"😑",
		"👲",
		"👳",
		"👮",
		"👷",
		"💂",
		"👶",
		"👦",
		"👧",
		"👨",
		"👩",
		"👴",
		"👵",
		"👱",
		"👼",
		"👸",
		"😺",
		"😸",
		"😻",
		"😽",
		"😼",
		"🙀",
		"😿",
		"😹",
		"😾",
		"👹",
		"👺",
		"🙈",
		"🙉",
		"🙊",
		"💀",
		"👽",
		"💩",
		"🔥",
		"✨",
		"🌟",
		"💫",
		"💥",
		"💢",
		"💦",
		"💧",
		"💤",
		"💨",
		"👂",
		"👀",
		"👃",
		"👅",
		"👄",
		"👍",
		"👎",
		"👌",
		"👊",
		"✊",
		"✌",
		"👋",
		"✋",
		"👐",
		"👆",
		"👇",
		"👉",
		"👈",
		"🙌",
		"🙏",
		"☝",
		"👏",
		"💪",
		"🚶",
		"🏃",
		"💃",
		"👫",
		"👪",
		"👬",
		"👭",
		"💏",
		"💑",
		"👯",
		"🙆",
		"🙅",
		"💁",
		"🙋",
		"💆",
		"💇",
		"💅",
		"👰",
		"🙎",
		"🙍",
		"🙇",
		"🎩",
		"👑",
		"👒",
		"👟",
		"👞",
		"👡",
		"👠",
		"👢",
		"👕",
		"👔",
		"👚",
		"👗",
		"🎽",
		"👖",
		"👘",
		"👙",
		"💼",
		"👜",
		"👝",
		"👛",
		"👓",
		"🎀",
		"🌂",
		"💄",
		"💛",
		"💙",
		"💜",
		"💚",
		"❤",
		"💔",
		"💗",
		"💓",
		"💕",
		"💖",
		"💞",
		"💘",
		"💌",
		"💋",
		"💍",
		"💎",
		"👤",
		"👥",
		"💬",
		"👣",
		"💭",
		"🐶",
		"🐺",
		"🐱",
		"🐭",
		"🐹",
		"🐰",
		"🐸",
		"🐯",
		"🐨",
		"🐻",
		"🐷",
		"🐽",
		"🐮",
		"🐗",
		"🐵",
		"🐒",
		"🐴",
		"🐑",
		"🐘",
		"🐼",
		"🐧",
		"🐦",
		"🐤",
		"🐥",
		"🐣",
		"🐔",
		"🐍",
		"🐢",
		"🐛",
		"🐝",
		"🐜",
		"🐞",
		"🐌",
		"🐙",
		"🐚",
		"🐠",
		"🐟",
		"🐬",
		"🐳",
		"🐋",
		"🐄",
		"🐏",
		"🐀",
		"🐃",
		"🐅",
		"🐇",
		"🐉",
		"🐎",
		"🐐",
		"🐓",
		"🐕",
		"🐖",
		"🐁",
		"🐂",
		"🐲",
		"🐡",
		"🐊",
		"🐫",
		"🐪",
		"🐆",
		"🐈",
		"🐩",
		"🐾",
		"💐",
		"🌸",
		"🌷",
		"🍀",
		"🌹",
		"🌻",
		"🌺",
		"🍁",
		"🍃",
		"🍂",
		"🌿",
		"🌾",
		"🍄",
		"🌵",
		"🌴",
		"🌲",
		"🌳",
		"🌰",
		"🌱",
		"🌼",
		"🌐",
		"🌞",
		"🌝",
		"🌚",
		"🌑",
		"🌒",
		"🌓",
		"🌔",
		"🌕",
		"🌖",
		"🌗",
		"🌘",
		"🌜",
		"🌛",
		"🌙",
		"🌍",
		"🌎",
		"🌏",
		"🌋",
		"🌌",
		"🌠",
		"⭐",
		"☀",
		"⛅",
		"☁",
		"⚡",
		"☔",
		"❄",
		"⛄",
		"🌀",
		"🌁",
		"🌈",
		"🌊",
		"🎍",
		"💝",
		"🎎",
		"🎒",
		"🎓",
		"🎏",
		"🎆",
		"🎇",
		"🎐",
		"🎑",
		"🎃",
		"👻",
		"🎅",
		"🎄",
		"🎁",
		"🎋",
		"🎉",
		"🎊",
		"🎈",
		"🎌",
		"🔮",
		"🎥",
		"📷",
		"📹",
		"📼",
		"💿",
		"📀",
		"💽",
		"💾",
		"💻",
		"📱",
		"☎",
		"📞",
		"📟",
		"📠",
		"📡",
		"📺",
		"📻",
		"🔊",
		"🔉",
		"🔈",
		"🔇",
		"🔔",
		"🔕",
		"📢",
		"📣",
		"⏳",
		"⌛",
		"⏰",
		"⌚",
		"🔓",
		"🔒",
		"🔏",
		"🔐",
		"🔑",
		"🔎",
		"💡",
		"🔦",
		"🔆",
		"🔅",
		"🔌",
		"🔋",
		"🔍",
		"🛁",
		"🛀",
		"🚿",
		"🚽",
		"🔧",
		"🔩",
		"🔨",
		"🚪",
		"🚬",
		"💣",
		"🔫",
		"🔪",
		"💊",
		"💉",
		"💰",
		"💴",
		"💵",
		"💷",
		"💶",
		"💳",
		"💸",
		"📲",
		"📧",
		"📥",
		"📤",
		"✉",
		"📩",
		"📨",
		"📯",
		"📫",
		"📪",
		"📬",
		"📭",
		"📮",
		"📦",
		"📝",
		"📄",
		"📃",
		"📑",
		"📊",
		"📈",
		"📉",
		"📜",
		"📋",
		"📅",
		"📆",
		"📇",
		"📁",
		"📂",
		"✂",
		"📌",
		"📎",
		"✒",
		"✏",
		"📏",
		"📐",
		"📕",
		"📗",
		"📘",
		"📙",
		"📓",
		"📔",
		"📒",
		"📚",
		"📖",
		"🔖",
		"📛",
		"🔬",
		"🔭",
		"📰",
		"🎨",
		"🎬",
		"🎤",
		"🎧",
		"🎼",
		"🎵",
		"🎶",
		"🎹",
		"🎻",
		"🎺",
		"🎷",
		"🎸",
		"👾",
		"🎮",
		"🃏",
		"🎴",
		"🀄",
		"🎲",
		"🎯",
		"🏈",
		"🏀",
		"⚽",
		"⚾",
		"🎾",
		"🎱",
		"🏉",
		"🎳",
		"⛳",
		"🚵",
		"🚴",
		"🏁",
		"🏇",
		"🏆",
		"🎿",
		"🏂",
		"🏊",
		"🏄",
		"🎣",
		"☕",
		"🍵",
		"🍶",
		"🍼",
		"🍺",
		"🍻",
		"🍸",
		"🍹",
		"🍷",
		"🍴",
		"🍕",
		"🍔",
		"🍟",
		"🍗",
		"🍖",
		"🍝",
		"🍛",
		"🍤",
		"🍱",
		"🍣",
		"🍥",
		"🍙",
		"🍘",
		"🍚",
		"🍜",
		"🍲",
		"🍢",
		"🍡",
		"🍳",
		"🍞",
		"🍩",
		"🍮",
		"🍦",
		"🍨",
		"🍧",
		"🎂",
		"🍰",
		"🍪",
		"🍫",
		"🍬",
		"🍭",
		"🍯",
		"🍎",
		"🍏",
		"🍊",
		"🍋",
		"🍒",
		"🍇",
		"🍉",
		"🍓",
		"🍑",
		"🍈",
		"🍌",
		"🍐",
		"🍍",
		"🍠",
		"🍆",
		"🍅",
		"🌽",
		"🏠",
		"🏡",
		"🏫",
		"🏢",
		"🏣",
		"🏥",
		"🏦",
		"🏪",
		"🏩",
		"🏨",
		"💒",
		"⛪",
		"🏬",
		"🏤",
		"🌇",
		"🌆",
		"🏯",
		"🏰",
		"⛺",
		"🏭",
		"🗼",
		"🗾",
		"🗻",
		"🌄",
		"🌅",
		"🌃",
		"🗽",
		"🌉",
		"🎠",
		"🎡",
		"⛲",
		"🎢",
		"🚢",
		"⛵",
		"🚤",
		"🚣",
		"⚓",
		"🚀",
		"✈",
		"💺",
		"🚁",
		"🚂",
		"🚊",
		"🚉",
		"🚞",
		"🚆",
		"🚄",
		"🚅",
		"🚈",
		"🚇",
		"🚝",
		"🚋",
		"🚃",
		"🚎",
		"🚌",
		"🚍",
		"🚙",
		"🚘",
		"🚗",
		"🚕",
		"🚖",
		"🚛",
		"🚚",
		"🚨",
		"🚓",
		"🚔",
		"🚒",
		"🚑",
		"🚐",
		"🚲",
		"🚡",
		"🚟",
		"🚠",
		"🚜",
		"💈",
		"🚏",
		"🎫",
		"🚦",
		"🚥",
		"⚠",
		"🚧",
		"🔰",
		"⛽",
		"🏮",
		"🎰",
		"♨",
		"🗿",
		"🎪",
		"🎭",
		"📍",
		"🚩",
		"⬆",
		"⬇",
		"⬅",
		"➡",
		"🔠",
		"🔡",
		"🔤",
		"↗",
		"↖",
		"↘",
		"↙",
		"↔",
		"↕",
		"🔄",
		"◀",
		"▶",
		"🔼",
		"🔽",
		"↩",
		"↪",
		"ℹ",
		"⏪",
		"⏩",
		"⏫",
		"⏬",
		"⤵",
		"⤴",
		"🆗",
		"🔀",
		"🔁",
		"🔂",
		"🆕",
		"🆙",
		"🆒",
		"🆓",
		"🆖",
		"📶",
		"🎦",
		"🈁",
		"🈯",
		"🈳",
		"🈵",
		"🈴",
		"🈲",
		"🉐",
		"🈹",
		"🈺",
		"🈶",
		"🈚",
		"🚻",
		"🚹",
		"🚺",
		"🚼",
		"🚾",
		"🚰",
		"🚮",
		"🅿",
		"♿",
		"🚭",
		"🈷",
		"🈸",
		"🈂",
		"Ⓜ",
		"🛂",
		"🛄",
		"🛅",
		"🛃",
		"🉑",
		"㊙",
		"㊗",
		"🆑",
		"🆘",
		"🆔",
		"🚫",
		"🔞",
		"📵",
		"🚯",
		"🚱",
		"🚳",
		"🚷",
		"🚸",
		"⛔",
		"✳",
		"❇",
		"❎",
		"✅",
		"✴",
		"💟",
		"🆚",
		"📳",
		"📴",
		"🅰",
		"🅱",
		"🆎",
		"🅾",
		"💠",
		"➿",
		"♻",
		"♈",
		"♉",
		"♊",
		"♋",
		"♌",
		"♍",
		"♎",
		"♏",
		"♐",
		"♑",
		"♒",
		"♓",
		"⛎",
		"🔯",
		"🏧",
		"💹",
		"💲",
		"💱",
		"©",
		"®",
		"™",
		"〽",
		"〰",
		"🔝",
		"🔚",
		"🔙",
		"🔛",
		"🔜",
		"❌",
		"⭕",
		"❗",
		"❓",
		"❕",
		"❔",
		"🔃",
		"🕛",
		"🕧",
		"🕐",
		"🕜",
		"🕑",
		"🕝",
		"🕒",
		"🕞",
		"🕓",
		"🕟",
		"🕔",
		"🕠",
		"🕕",
		"🕖",
		"🕗",
		"🕘",
		"🕙",
		"🕚",
		"🕡",
		"🕢",
		"🕣",
		"🕤",
		"🕥",
		"🕦",
		"✖",
		"➕",
		"➖",
		"➗",
		"♠",
		"♥",
		"♣",
		"♦",
		"💮",
		"💯",
		"✔",
		"☑",
		"🔘",
		"🔗",
		"➰",
		"🔱",
		"🔲",
		"🔳",
		"◼",
		"◻",
		"◾",
		"◽",
		"▪",
		"▫",
		"🔺",
		"⬜",
		"⬛",
		"⚫",
		"⚪",
		"🔴",
		"🔵",
		"🔻",
		"🔶",
		"🔷",
		"🔸",
		"🔹",
	]
	let emoji = emojis[Math.floor(Math.random() * emojis.length)]
	let descriptions = [
		"Yo I am a Hoomann",
		"Hey This was not written by me",
		"World is an awesome place",
		"I love you 3000 x 3000, therefore I love you 9000000",
		"I can't come up with new descriptions",
		"Hello There, You look good",
		"Wooooo HOOOOO, The world is amazin",
		"I am in love with this",
		"I drink dihydrogen peroxide",
		"My god I can write some really good descriptions",
		"I am a god",
		"I am wonderfull, and so are you",
		"Love Yo4u Baby",
		"?????????",
		"Call me at my private number, 😉",
		"I am improving my goldfishes, health by giving him/her a cycle",
		"I wonder do unicorns really exists",
		"Just kept my tooth under the pillow, waiting for my reward",
		"I am lovely",
		"Fuck Y'all hater's, but you know what, you are amazin",
	]
	let description =
		descriptions[Math.floor(Math.random() * descriptions.length)]

	const user = await User.create({
		name: name,
		email: email,
		password: password,
		emoji,
		description,
		worshippers: [],
		gods: [],
		avatar: `https://avatars.dicebear.com/api/micah/${(Math.random() + 1)
			.toString(36)
			.substring(3)}.jpg`,
	})
	return user
}

const getOTPString = () => {
	let otpString = ""
	for (let i = 0; i < 6; i++) otpString += crypto.randomInt(10)
	return otpString
}
module.exports.getOTP = async (req, res, next) => {
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
		return res
			.status(200)
			.json({ success: true, message: `OTP sent successfully, check ${email}` })
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

	await login(res, user._id)

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
